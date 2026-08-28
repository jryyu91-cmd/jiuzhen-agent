interface BrandHeroProps {
  onQuickDemo: () => void
  quickDemoDisabled?: boolean
}

export default function BrandHero({ onQuickDemo, quickDemoDisabled = false }: BrandHeroProps) {
  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="hero">
      <div className="topbar wrap">
        <button className="brand-lockup" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="返回顶部">
          <span className="brand-mark">见</span>
          <span className="brand-copy">
            <strong>酿见 AI</strong>
            <small>中小酒企的 AI 营销大脑</small>
          </span>
        </button>
        <nav className="topnav" aria-label="页面导航">
          <button onClick={() => go('cases')}>案例</button>
          <button onClick={() => go('workbench')}>工作台</button>
          <button onClick={() => go('comments')}>承接</button>
        </nav>
        <button className="top-cta" onClick={() => go('workbench')}>交资料试试 <span>↗</span></button>
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> RAW MATERIALS → MARKETING MEMORY</div>
          <h1>资料不用先整理，<br />酿见先替你<span>看懂。</span></h1>
          <p className="hero-sub">
            把产品手册、PDF、历史内容和零散文字交进来。酿见先提取有来源的品牌事实，再判断这瓶酒该优先进入谁的什么生活场景，最后生成内容并做事实与营销风险检查。
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onQuickDemo} disabled={quickDemoDisabled}>30 秒看完整演示 <span>→</span></button>
            <button className="btn btn-secondary" onClick={() => go('workbench')}>用自己的资料试试</button>
          </div>
          <p className="hero-demo-note">不用懂 AI，也不用先会营销。企业已有资料就是入口。</p>
          <div className="value-strip" aria-label="产品特点">
            <div><strong>01</strong><span>散乱资料<br />自动变成档案</span></div>
            <div><strong>02</strong><span>事实有来源<br />判断有上下文</span></div>
            <div><strong>03</strong><span>一次确认<br />后续持续复用</span></div>
          </div>
        </div>

        <aside className="agent-preview" aria-label="酿见 Agent 工作流程">
          <div className="preview-head">
            <div>
              <span className="preview-label">AGENT WORKFLOW</span>
              <h2>不是先写文案，是先理解这家酒厂</h2>
            </div>
            <span className="agent-status"><i /> READY</span>
          </div>

          <div className="prompt-card">
            <span className="prompt-icon">✦</span>
            <div>
              <small>真实使用更接近这样</small>
              <p>产品手册.pdf + 瓶身资料 + 过去发过的内容</p>
            </div>
          </div>

          <ol className="agent-flow">
            <li><span>01</span><div><strong>读企业原始资料</strong><small>PDF、文本、历史内容</small></div><b>✓</b></li>
            <li><span>02</span><div><strong>建立事实证据</strong><small>度数、规格、产区、工艺 + 来源</small></div><b>✓</b></li>
            <li><span>03</span><div><strong>判断人群与场景</strong><small>把事实变成可执行营销判断</small></div><b>✓</b></li>
            <li><span>04</span><div><strong>生成渠道内容</strong><small>公众号、朋友圈、短视频</small></div><b>✓</b></li>
            <li><span>05</span><div><strong>发布前检查</strong><small>事实缺口 + 酒类营销风险</small></div><b>✓</b></li>
          </ol>

          <div className="preview-result">
            <span>资料理解示例</span>
            <p>42%vol ✓ 来自瓶身资料；168 元 ✓ 来自产品手册；“纯粮酿造”未找到证据，暂不建议对外使用。</p>
          </div>
        </aside>
      </div>
    </header>
  )
}
