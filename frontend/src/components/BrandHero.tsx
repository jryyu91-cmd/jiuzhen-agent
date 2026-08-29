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
        <button className="top-cta" onClick={() => go('workbench')}>拿资料试试 <span>↗</span></button>
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> 一份现成资料 → 一套营销判断</div>
          <h1>把酒厂资料交进来，<br />酿见帮你想清楚<span>这瓶酒怎么卖。</span></h1>
          <p className="hero-sub">
            产品手册、瓶身信息、历史文案，能上传就上传，能粘贴就粘贴。酿见先找出能确认的产品事实和来源，再判断更值得测试的人群与消费场景，生成公众号、朋友圈、短视频，最后检查哪些话能说、哪些还缺证据。
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onQuickDemo} disabled={quickDemoDisabled}>30 秒看完整演示 <span>→</span></button>
            <button className="btn btn-secondary" onClick={() => go('workbench')}>用自己的资料试试</button>
          </div>
          <p className="hero-demo-note">不用写提示词，也不用先想好目标人群。你把手头资料交进来就能开始。</p>
          <div className="value-strip" aria-label="产品特点">
            <div><strong>01</strong><span>资料直接丢进来<br />不用先做表格</span></div>
            <div><strong>02</strong><span>先判断卖给谁<br />再决定怎么写</span></div>
            <div><strong>03</strong><span>每个卖点找依据<br />发布前再检查</span></div>
          </div>
        </div>

        <aside className="agent-preview" aria-label="酿见 Agent 工作流程">
          <div className="preview-head">
            <div>
              <span className="preview-label">你给资料，酿见替你跑</span>
              <h2>从一堆资料，到一次能执行的营销任务</h2>
            </div>
            <span className="agent-status"><i /> READY</span>
          </div>

          <div className="prompt-card">
            <span className="prompt-icon">✦</span>
            <div>
              <small>不用写复杂提示词</small>
              <p>产品手册.pdf + 瓶身资料 + 过去发过的内容</p>
            </div>
          </div>

          <ol className="agent-flow">
            <li><span>01</span><div><strong>先把资料读懂</strong><small>产品、价格、度数、规格、产区</small></div><b>✓</b></li>
            <li><span>02</span><div><strong>找到有依据的卖点</strong><small>事实旁边保留来源，不替酒厂乱补</small></div><b>✓</b></li>
            <li><span>03</span><div><strong>判断这瓶酒更适合谁</strong><small>再找值得测试的具体消费场景</small></div><b>✓</b></li>
            <li><span>04</span><div><strong>生成能直接改用的内容</strong><small>公众号、朋友圈、短视频</small></div><b>✓</b></li>
            <li><span>05</span><div><strong>发布前再检查一遍</strong><small>事实缺口 + 酒类营销风险</small></div><b>✓</b></li>
          </ol>

          <div className="preview-result">
            <span>酿见读到的事实</span>
            <p>53%vol ✓ 来自瓶身资料；168 元 ✓ 来自产品手册；“纯粮酿造”没找到证据，暂不建议对外使用。</p>
          </div>
        </aside>
      </div>
    </header>
  )
}
