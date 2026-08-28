import type { ProfileFull } from '../types'
import ShowcaseCard from './ShowcaseCard'

interface ShowcaseGalleryProps {
  profiles: ProfileFull[]
  onUseProfile: (p: ProfileFull) => void
  loading: boolean
}

export default function ShowcaseGallery({ profiles, onUseProfile, loading }: ShowcaseGalleryProps) {
  if (profiles.length === 0) return null

  return (
    <section className="section cases-section" id="cases">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <span className="section-kicker">QUICK START</span>
            <h2>不想填表？先拿演示档案跑一次</h2>
            <p>两家虚构酒厂、两种产品逻辑。点击后直接看看酿见如何从产品信息走到营销判断。</p>
          </div>
          <span className="demo-note">演示数据 · 非真实酒厂</span>
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
