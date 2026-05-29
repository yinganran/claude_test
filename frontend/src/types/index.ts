// ============ 类型定义 ============

export interface ConversationMessage {
  role: string
  content: string
  is_problematic: boolean
}

export interface RootCauseAnalysis {
  category: string
  why_it_happened: string
  underlying_psychology: string
}

export interface ProblemSolution {
  core_principle: string
  why_this_works: string
  techniques_used: string[]
  improved_conversation: ConversationMessage[]
}

export interface ProblemItem {
  scene_title: string
  scene_summary: string
  severity: '高' | '中' | '低'
  conversation: ConversationMessage[]
  problematic_index: number
  root_cause_analysis: RootCauseAnalysis
  problem_detail: string
  negative_impact: string
  solution: ProblemSolution
  key_takeaway: string
}

export interface CustomerProfile {
  name_or_nickname: string
  gender_guess: string
  age_range: string
  occupation_or_industry: string
  personality_traits: string[]
  communication_style: string
  core_needs: string[]
  pain_points: string[]
  objections: string[]
  budget_sensitivity: string
  decision_power: string
  interest_level: string
  urgency: string
  trust_level: string
}

export interface ReplyTemplate {
  scenario: string
  suggested_reply: string
}

export interface SalesStrategy {
  overall_assessment: string
  recommended_approach: string
  key_talking_points: string[]
  suggested_questions: string[]
  value_propositions: string[]
  avoid_topics: string[]
  next_action: string
  reply_templates: ReplyTemplate[]
  success_probability: string
  estimated_timeline: string
}

export interface AnalysisMeta {
  model: string
  tokens_used: {
    prompt: number
    completion: number
    total: number
  }
}

export interface AnalysisResult {
  problem_analysis: ProblemItem[]
  customer_profile: CustomerProfile
  sales_strategy: SalesStrategy
  _meta?: AnalysisMeta
  error?: string
  raw_response?: string
}

export interface AnalyzeResponse {
  success: boolean
  data: AnalysisResult | null
  error?: string
}

export type TabType = 'problems' | 'profile' | 'strategy'
