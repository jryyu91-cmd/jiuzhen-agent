import { useState } from 'react'
import type { ProfileFull } from '../types'

interface ShowcaseCardProps {
  profile: ProfileFull
  index: number
  onUse: () => void
  loading: boolean
}

// 区块② 单张卷宗档案卡：编号 + 衬线名 + 酒标竖排条 + 红章 + 可展开档案详情
export default function ShowcaseCard({ profile, index, onUse, loading }: ShowcaseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const num = String(index + 1).padStart(3, '0')

  return (
    <article className="card dossier">
      <span className="seal" aria-hidden="true">档案</span>
      <div className="dossier-top">
        <span className="dossier-num">编号 JZ-2025-{num}</span>
        <div className="dossier-info">
          <h3>{profile.distillery_name}</h3>
          <p className="positioning">
            <strong>定位</strong>｜{profile.positioning || `${profile.product_name}，把产区的底气讲成人话`}
          </p>
        </div>
        <span className="wine-spine">{spineLabel(profile)}</span>
      </div>
      <dl className="dossier-body">
        <div className="dossier-field">
          <dt>产品</dt>
          <dd>{profile.product_name}<span className="sep">·</span>{profile.price_range}<span className="sep">·</span>{profile.location}</dd>
        </div>
        <div className="dossier-field">
          <dt>生活场景</dt>
          <dd>{profile.lifestyle_scene || '—'}</dd>
        </div>
      </dl>

      {expanded && (
        <div className="dossier-more open">
          <div className="more-inner more-grid">
            <div className="more-item">
              <h4>品牌语气</h4>
              <p>{profile.brand_tone}</p>
            </div>
            <div className="more-item">
              <h4>语气红线</h4>
              <ul>{profile.tone_taboos.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="more-item">
              <h4>选题倾向</h4>
              <ul>{profile.topic_preferences.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
            <div className="more-item">
              <h4>素材库</h4>
              <p>{profile.scene_materials.map((m, i) => (
                <span key={m}>{i > 0 && <br />}{m}</span>
              ))}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dossier-actions">
        <button className="btn" onClick={onUse} disabled={loading} style={{ flex: 1 }}>
          {loading ? '正在装配档案并写作…' : '用此档案生成 →'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起完整档案' : '展开完整档案'} <span className="caret">▼</span>
        </button>
      </div>
    </article>
  )
}

function spineLabel(p: ProfileFull): string {
  if (p.profile_id === 'laoshaofang') return '窖藏十年'
  if (p.profile_id === 'qingxi') return '小坛柔和'
  return p.lifestyle_scene.slice(0, 4) || '档案'
}
