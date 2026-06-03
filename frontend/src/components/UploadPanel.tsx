import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, X, Image, File, AlertCircle } from 'lucide-react'

interface UploadPanelProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  chatText: string
  onChatTextChange: (text: string) => void
  apiKey: string
  onApiKeyChange: (key: string) => void
  model: string
  onModelChange: (model: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export default function UploadPanel({
  files,
  onFilesChange,
  chatText,
  onChatTextChange,
  apiKey,
  onApiKeyChange,
  model,
  onModelChange,
  onAnalyze,
  isAnalyzing,
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    onFilesChange([...files, ...droppedFiles])
  }, [files, onFilesChange])

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange([...files, ...Array.from(e.target.files)])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [files, onFilesChange])

  const removeFile = useCallback((index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }, [files, onFilesChange])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />
    if (file.type.includes('pdf')) return <File className="w-4 h-4 text-red-500" />
    if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc'))
      return <File className="w-4 h-4 text-blue-700" />
    return <FileText className="w-4 h-4 text-gray-500" />
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="card space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">上传聊天记录</h2>
          <p className="text-sm text-gray-500 mt-1">
            支持图片、PDF、Word、文本文件，或直接粘贴聊天内容
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {showSettings ? '收起设置' : 'API设置'}
        </button>
      </div>

      {/* API设置 */}
      {showSettings && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DeepSeek API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-...（也可在服务端 .env 中配置）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型名称
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              placeholder="deepseek-v4pro"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      )}

      {/* 拖拽上传区 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.docx,.doc,.txt,.csv,.md"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium text-lg mb-1">
          拖拽文件到此处，或点击上传
        </p>
        <p className="text-gray-400 text-sm">
          支持 JPG / PNG / PDF / Word / TXT 格式
        </p>
      </div>

      {/* 已选文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">
            已选择 {files.length} 个文件：
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 文本输入区 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          或直接粘贴聊天文本
        </label>
        <textarea
          value={chatText}
          onChange={(e) => onChatTextChange(e.target.value)}
          placeholder={`在此粘贴聊天记录文本...\n\n格式示例：\n销售：您好，请问有什么可以帮您？\n客户：我想了解一下你们的产品\n销售：好的，我给您介绍一下...`}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
            focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none
            resize-y scrollbar-thin"
        />
      </div>

      {/* 分析按钮 */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || (files.length === 0 && !chatText.trim())}
        className="btn-primary w-full flex items-center justify-center space-x-2 text-lg"
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>AI正在深度分析中...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>开始智能分析</span>
          </>
        )}
      </button>

      {/* 提示信息 */}
      {(files.length === 0 && !chatText.trim()) && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            请上传聊天记录文件，或在文本框中粘贴聊天内容
          </p>
        </div>
      )}
    </div>
  )
}
