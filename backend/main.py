"""
销售聊天记录分析系统 - 后端服务
通过DeepSeek大模型分析销售聊天记录，发现问题对话、生成客户画像和销售攻略
"""

import os
import json
import base64
import re
import logging
from typing import Optional, List
from datetime import datetime

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="销售聊天记录分析系统",
    description="利用大语言模型深度分析销售对话",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_deepseek_client(api_key: Optional[str] = None):
    key = api_key or os.getenv("DEEPSEEK_API_KEY", "")
    base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
    if not key:
        raise HTTPException(status_code=400, detail="请提供DeepSeek API Key")
    return OpenAI(api_key=key, base_url=base_url)


def extract_text_from_docx(file_path: str) -> str:
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    except Exception as e:
        logger.error(f"提取Word文本失败: {e}")
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            pt = page.extract_text()
            if pt:
                text += pt + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"提取PDF文本失败: {e}")
        return ""


def extract_text_from_image(file_path: str) -> str:
    try:
        from PIL import Image
        import pytesseract
        img = Image.open(file_path)
        return pytesseract.image_to_string(img, lang='chi_sim+eng').strip()
    except ImportError:
        logger.warning("pytesseract未安装")
        return ""
    except Exception as e:
        logger.error(f"OCR失败: {e}")
        return ""


def image_to_base64(file_path: str) -> tuple:
    import io
    from PIL import Image
    mime_map = {
        ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
        ".png": "image/png", ".gif": "image/gif",
        ".webp": "image/webp", ".bmp": "image/bmp"
    }
    ext = os.path.splitext(file_path)[1].lower()
    mime_type = mime_map.get(ext, "image/jpeg")
    img = Image.open(file_path)
    max_size = (1920, 1920)
    needs_resize = img.size[0] > max_size[0] or img.size[1] > max_size[1]
    if needs_resize:
        img.thumbnail(max_size, Image.LANCZOS)

    src_fmt = (img.format or "JPEG").upper()
    if src_fmt == "JPEG" and not needs_resize:
        with open(file_path, "rb") as f:
            b64_data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:{mime_type};base64,{b64_data}", mime_type

    buffer = io.BytesIO()
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(buffer, format="JPEG", quality=85)
    b64_data = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:{mime_type};base64,{b64_data}", mime_type


# Registry: extension → (file_path, content_bytes) → extracted text
DOC_EXTRACTORS = {
    ".pdf": lambda fp, _: extract_text_from_pdf(fp),
    ".docx": lambda fp, _: extract_text_from_docx(fp),
    ".doc": lambda fp, _: extract_text_from_docx(fp),
    ".txt": lambda _, c: c.decode("utf-8", errors="ignore"),
    ".csv": lambda _, c: c.decode("utf-8", errors="ignore"),
    ".md": lambda _, c: c.decode("utf-8", errors="ignore"),
}

ALLOWED_IMAGES = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}


async def process_uploaded_file(file: UploadFile) -> dict:
    ext = os.path.splitext(file.filename or "")[1].lower()
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    result = {"filename": file.filename, "file_type": ext, "text": "", "images": []}
    if ext in ALLOWED_IMAGES:
        data_url, mime_type = image_to_base64(file_path)
        result["images"].append({"data_url": data_url, "mime_type": mime_type})
        ocr_text = extract_text_from_image(file_path)
        if ocr_text:
            result["text"] = ocr_text
    elif ext in DOC_EXTRACTORS:
        result["text"] = DOC_EXTRACTORS[ext](file_path, content)
    return result


SYSTEM_PROMPT = """你是一位拥有20年经验的顶级销售教练和客户心理分析师。你的任务是对销售聊天记录进行手术刀般精准的深度剖析。

请严格按照以下JSON格式返回分析结果：

{
  "problem_analysis": [
    {
      "scene_title": "简短描述这个对话场景（如：初次询价阶段、客户提出异议、销售急于逼单等）",
      "scene_summary": "1-2句话概述这个场景发生了什么",
      "severity": "高/中/低",
      "conversation": [
        {"role": "销售", "content": "消息内容", "is_problematic": false},
        {"role": "客户", "content": "消息内容", "is_problematic": false},
        {"role": "销售", "content": "有问题的这句话", "is_problematic": true},
        {"role": "客户", "content": "客户的后续反应", "is_problematic": false}
      ],
      "problematic_index": 2,
      "root_cause_analysis": {
        "category": "问题类型（如：需求挖掘不足/急于成交/缺乏同理心/未处理异议/价值传递失败/沟通节奏不当/话术模板化/未建立信任/跟进时机错误）",
        "why_it_happened": "深层次分析为什么销售会犯这个错误（200-400字）。从销售心理、经验不足、对客户心理的误判、缺乏销售框架等多个维度深入剖析。要像心理医生一样诊断问题的根源，不要停留在表面描述。",
        "underlying_psychology": "从客户心理学角度分析，这个错误触发了客户的什么心理反应（如：防御心理、不信任感、被推销感等）"
      },
      "problem_detail": "具体描述这个问题的表现（100-200字），精确指出哪句话、哪个词出了问题，以及为什么这样说是错误的",
      "negative_impact": "如果不改进这个问题，在后续沟通中可能导致的连锁负面影响",
      "solution": {
        "core_principle": "解决这个问题的核心原则（一句话概括）",
        "why_this_works": "为什么这个方案有效（从销售心理学角度解释，100-150字）",
        "techniques_used": ["运用到的话术技巧1", "技巧2"],
        "improved_conversation": [
          {"role": "销售", "content": "优化后的完整对话（不仅是改一句，而是重写整个场景的对话）"},
          {"role": "客户", "content": "预期客户可能的回复"},
          {"role": "销售", "content": "继续优化后的跟进"}
        ]
      },
      "key_takeaway": "销售从中应学到的最重要的一个教训（20字以内）"
    }
  ],
  "customer_profile": {
    "name_or_nickname": "客户称呼",
    "gender_guess": "男/女/未知",
    "age_range": "年龄段",
    "occupation_or_industry": "职业或行业",
    "personality_traits": ["特点1", "特点2"],
    "communication_style": "50-100字描述沟通风格",
    "core_needs": ["核心需求"],
    "pain_points": ["痛点"],
    "objections": ["异议"],
    "budget_sensitivity": "高/中/低/未知",
    "decision_power": "决策者/影响者/信息收集者/未知",
    "interest_level": "高/中/低",
    "urgency": "紧急/一般/不急/未知",
    "trust_level": "高/中/低/未知"
  },
  "sales_strategy": {
    "overall_assessment": "整体评估（100-200字）",
    "recommended_approach": "推荐策略",
    "key_talking_points": ["要点"],
    "suggested_questions": ["建议提问"],
    "value_propositions": ["价值主张"],
    "avoid_topics": ["避免话题"],
    "next_action": "下一步行动",
    "reply_templates": [{"scenario": "场景", "suggested_reply": "话术"}],
    "success_probability": "预估成交概率",
    "estimated_timeline": "预计成交周期"
  }
}

分析原则：
1. 每个problem_analysis对应一段有问题的对话场景，conversation数组呈现完整上下文
2. is_problematic=true 标记的那条消息就是问题所在，在对话中直观标注
3. root_cause_analysis要深挖到心理层面和行为模式，不是简单说"话术不好"
4. solution中的improved_conversation要重写整个场景的对话，比原版明显更好
5. 所有分析要基于对话内容，不要凭空编造
6. 重要：只返回纯JSON，不要包含任何markdown代码块标记或其他解释文字"""


def parse_llm_response(response_text: str) -> dict:
    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        pass
    m = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response_text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    brace_count = 0
    start_idx = -1
    for i, ch in enumerate(response_text):
        if ch == '{':
            if brace_count == 0:
                start_idx = i
            brace_count += 1
        elif ch == '}':
            brace_count -= 1
            if brace_count == 0 and start_idx >= 0:
                try:
                    return json.loads(response_text[start_idx:i+1])
                except json.JSONDecodeError:
                    continue
    logger.warning("无法解析LLM JSON返回")
    return {
        "error": "JSON解析失败",
        "raw_response": response_text,
        "problem_analysis": [],
        "customer_profile": {},
        "sales_strategy": {}
    }


async def analyze_with_deepseek(chat_text: str, images: list, api_key: str, model: str) -> dict:
    client = get_deepseek_client(api_key)
    model_name = model or os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

    if images:
        user_content = []
        for img in images:
            user_content.append({"type": "image_url", "image_url": {"url": img["data_url"]}})
        text_prompt = f"请分析以下销售聊天记录：\n\n---\n{chat_text if chat_text else '（聊天内容见图片）'}\n---\n\n请严格按照JSON格式返回。只返回JSON。"
        user_content.append({"type": "text", "text": text_prompt})
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content}
        ]
    else:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"请分析以下销售聊天记录：\n\n---\n{chat_text}\n---\n\n请严格按照JSON格式返回。只返回JSON。"}
        ]

    logger.info(f"调用DeepSeek: {model_name}")

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.3,
            max_tokens=8192,
            timeout=120
        )
        response_text = response.choices[0].message.content or ""
        logger.info(f"DeepSeek返回成功, tokens: {response.usage}")
        result = parse_llm_response(response_text)
        result["_meta"] = {
            "model": model_name,
            "tokens_used": {
                "prompt": response.usage.prompt_tokens if response.usage else 0,
                "completion": response.usage.completion_tokens if response.usage else 0,
                "total": response.usage.total_tokens if response.usage else 0
            }
        }
        return result
    except Exception as e:
        logger.error(f"DeepSeek调用失败: {e}")
        raise HTTPException(status_code=500, detail=f"AI分析失败: {str(e)}")


class AnalyzeResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None


@app.get("/")
async def root():
    return {"service": "销售聊天记录分析系统", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_chat(
    files: List[UploadFile] = File(default=[]),
    chat_text: str = Form(default=""),
    api_key: str = Form(default=""),
    model: str = Form(default="")
):
    if not files and not chat_text.strip():
        raise HTTPException(status_code=400, detail="请上传文件或输入聊天文本")

    all_text = chat_text or ""
    all_images = []

    for file in files:
        if not file.filename:
            continue
        try:
            processed = await process_uploaded_file(file)
            if processed["text"]:
                all_text += f"\n\n=== {processed['filename']} ===\n{processed['text']}"
            if processed["images"]:
                all_images.extend(processed["images"])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"文件处理失败: {str(e)}")

    if not all_text.strip() and not all_images:
        raise HTTPException(status_code=400, detail="未能提取到有效内容")

    max_chars = 50000
    if len(all_text) > max_chars:
        all_text = all_text[:max_chars] + "\n\n...（内容过长已截断）"

    key = api_key.strip() or None
    model_name = model.strip() or None

    result = await analyze_with_deepseek(all_text, all_images, key, model_name)
    return AnalyzeResponse(success=True, data=result)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"异常: {exc}")
    return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

