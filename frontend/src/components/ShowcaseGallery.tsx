import type { ProfileFull } from '../types'
import ShowcaseCard from './ShowcaseCard'

interface ShowcaseGalleryProps {
  profiles: ProfileFull[]
  onUseProfile: (p: ProfileFull) => void
  loading: boolean
}

// 区块② 案例展示馆：明确标注「以下为演示案例」（骑缝章徽标）
export default function ShowcaseGallery({ profiles, onUseProfile, loading }: ShowcaseGalleryProps) {
  if (profiles.length === 0) return null

  return (
    <section className="section" id="cases">
      <div className="wrap">
        <div className="case-head">
          <div>
            <h2>一厂一档 · 案例展示馆</h2>
            <p className="sub">每家酒厂一份「一厂一档」卷宗，Agent 按档案说话。</p>
          </div>
          <span className="stamp-badge">以下为演示案例</span>
        </div>
        <div className="case-grid">
          {profiles.map((p, i) => (
            <ShowcaseCard key={p.profile_id} profile={p} index={i} onUse={() => onUseProfile(p)} loading={loading} />
          ))}
        </div>
      </div>
    </section>
  )
}
