import type { DistilleryInfo, GenerateResponse, CommentResponse, ProfileFull } from './types'

// 默认走同源 /api：
// - 本地 Vite dev 由 vite.config.ts 代理到 8000
// - Docker / 在线部署由同一域名直接访问 FastAPI
// 如需拆分前后端部署，可用 VITE_API_BASE 覆盖。
const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** 酿见 AI · 自定义产品营销诊断与内容生成 */
export async function generate(info: DistilleryInfo): Promise<GenerateResponse> {
  return json(await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(info),
  }))
}

/** 一厂一档 · 按演示品牌档案生成 */
export async function generateByProfile(profileId: string): Promise<GenerateResponse> {
  return json(await fetch(`${API_BASE}/api/generate/by-profile/${encodeURIComponent(profileId)}`, {
    method: 'POST',
  }))
}

/** 一厂一档 · 案例馆档案列表 */
export async function listProfiles(): Promise<ProfileFull[]> {
  return json(await fetch(`${API_BASE}/api/profiles`))
}

/** 评论区互动建议 */
export async function fetchCommentReplies(payload: Record<string, unknown>): Promise<CommentResponse> {
  return json(await fetch(`${API_BASE}/api/comments/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }))
}
