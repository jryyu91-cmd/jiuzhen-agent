// 酒阵 Agent · 前端类型定义

export interface FactEvidence {
  label: string
  value: string
  source: string
}

export interface ProfileFull {
  profile_id: string
  distillery_name: string
  positioning: string
  lifestyle_scene: string
  location: string
  product_name: string
  price_range: string
  target_audience: string
  selling_points: string[]
  brand_tone: string
  tone_taboos: string[]
  topic_preferences: string[]
  scene_materials: string[]
  fact_evidence: FactEvidence[]
  extra_material?: string | null
}

export interface DistilleryInfo {
  name: string
  location: string
  product_name: string
  price_range: string
  target_audience: string
  selling_points: string[]
  consume_scene?: string
  marketing_goal?: string
  existing_channels?: string[]
  brand_tone: string
  tone_taboos?: string[]
  fact_evidence?: FactEvidence[]
  extra_material?: string
}

export interface AudienceSegment {
  name: string
  need: string
  trigger: string
  recommended_scene: string
  priority: string
}

export interface SceneOpportunity {
  scene: string
  why_fit: string
  content_angle: string
  conversion_action: string
}

export interface MarketingDiagnosis {
  core_problem: string
  strategy: string
  audience_segments: AudienceSegment[]
  scene_opportunities: SceneOpportunity[]
  channel_plan: string[]
  next_action: string
}

export interface ComplianceIssue {
  level: string
  rule: string
  excerpt: string
  suggestion: string
}

export interface ComplianceReport {
  passed: boolean
  issues: ComplianceIssue[]
  fact_gaps: string[]
}

export interface GeneratedContent {
  channel: 'wechat' | 'moments' | 'video'
  title: string | null
  body: string
  hashtags: string[]
}

export interface GenerateResponse {
  distillery: string
  diagnosis: MarketingDiagnosis
  contents: GeneratedContent[]
  compliance: ComplianceReport
  pipeline_trace: string[]
}

export interface CommentReply {
  comment: string
  reply: string
  intent: string
}

export interface CommentResponse {
  items: CommentReply[]
}
