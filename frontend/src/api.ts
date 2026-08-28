export interface DistilleryInfo {
  name: string
  location: string
  product_name: string
  price_range: string
  target_audience: string
  selling_points: string[]
  brand_tone: string
  extra_material?: string
}

export interface GeneratedContent {
  channel: 'wechat' | 'moments' | 'video'
  title: string | null
  body: string
  hashtags: string[]
}

export interface GenerateResponse {
  distillery: string
  contents: GeneratedContent[]
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

const API = '/api'

export interface ProfileSummary {
  profile_id: string
  distillery_name: string
  product_name: string
  price_range: string
}

export async function listProfiles(): Promise<ProfileSummary[]> {
  const res = await fetch(`${API}/profiles`)
  if (!res.ok) throw new Error(`获取档案失败：${res.status}`)
  return res.json()
}

export async function generateByProfile(profileId: string): Promise<GenerateResponse> {
  const res = await fetch(`${API}/generate/by-profile/${profileId}`, { method: 'POST' })
  if (!res.ok) throw new Error(`按档案生成失败：${res.status}`)
  return res.json()
}

export async function generate(info: DistilleryInfo): Promise<GenerateResponse> {
  const res = await fetch(`${API}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info),
  })
  if (!res.ok) throw new Error(`生成失败：${res.status}`)
  return res.json()
}

export async function fetchCommentReplies(payload: {
  product: string
  name: string
  location: string
  price: string
}): Promise<CommentResponse> {
  const res = await fetch(`${API}/comments/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`获取评论回复失败：${res.status}`)
  return res.json()
}
