export default function BrandHero() {
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
            <small>白酒场景化营销智能体</small>
          </span>
        </button>
        <nav className="topnav" aria-label="页面导航">
          <button onClick={() => go('cases')}>案例</button>
          <button onClick={() => go('workbench')}>工作台</button>
          <button onClick={() => go('comments')}>承接</button>
        </nav>
        <button className="top-cta" onClick={() => go('workbench')}>开始诊断 <span>↗</span></button>
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> AI × 白酒消费新场景</div>
          <h1>先看见消费者，<br />再决定这瓶酒<span>怎么卖。</span></h1>
          <p className="hero-sub">
            中小酒企不需要先学会营销。把产品底子交给酿见，它先判断人群和生活场景，再给出内容方案、事实核验与营销风险检查。
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => go('workbench')}>开始一次营销诊断 <span>→</span></button>
            <button className="btn btn-secondary" onClick={() => go('cases')}>先用演示档案体验</button>
          </div>
          <div className="value-strip" aria-label="产品特点">
            <div><strong>01</strong><span>不知道卖给谁<br />也能开始</span></div>
            <div><strong>02</strong><span>先做营销判断<br />再生成内容</span></div>
            <div><strong>03</strong><span>事实与合规<br />双重检查</span></div>
          </div>
        </div>

        <aside className="agent-preview" aria-label="酿见 Agent 工作流程">
          <div className="preview-head">
            <div>
              <span className="preview-label">AGENT WORKFLOW</span>
              <h2>一次任务，跑完整条营销链</h2>
            </div>
            <span className="agent-status"><i /> READY</span>
          </div>

          <div className="prompt-card">
            <span className="prompt-icon">✦</span>
            <div>
              <small>你只需要告诉我</small>
              <p>“这瓶酒 168 元，我不知道该卖给谁。”</p>
            </div>
          </div>

          <ol className="agent-flow">
            <li><span>01</span><div><strong>识别产品底子</strong><small>价格、卖点、产区、真实证据</small></div><b>✓</b></li>
            <li><span>02</span><div><strong>判断消费者</strong><small>谁更可能买、为什么买</small></div><b>✓</b></li>
            <li><span>03</span><div><strong>寻找生活场景</strong><small>佐餐、小聚、自饮、轻礼赠……</small></div><b>✓</b></li>
            <li><span>04</span><div><strong>生成渠道内容</strong><small>公众号、朋友圈、短视频</small></div><b>✓</b></li>
            <li><span>05</span><div><strong>发布前检查</strong><small>事实缺口 + 营销风险</small></div><b>✓</b></li>
          </ol>

          <div className="preview-result">
            <span>酿见建议</span>
            <p>不要先讲“工艺有多复杂”，先测试“周末朋友小聚”的消费场景。</p>
          </div>
        </aside>
      </div>
    </header>
  )
}
