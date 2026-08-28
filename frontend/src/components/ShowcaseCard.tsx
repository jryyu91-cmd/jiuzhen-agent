import { useState } from 'react'
import type { ProfileFull } from '../types'

interface ShowcaseCardProps {
  profile: ProfileFull
  onUse: () => void
  loading: boolean
}

export default function ShowcaseCard({ profile, onUse, loading }: ShowcaseCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="showcase-card">
      <header className="showcase-head">
        <h3>{profile.distillery_name}</h3>
        <span className="showcase-meta">{profile.product_name} · {profile.price_range} · {profile.location}</span>
      </header>
      <p className="showcase-positioning">「{profile.positioning}」</p>
      <p className="showcase-scene">生活场景：{profile.lifestyle_scene}</p>

      {expanded && (
        <dl className="showcase-detail">
          <div>
            <dt>品牌语气</dt>
            <dd>{profile.brand_tone}</dd>
          </div>
          <div>
            <dt>语气红线</dt>
            <dd>{profile.tone_taboos.length ? profile.tone_taboos.join('；') : '无'}</dd>
          </div>
          <div>
            <dt>选题倾向</dt>
            <dd>{profile.topic_preferences.join('；')}</dd>
          </div>
          <div>
            <dt>场景素材库</dt>
            <dd>
              <ul>
                {profile.scene_materials.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </dd>
          </div>
          <div>
            <dt>目标人群</dt>
            <dd>{profile.target_audience}</dd>
          </div>
        </dl>
      )}

      <footer className="showcase-actions">
        <button className="ghost" onClick={() => setExpanded(!expanded)}>
          {expanded ? '收起档案 ▲' : '展开完整档案 ▼'}
        </button>
        <button className="primary" onClick={onUse} disabled={loading}>
          {loading ? '正在装配档案并写作…' : '用此档案生成 →'}
        </button>
      </footer>
    </article>
  )
}
