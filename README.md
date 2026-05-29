# 📊 销售聊天记录分析系统

基于 DeepSeek 大模型的销售对话智能分析工具，帮助销售团队快速定位问题对话、生成客户画像与个性化攻略。

## ✨ 核心功能

### 🔍 问题对话诊断
- 自动识别销售话术中的问题
- 按严重程度（高/中/低）分类
- 提供具体改进建议和优化话术

### 👤 客户画像生成
- 多维度分析客户特征：性格、沟通风格、需求偏好
- 判断客户决策角色、兴趣程度、紧迫度
- 识别客户痛点和异议

### 🎯 个性化销售攻略
- 量身定制跟进策略
- 提供话术模板库
- 评估成交概率和周期
- 给出下一步行动建议

## 🚀 快速开始

### 1. 环境准备

**后端：**
- Python 3.10+
- Tesseract OCR（可选，用于图片文字提取）

**前端：**
- Node.js 18+

### 2. 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置 API Key（二选一）
# 方式A：创建 .env 文件
cp .env.example .env
# 编辑 .env，填入你的 DEEPSEEK_API_KEY

# 方式B：在前端页面的 API 设置中直接输入

# 启动后端服务
python main.py
# 服务启动在 http://localhost:8000
```

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 服务启动在 http://localhost:5173
```

### 4. 使用

1. 打开浏览器访问 `http://localhost:5173`
2. 上传聊天记录文件（支持图片截图、PDF、Word、TXT）
3. 或直接粘贴聊天文本
4. 点击「开始智能分析」
5. 查看分析结果：
   - **问题分析**：查看有问题的对话及改进建议
   - **客户画像**：了解客户特征和需求
   - **销售攻略**：获取个性化跟进策略

## 📁 项目结构

```
sales-chat-analyzer/
├── backend/
│   ├── main.py            # FastAPI 后端服务
│   ├── requirements.txt   # Python 依赖
│   ├── .env.example       # 环境变量模板
│   └── uploads/           # 上传文件存储
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # 主应用
│   │   ├── components/
│   │   │   ├── UploadPanel.tsx        # 上传面板
│   │   │   ├── AnalysisResult.tsx     # 问题分析结果
│   │   │   ├── CustomerProfile.tsx    # 客户画像卡片
│   │   │   └── StrategyPanel.tsx      # 销售攻略面板
│   │   ├── api/index.ts              # API 接口
│   │   ├── types/index.ts            # TypeScript 类型
│   │   ├── main.tsx                   # 入口
│   │   └── index.css                  # 全局样式
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Tailwind CSS + Vite |
| 后端 | Python FastAPI |
| AI模型 | DeepSeek (deepseek-chat / deepseek-reasoner) |
| 图标 | Lucide React |

## 📝 支持的文件格式

| 格式 | 说明 |
|------|------|
| 📷 JPG/PNG/GIF/WEBP | 聊天截图，支持视觉分析 |
| 📄 PDF | PDF文档文本提取 |
| 📝 DOCX/DOC | Word文档文本提取 |
| 📋 TXT/CSV/MD | 纯文本聊天记录 |

## ⚙️ 配置说明

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | - |
| `DEEPSEEK_BASE_URL` | API地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 模型名称 | `deepseek-chat` |

> 💡 API Key 也可以在页面上的「API设置」中直接输入，无需修改 .env 文件。

