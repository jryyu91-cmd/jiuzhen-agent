// 区块① 品牌定位区：生活方式叙事 + 三缺痛点 + ROI 双 bar（纯静态，无 props）
import { useEffect, useRef } from 'react'

export default function BrandHero() {
  const barRefs = useRef<(HTMLDivElement | null)[]>([])

  // ROI 双 bar 进场动画：width 0 → 目标值，错峰 150ms
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    barRefs.current.forEach((bar, i) => {
      if (!bar) return
      timers.push(
        setTimeout(() => {
          timers.push(setTimeout(() => {
            bar.style.width = (bar.dataset.w ?? '0') + '%'
          }, i * 150))
        }, 250),
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <header className="hero">
      <div className="wrap">
        <div className="kicker hero-kicker">酱香 × 数智</div>
        <h1>白酒，正在变成一种<span className="accent-word">生活方式</span></h1>
        <p className="hero-sub">
          像咖啡一样，从应酬桌走向生活桌<span className="dash">——</span>酒阵 Agent 帮酒厂把这句话，讲给年轻人听。
        </p>

        <div className="pains">
          <article className="card pain">
            <span className="pain-tag">缺品牌</span>
            <h3>有酒没故事</h3>
            <p>酒是好酒，讲不出<em>产区的底气</em>和匠人的门道，货架上泯然众人。</p>
          </article>
          <article className="card pain">
            <span className="pain-tag">缺资金</span>
            <h3>代运营太贵</h3>
            <p>传统代运营报价 <em>3000–8000 元/月</em> 起，中小酒厂难以长期负担。</p>
          </article>
          <article className="card pain">
            <span className="pain-tag">缺人才</span>
            <h3>一人写不动三平台</h3>
            <p>公众号、朋友圈、短视频脚本——<em>一个人</em>根本追不过内容节奏。</p>
          </article>
        </div>

        <section className="card roi" aria-label="成本对比">
          <div className="roi-head">
            <h3>同样的内容活儿，两种做法</h3>
            <span>以月度公众号内容为例 · 演示估算</span>
          </div>
          <div className="roi-row">
            <div className="roi-meta">
              <span className="roi-label">传统代运营</span>
              <span className="roi-value">6000 元/月</span>
            </div>
            <div className="roi-track">
              <div className="roi-bar muted" data-w="100" ref={(el) => { barRefs.current[0] = el }} />
            </div>
          </div>
          <div className="roi-row">
            <div className="roi-meta">
              <span className="roi-label">酒阵 Agent</span>
              <span className="roi-value">3 分钟/篇<span className="roi-badge">成本降 95%</span></span>
            </div>
            <div className="roi-track">
              <div className="roi-bar grad" data-w="5" ref={(el) => { barRefs.current[1] = el }} />
            </div>
          </div>
        </section>
      </div>
    </header>
  )
}
