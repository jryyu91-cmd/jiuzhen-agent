import type { ProfileFull } from '../types'
import ShowcaseCard from './ShowcaseCard'

interface ShowcaseGalleryProps {
  profiles: ProfileFull[]
  onUseProfile: (p: ProfileFull) => void
  loading: boolean
}

// 区块② 案例展示馆：明确标注「以下为演示案例」（用户硬性要求）
export default function ShowcaseGallery({ profiles, onUseProfile, loading }: ShowcaseGalleryProps) {
  if (profiles.length === 0) return null

  return (
    <section className="section" id="showcase">
      <header className="section-head">
        <h2>🏛️ 一厂一档 · 案例展示馆</h2>
        <span className="badge-demo">以下为演示案例</span>
        <p className="section-sub">
          每家酒厂一份品牌档案（语气红线 / 选题倾向 / 场景素材库）。同一个流水线，不同档案产出完全不同的内容——这就是「一厂一档」的个性化定制机制。
        </p>
      </header>
      <div className="showcase-grid">
        {profiles.map((p) => (
          <ShowcaseCard key={p.profile_id} profile={p} onUse={() => onUseProfile(p)} loading={loading} />
        ))}
      </div>
    </section>
  )
}
