// 酒阵 Agent · API 客户端（类型定义见 types.ts）
import type {
  DistilleryInfo,
  GenerateResponse,
  CommentResponse,
  ProfileFull,
} from './types'

const API = '/api'

export async function listProfiles(): Promise<ProfileFull[]> {
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
