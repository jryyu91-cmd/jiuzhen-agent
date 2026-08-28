// 酒阵 Agent · 前端类型定义（与 backend/app/models.py 镜像）

/** 一厂一档 · 完整品牌档案（/api/profiles 全量返回） */
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
  extra_material?: string | null
}

/** 酒厂信息（工作台表单，兼容快速演示：无需建档直接生成） */
export interface DistilleryInfo {
  name: string
  location: string
  product_name: string
  price_range: string
  target_audience: string
  selling_points: string[]
  consume_scene?: string
  brand_tone: string
  tone_taboos?: string[]
  extra_material?: string
}

/** 单条生成内容 */
export interface GeneratedContent {
  channel: 'wechat' | 'moments' | 'video'
  title: string | null
  body: string
  hashtags: string[]
}

/** 三件套 + 流水线轨迹 */
export interface GenerateResponse {
  distillery: string
  contents: GeneratedContent[]
  pipeline_trace: string[]
}

/** 评论区互动 */
export interface CommentReply {
  comment: string
  reply: string
  intent: string
}

export interface CommentResponse {
  items: CommentReply[]
}
