import { useState } from 'react'
import type { ProfileFull } from '../types'

interface ShowcaseCardProps {
  profile: ProfileFull
  index: number
  onUse: () => void
  loading: boolean
}

export default function ShowcaseCard({ profile, index, onUse, loading }: ShowcaseCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="profile-card">
      <div className="profile-card-head">
        <div className="profile-id"><span>{String(index + 1).padStart(2, '0')}</span> DEMO PROFILE</div>
        <span className="profile-price">{profile.price_range}</span>
      </div>
      <div className="profile-title-row">
        <div>
          <h3>{profile.distillery_name}</h3>
          <p>{profile.positioning || `${profile.product_name} 的场景化营销档案`}</p>
        </div>
        <span className="profile-avatar">{profile.distillery_name.slice(0, 1)}</span>
      </div>

      <div className="profile-facts">
        <div><small>主推产品</small><strong>{profile.product_name}</strong></div>
        <div><small>生活场景</small><strong>{profile.lifestyle_scene || '待 Agent 判断'}</strong></div>
        <div><small>目标人群</small><strong>{profile.target_audience || '待 Agent 判断'}</strong></div>
      </div>

      <div className="profile-tags">
        {profile.selling_points.slice(0, 3).map((item) => <span key={item}>{item}</span>)}
      </div>

      {expanded && (
        <div className="profile-more">
          <div><small>品牌语气</small><p>{profile.brand_tone}</p></div>
          <div><small>表达红线</small><p>{profile.tone_taboos.join(' · ') || '—'}</p></div>
          <div><small>真实素材</small><p>{profile.scene_materials.join('；') || '—'}</p></div>
          <div><small>事实证据</small><p>{profile.fact_evidence.length > 0 ? profile.fact_evidence.map((f) => `${f.label}：${f.value}`).join('；') : '暂无'}</p></div>
        </div>
      )}

      <div className="profile-actions">
        <button className="btn btn-primary" onClick={onUse} disabled={loading}>{loading ? '正在装配…' : '用这个档案跑一次'} <span>→</span></button>
        <button type="button" className="text-btn" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '收起详情' : '查看档案详情'} <span>{expanded ? '↑' : '↓'}</span></button>
      </div>
    </article>
  )
}
