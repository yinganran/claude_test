import {
  Target, Lightbulb, AlertTriangle, MessageSquare,
  TrendingUp, Send, Star, ChevronRight, Sparkles, Shield
} from 'lucide-react'
import type { SalesStrategy as SalesStrategyType } from '../types'

interface StrategyPanelProps {
  strategy: SalesStrategyType
}

export default function StrategyPanel({ strategy }: StrategyPanelProps) {
  if (!strategy || Object.keys(strategy).length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <Target className="w-10 h-10 text-green-300" />
        </div>
        <p className="text-gray-400">暂无销售攻略数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ===== 顶部：整体评估 + 关键指标 ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 text-white p-6 sm:p-8">
        {/* 装饰 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">整体评估</h3>
              <p className="text-xs text-slate-400">{strategy.recommended_approach || '综合策略'}</p>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-sm mb-6">
            {strategy.overall_assessment || '暂无评估'}
          </p>

          {/* 三个关键指标 */}
          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/10">
            {[
              { label: '预估成交概率', value: strategy.success_probability || '-', icon: TrendingUp },
              { label: '预计成交周期', value: strategy.estimated_timeline || '-', icon: Target },
              { label: '推荐策略', value: strategy.recommended_approach || '-', icon: Star },
            ].map((metric, i) => (
              <div key={i} className="text-center">
                <metric.icon className="w-4 h-4 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xl sm:text-2xl font-bold text-white">{metric.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== 核心策略网格 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 沟通要点 */}
        <StrategyCard
          icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
          title="沟通要点"
          color="amber"
          empty="暂无沟通要点"
        >
          {strategy.key_talking_points?.length > 0 && (
            <ul className="space-y-2.5">
              {strategy.key_talking_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          )}
        </StrategyCard>

        {/* 避雷指南 */}
        <StrategyCard
          icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
          title="避雷指南"
          color="red"
          empty="暂无特别需要避免的话题"
        >
          {strategy.avoid_topics?.length > 0 && (
            <ul className="space-y-2.5">
              {strategy.avoid_topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <span className="leading-relaxed">{topic}</span>
                </li>
              ))}
            </ul>
          )}
        </StrategyCard>

        {/* 价值主张 */}
        <StrategyCard
          icon={<Star className="w-4 h-4 text-yellow-500" />}
          title="价值主张"
          color="yellow"
          empty="暂无价值主张"
        >
          {strategy.value_propositions?.length > 0 && (
            <ul className="space-y-2.5">
              {strategy.value_propositions.map((vp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-md bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{vp}</span>
                </li>
              ))}
            </ul>
          )}
        </StrategyCard>

        {/* 建议提问 */}
        <StrategyCard
          icon={<MessageSquare className="w-4 h-4 text-blue-500" />}
          title="建议提问"
          color="blue"
          empty="暂无建议提问"
        >
          {strategy.suggested_questions?.length > 0 && (
            <ul className="space-y-2.5">
              {strategy.suggested_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-blue-400 font-bold flex-shrink-0">{i + 1}.</span>
                  <span className="italic leading-relaxed">"{q}"</span>
                </li>
              ))}
            </ul>
          )}
        </StrategyCard>
      </div>

      {/* ===== 话术模板库 ===== */}
      {strategy.reply_templates && strategy.reply_templates.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-2.5">
              <Send className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-gray-800">话术模板库</h4>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                {strategy.reply_templates.length} 个场景
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {strategy.reply_templates.map((tpl, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-sm
                  transition-all duration-200 overflow-hidden"
              >
                {/* 场景标题 */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">场景：{tpl.scenario}</p>
                  </div>
                </div>
                {/* 建议回复 */}
                <div className="px-4 py-3.5 bg-green-50/50">
                  <p className="text-xs text-green-600 font-medium mb-1.5 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    建议回复话术
                  </p>
                  <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                    {tpl.suggested_reply}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 下一步行动 ===== */}
      {strategy.next_action && (
        <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-green-800 mb-1.5">下一步行动建议</h4>
              <p className="text-sm text-green-700 leading-relaxed">{strategy.next_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 策略子卡片组件 */
function StrategyCard({
  icon,
  title,
  color,
  empty,
  children,
}: {
  icon: React.ReactNode
  title: string
  color: string
  empty: string
  children: React.ReactNode
}) {
  const colorMap: Record<string, string> = {
    amber: 'border-l-amber-400',
    red: 'border-l-red-400',
    yellow: 'border-l-yellow-400',
    blue: 'border-l-blue-400',
  }

  const hasContent = (children as any)?.props?.children?.length > 0 ||
    (children as any)?.[0]?.props?.children?.length > 0

  // Simplified: just check if children exists
  const isEmpty = !children || (Array.isArray(children) && children.length === 0)

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${colorMap[color] || 'border-l-gray-400'}
      hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
        {icon}
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
      </div>
      <div className="p-5">
        {isEmpty ? (
          <p className="text-sm text-gray-400">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
