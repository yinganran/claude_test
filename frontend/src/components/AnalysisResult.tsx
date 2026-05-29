import { useState } from 'react'
import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  MessageCircle, Brain, Target, AlertCircle, Zap, Eye, ArrowRight, Lightbulb, ShieldAlert
} from 'lucide-react'
import type { ProblemItem, ConversationMessage } from '../types'

interface AnalysisResultProps {
  problems: ProblemItem[]
}

export default function AnalysisResult({ problems }: AnalysisResultProps) {
  const [expandedMap, setExpandedMap] = useState<Record<number, boolean>>({})
  const [viewModeMap, setViewModeMap] = useState<Record<number, 'original' | 'improved'>>({})

  if (!problems || problems.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">未发现明显问题</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          聊天记录分析完成，没有检测到需要改进的问题对话
        </p>
      </div>
    )
  }

  const toggleExpand = (idx: number) => {
    setExpandedMap(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const toggleView = (idx: number) => {
    setViewModeMap(prev => ({
      ...prev,
      [idx]: prev[idx] === 'improved' ? 'original' : 'improved'
    }))
  }

  const severityCfg: Record<string, { bar: string; border: string; bg: string; text: string; badge: string; dot: string; label: string }> = {
    '高': { bar: 'bg-red-500', border: 'border-red-300', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-500 text-white', dot: 'bg-red-500', label: '严重问题' },
    '中': { bar: 'bg-amber-500', border: 'border-amber-300', bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-500 text-white', dot: 'bg-amber-500', label: '需要改进' },
    '低': { bar: 'bg-blue-500', border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-500 text-white', dot: 'bg-blue-500', label: '可优化' },
  }

  return (
    <div className="space-y-8">
      {/* 顶部统计栏 */}
      <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
            <p className="text-xs text-gray-500">个对话场景需优化</p>
          </div>
        </div>
        <div className="flex-1 flex gap-3">
          {(['高', '中', '低'] as const).map((level) => {
            const count = problems.filter(p => p.severity === level).length
            if (count === 0) return null
            const cfg = severityCfg[level]
            return (
              <div key={level} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-100">
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                <span className="text-sm text-gray-600">{cfg.label}</span>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 问题场景卡片 */}
      {problems.map((scene, idx) => {
        const cfg = severityCfg[scene.severity] || severityCfg['低']
        const isExpanded = expandedMap[idx] || false
        const viewMode = viewModeMap[idx] || 'original'
        const messages = viewMode === 'original'
          ? scene.conversation
          : (scene.solution?.improved_conversation || scene.conversation)

        return (
          <div
            key={idx}
            className={`relative bg-white rounded-2xl border shadow-sm overflow-hidden
              transition-all duration-300 hover:shadow-md
              ${cfg.border}`}
          >
            {/* 顶部严重度色条 */}
            <div className={`h-1.5 ${cfg.bar}`} />

            <div className="p-5 sm:p-6">
              {/* ===== 卡片头部 ===== */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${cfg.badge}`}>
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">{scene.scene_title}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border} flex-shrink-0`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 ml-11">{scene.scene_summary}</p>
                </div>

                {/* 视图切换按钮 */}
                {scene.solution?.improved_conversation?.length > 0 && (
                  <button
                    onClick={() => toggleView(idx)}
                    className={`
                      ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-200 flex-shrink-0
                      ${viewMode === 'original'
                        ? 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }
                    `}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {viewMode === 'original' ? '查看优化版' : '查看原版'}
                  </button>
                )}
              </div>

              {/* ===== 对话气泡区 ===== */}
              <div className={`
                rounded-2xl p-4 sm:p-5 mb-5
                ${viewMode === 'original' ? `${cfg.bg} border ${cfg.border}` : 'bg-green-50/60 border border-green-300'}
              `}>
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className={`w-4 h-4 ${viewMode === 'original' ? 'text-gray-500' : 'text-green-600'}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${viewMode === 'original' ? 'text-gray-500' : 'text-green-700'}`}>
                    {viewMode === 'original' ? '原始对话场景' : '✨ 优化后对话'}
                  </span>
                </div>

                {/* 聊天气泡列表 */}
                <div className="space-y-3">
                  {messages.map((msg, mIdx) => (
                    <ChatBubble
                      key={mIdx}
                      message={msg}
                      isTarget={viewMode === 'original' && mIdx === scene.problematic_index}
                      severity={scene.severity}
                      onClick={() => {
                        if (viewMode === 'original' && mIdx === scene.problematic_index) {
                          toggleExpand(idx)
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ===== 可展开的深度分析区 ===== */}
              {viewMode === 'original' && (
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-2 space-y-4">
                    {/* 问题标注指示条 */}
                    <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                      <AlertCircle className="w-4 h-4" />
                      <span>上方标红的对话即为问题所在，下方为深度分析</span>
                    </div>

                    {/* 根因分析 */}
                    <div className="rounded-xl bg-red-50/70 border border-red-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-red-600" />
                        <h4 className="font-bold text-red-800">根因分析：为什么会犯这个错误</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 flex-shrink-0 mt-0.5">
                            {scene.root_cause_analysis?.category || '未分类'}
                          </span>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {scene.root_cause_analysis?.why_it_happened || scene.problem_detail}
                          </p>
                        </div>
                        {scene.root_cause_analysis?.underlying_psychology && (
                          <div className="flex items-start gap-2 pt-2 border-t border-red-200">
                            <span className="text-[10px] font-bold text-red-500 flex-shrink-0 mt-0.5">心理机制</span>
                            <p className="text-sm text-red-700 leading-relaxed">
                              {scene.root_cause_analysis.underlying_psychology}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 问题详情 */}
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-800">问题表现</h4>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{scene.problem_detail}</p>
                      {scene.negative_impact && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700">连锁影响</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{scene.negative_impact}</p>
                        </div>
                      )}
                    </div>

                    {/* 解决方案 */}
                    <div className="rounded-xl bg-green-50/70 border border-green-200 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-green-800">解决方案</h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-green-600">🎯 核心原则</span>
                          <p className="text-sm text-gray-800 mt-1">{scene.solution?.core_principle}</p>
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-green-600">✅ 为什么有效</span>
                          <p className="text-sm text-gray-800 mt-1">{scene.solution?.why_this_works}</p>
                        </div>
                        {scene.solution?.techniques_used?.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-green-600">🛠 运用技巧</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {scene.solution.techniques_used.map((t, i) => (
                                <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 核心教训 */}
                    {scene.key_takeaway && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <Target className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-indigo-800">
                          📌 核心教训：{scene.key_takeaway}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== 展开/收起按钮 ===== */}
              {viewMode === 'original' && (
                <button
                  onClick={() => toggleExpand(idx)}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    hover:bg-gray-50 text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      收起深度分析
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      展开深度分析（根因 · 问题 · 方案）
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============ 聊天气泡子组件 ============
function ChatBubble({
  message,
  isTarget,
  severity,
  onClick,
}: {
  message: ConversationMessage
  isTarget: boolean
  severity: string
  onClick: () => void
}) {
  const isSales = message.role === '销售' || message.role === 'sales'

  const targetStyles: Record<string, string> = {
    '高': 'border-red-400 bg-red-50 ring-2 ring-red-200 shadow-md shadow-red-100',
    '中': 'border-amber-400 bg-amber-50 ring-2 ring-amber-200 shadow-md shadow-amber-100',
    '低': 'border-blue-400 bg-blue-50 ring-2 ring-blue-200 shadow-md shadow-blue-100',
  }

  const targetBadge: Record<string, string> = {
    '高': 'bg-red-500',
    '中': 'bg-amber-500',
    '低': 'bg-blue-500',
  }

  return (
    <div className={`flex ${isSales ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex ${isSales ? 'flex-row' : 'flex-row-reverse'} items-end gap-2 max-w-[85%]`}>
        {/* 头像 */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
          ${isSales
            ? isTarget ? 'bg-red-500 text-white' : 'bg-indigo-100 text-indigo-600'
            : 'bg-gray-200 text-gray-500'
          }
        `}>
          {isSales ? '销' : '客'}
        </div>

        {/* 气泡内容 */}
        <div className="relative group">
          <div
            onClick={isTarget ? onClick : undefined}
            className={`
              relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              transition-all duration-200
              ${isTarget
                ? `${targetStyles[severity] || targetStyles['中']} cursor-pointer hover:scale-[1.02]`
                : isSales
                  ? 'bg-white border border-gray-200 text-gray-800'
                  : 'bg-gray-100 text-gray-700'
              }
              ${isTarget ? 'rounded-bl-md' : isSales ? 'rounded-bl-md' : 'rounded-br-md'}
            `}
          >
            {/* 角色标签 */}
            <span className={`
              absolute -top-2.5 ${isSales ? 'left-3' : 'right-3'}
              px-2 py-0.5 rounded-full text-[10px] font-bold
              ${isSales
                ? isTarget ? 'bg-red-500 text-white' : 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {message.role}
            </span>

            {/* 问题标记 */}
            {isTarget && (
              <div className="absolute -top-2.5 -right-2.5 flex items-center gap-1">
                <span className={`
                  w-5 h-5 rounded-full ${targetBadge[severity] || targetBadge['中']}
                  flex items-center justify-center shadow-md
                `}>
                  <AlertCircle className="w-3 h-3 text-white" />
                </span>
              </div>
            )}

            <p className={`${isTarget ? 'font-semibold' : ''} mt-1`}>
              {message.content}
            </p>

            {/* hover提示 */}
            {isTarget && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                transition-opacity duration-200 pointer-events-none z-10">
                <span className="px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md whitespace-nowrap">
                  点击查看深度分析
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
