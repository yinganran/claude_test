import {
  User, Briefcase, Heart, Target, Shield, Clock,
  DollarSign, Zap, MessageCircle, Star, MapPin
} from 'lucide-react'
import type { CustomerProfile as CustomerProfileType } from '../types'

interface CustomerProfileProps {
  profile: CustomerProfileType
}

export default function CustomerProfileCard({ profile }: CustomerProfileProps) {
  if (!profile || Object.keys(profile).length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <User className="w-10 h-10 text-blue-300" />
        </div>
        <p className="text-gray-400">暂无客户画像数据</p>
      </div>
    )
  }

  // 等级指示器
  const levelBadge = (value: string | undefined, highWord: string, midWord: string, lowWord: string) => {
    const map: Record<string, { color: string; bg: string; dot: string }> = {
      [highWord]: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', dot: 'bg-green-500' },
      [midWord]: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
      [lowWord]: { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
    }
    const style = (value && map[value]) || map[midWord]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {value || '未知'}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* ===== 头部身份卡 ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100">
        {/* 装饰 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative p-6">
          <div className="flex items-start gap-5 mb-5">
            {/* 头像 */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md border-2 border-white
              flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {profile.name_or_nickname || '未知客户'}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 flex-wrap">
                <MapPin className="w-3 h-3" />
                {[profile.gender_guess, profile.age_range, profile.occupation_or_industry]
                  .filter(Boolean)
                  .filter(v => v !== '未知')
                  .join(' · ') || '信息不足'}
              </p>
            </div>
          </div>

          {/* 状态标签行 */}
          <div className="flex flex-wrap gap-2">
            {levelBadge(profile.interest_level, '高', '中', '低')}
            {levelBadge(profile.urgency, '紧急', '一般', '不急')}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              bg-purple-50 border border-purple-200 text-purple-700">
              <Briefcase className="w-3 h-3" />
              {profile.decision_power || '未知'}
            </span>
            {levelBadge(profile.trust_level, '高', '中', '低')}
          </div>
        </div>
      </div>

      {/* ===== 四象限详情 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 性格与沟通 */}
        <ProfileSection
          icon={<Heart className="w-4 h-4" />}
          title="性格与沟通"
          color="pink"
          items={[
            { label: '性格特点', value: profile.personality_traits, isList: true },
            { label: '沟通风格', value: profile.communication_style },
          ]}
        />

        {/* 需求与痛点 */}
        <ProfileSection
          icon={<Target className="w-4 h-4" />}
          title="需求与痛点"
          color="red"
          items={[
            { label: '核心需求', value: profile.core_needs, isList: true },
            { label: '痛点', value: profile.pain_points, isList: true },
            { label: '客户异议', value: profile.objections, isList: true },
          ]}
        />

        {/* 决策信息 */}
        <ProfileSection
          icon={<Briefcase className="w-4 h-4" />}
          title="决策信息"
          color="indigo"
          items={[
            { label: '决策角色', value: profile.decision_power },
            { label: '价格敏感度', value: profile.budget_sensitivity },
            { label: '紧迫程度', value: profile.urgency },
          ]}
        />

        {/* 兴趣评估 */}
        <ProfileSection
          icon={<Zap className="w-4 h-4" />}
          title="综合评估"
          color="amber"
          items={[
            { label: '兴趣程度', value: profile.interest_level },
            { label: '信任度', value: profile.trust_level },
            { label: '预算敏感度', value: profile.budget_sensitivity },
          ]}
        />
      </div>

      {/* ===== 沟通风格详情（重点展示） ===== */}
      {profile.communication_style && profile.communication_style !== '未知' && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">沟通风格深度解读</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{profile.communication_style}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** 画像区域子组件 */
function ProfileSection({
  icon, title, color, items,
}: {
  icon: React.ReactNode
  title: string
  color: string
  items: { label: string; value: string | string[]; isList?: boolean }[]
}) {
  const colorMap: Record<string, string> = {
    pink: 'border-pink-200 bg-pink-50/50',
    red: 'border-red-200 bg-red-50/50',
    indigo: 'border-indigo-200 bg-indigo-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
  }

  const iconBgMap: Record<string, string> = {
    pink: 'bg-pink-100',
    red: 'bg-red-100',
    indigo: 'bg-indigo-100',
    amber: 'bg-amber-100',
  }

  return (
    <div className={`rounded-2xl border ${colorMap[color] || 'border-gray-200'} overflow-hidden`}>
      <div className="px-5 py-3.5 border-b border-inherit flex items-center gap-2.5">
        <span className={`w-7 h-7 rounded-lg ${iconBgMap[color] || 'bg-gray-100'} flex items-center justify-center`}>
          {icon}
        </span>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
      </div>
      <div className="p-5 space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                {item.label}
              </p>
              {item.isList ? (
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(item.value) && item.value.length > 0 ? (
                    item.value.map((v, j) => (
                      <span key={j} className="inline-block px-2.5 py-1 bg-white border border-gray-200
                        text-gray-700 rounded-lg text-xs shadow-sm">
                        {v}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">暂无数据</span>
                  )}
                </div>
              ) : (
                <p className={`text-sm ${item.value && item.value !== '未知' ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {item.value || '未知'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
