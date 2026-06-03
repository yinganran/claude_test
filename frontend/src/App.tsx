import { useState, useCallback } from 'react'
import { BarChart3, MessageSquare, UserCircle, Target, RefreshCw, FileText } from 'lucide-react'
import UploadPanel from './components/UploadPanel'
import AnalysisResult from './components/AnalysisResult'
import CustomerProfileCard from './components/CustomerProfile'
import StrategyPanel from './components/StrategyPanel'
import { analyzeChatRecords } from './api'
import type { AnalysisResult as AnalysisResultType, TabType } from './types'

const TABS: { key: TabType; label: string; desc: string; icon: any; color: string }[] = [
  {
    key: 'problems',
    label: '问题诊断',
    desc: '发现问题对话',
    icon: MessageSquare,
    color: 'red',
  },
  {
    key: 'profile',
    label: '客户画像',
    desc: '深度了解客户',
    icon: UserCircle,
    color: 'blue',
  },
  {
    key: 'strategy',
    label: '销售攻略',
    desc: '跟进策略',
    icon: Target,
    color: 'green',
  },
]

const tabColors: Record<string, { active: string; hover: string; badge: string }> = {
  red: {
    active: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
    hover: 'hover:bg-red-50/50 hover:text-red-600',
    badge: 'bg-red-500 text-white',
  },
  blue: {
    active: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
    hover: 'hover:bg-blue-50/50 hover:text-blue-600',
    badge: 'bg-blue-500 text-white',
  },
  green: {
    active: 'bg-green-50 text-green-700 border-green-200 shadow-sm',
    hover: 'hover:bg-green-50/50 hover:text-green-600',
    badge: 'bg-green-500 text-white',
  },
}

export default function App() {
  const [files, setFiles] = useState<File[]>([])
  const [chatText, setChatText] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('problems')
  const [result, setResult] = useState<AnalysisResultType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = useCallback(async () => {
    if (files.length === 0 && !chatText.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setResult(null)

    try {
      const response = await analyzeChatRecords({
        files,
        chatText,
        apiKey,
        model,
      })

      if (response.success && response.data) {
        setResult(response.data)
        if (response.data.problem_analysis?.length > 0) {
          setActiveTab('problems')
        } else if (response.data.customer_profile && Object.keys(response.data.customer_profile).length > 0) {
          setActiveTab('profile')
        } else {
          setActiveTab('strategy')
        }
      } else {
        setError(response.error || '分析失败，请重试')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || '网络错误，请检查后端服务是否启动'
      setError(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }, [files, chatText, apiKey, model])

  const handleReset = useCallback(() => {
    setResult(null)
    setError(null)
    setFiles([])
    setChatText('')
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* 顶部导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600
              flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                销售聊天记录分析系统
              </h1>
              <p className="text-xs text-gray-400">AI 驱动的销售对话智能分析引擎</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-gray-600 bg-white border border-gray-200 rounded-xl
                  hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">重新分析</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {!result ? (
          /* ============ 上传阶段 ============ */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 mt-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                bg-gradient-to-br from-indigo-50 to-blue-50 mb-5 shadow-sm">
                <FileText className="w-8 h-8 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                智能分析销售对话
              </h2>
              <p className="text-gray-500 text-lg">
                上传聊天记录，AI 自动识别问题对话、生成客户画像与个性化销售攻略
              </p>
            </div>

            <UploadPanel
              files={files}
              onFilesChange={setFiles}
              chatText={chatText}
              onChatTextChange={setChatText}
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              model={model}
              onModelChange={setModel}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />

            {error && (
              <div className="mt-6 p-5 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-500 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="font-semibold text-red-800 text-sm mb-1">分析失败</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 功能特性卡片 */}
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                {
                  icon: MessageSquare,
                  title: '问题诊断',
                  desc: '自动识别话术问题\n发现沟通漏洞与改进空间',
                  gradient: 'from-red-50 to-rose-50',
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-500',
                },
                {
                  icon: UserCircle,
                  title: '客户画像',
                  desc: '深度分析客户特征\n行为偏好与决策模式',
                  gradient: 'from-blue-50 to-indigo-50',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-500',
                },
                {
                  icon: Target,
                  title: '个性攻略',
                  desc: '量身定制跟进策略\n提供话术模板与行动建议',
                  gradient: 'from-green-50 to-emerald-50',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-500',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`relative bg-gradient-to-br ${feature.gradient} rounded-2xl p-6
                    border border-gray-100 hover:shadow-md transition-all duration-300 group`}
                >
                  <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-3
                    group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ============ 结果展示阶段 ============ */
          <div>
            {/* 元信息 */}
            {result._meta && (
              <div className="flex items-center justify-end gap-4 mb-5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  模型：{result._meta.model}
                </span>
                <span>Tokens：{result._meta.tokens_used?.total?.toLocaleString() || '-'}</span>
              </div>
            )}

            {/* Tab导航 — 全新卡片式设计 */}
            <div className="flex gap-3 mb-8">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key
                const colors = tabColors[tab.color]
                const problemCount = tab.key === 'problems' ? result.problem_analysis?.length || 0 : 0

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      relative flex items-center gap-3 px-5 py-3.5 rounded-2xl border
                      transition-all duration-200 font-medium text-sm
                      ${isActive
                        ? colors.active
                        : `bg-white text-gray-500 border-gray-200 ${colors.hover}`
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      <div className="text-xs opacity-60">{tab.desc}</div>
                    </div>
                    {problemCount > 0 && (
                      <span className={`
                        absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5
                        rounded-full ${colors.badge} text-xs font-bold
                        flex items-center justify-center shadow-md
                      `}>
                        {problemCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab内容区 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-4 sm:p-6 lg:p-8">
                {activeTab === 'problems' && (
                  <AnalysisResult problems={result.problem_analysis || []} />
                )}
                {activeTab === 'profile' && (
                  <CustomerProfileCard profile={result.customer_profile} />
                )}
                {activeTab === 'strategy' && (
                  <StrategyPanel strategy={result.sales_strategy} />
                )}
              </div>
            </div>

            {/* 错误信息 */}
            {result.error && (
              <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
                <p className="text-amber-800 text-sm font-semibold mb-2">⚠ 部分解析失败</p>
                <pre className="text-xs text-amber-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {result.raw_response}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <p>销售聊天记录分析系统 · Powered by DeepSeek AI</p>
      </footer>
    </div>
  )
}
