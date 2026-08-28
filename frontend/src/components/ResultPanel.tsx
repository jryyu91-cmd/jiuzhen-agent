import { useState } from 'react'
import type { GenerateResponse } from '../types'

interface ResultPanelProps {
  result: GenerateResponse | null
  loading?: boolean
}

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '公众号',
  moments: '朋友圈',
  video: '短视频',
}

type ResultMode = 'strategy' | 'content' | 'check'

export default function ResultPanel({ result, loading = false }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('wechat')
  const [mode, setMode] = useState<ResultMode>('strategy')
  const [copied, setCopied] = useState(false)
  const active = result?.contents.find((c) => c.channel === activeTab) ?? result?.contents[0]

  const copyActive = async () => {
    if (!active) return
    await navigator.clipboard?.writeText([active.title, active.body].filter(Boolean).join('\n\n'))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  if (loading) {
    return (
      <div className="card result-card running-state">
        <div className="agent-orbit"><span>见</span><i /><b /></div>
        <span className="mini-label">AGENT IS WORKING</span>
        <h3>酿见正在替你跑营销判断</h3>
        <p>不是直接写文案，它会先把产品、人群、场景和风险串起来。</p>
        <div className="running-list">
          <span><i className="pulse-dot" /> 识别产品与事实依据</span>
          <span><i className="pulse-dot delay1" /> 判断优先消费者</span>
          <span><i className="pulse-dot delay2" /> 匹配生活场景与渠道</span>
          <span><i className="pulse-dot delay3" /> 生成并检查内容</span>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="card result-card empty-result">
        <div className="empty-visual">
          <span className="empty-core">见</span>
          <i className="ring ring-one" /><i className="ring ring-two" />
        </div>
        <span className="mini-label">YOUR RESULT WILL APPEAR HERE</span>
        <h3>先把已知信息交给酿见</h3>
        <p>哪怕你只知道产品名和价格，也可以先跑一次。营销判断会比“先写三篇文案”更早出现。</p>
        <div className="empty-steps">
          <span><b>1</b> 找人群</span><i>→</i><span><b>2</b> 找场景</span><i>→</i><span><b>3</b> 出内容</span><i>→</i><span><b>4</b> 做检查</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card result-card">
      <div className="result-toolbar">
        <div>
          <span className="result-status"><i /> 分析完成</span>
          <strong>{result.distillery}</strong>
        </div>
        <nav className="result-mode-tabs" aria-label="结果视图">
          <button className={mode === 'strategy' ? 'active' : ''} onClick={() => setMode('strategy')}>策略诊断</button>
          <button className={mode === 'content' ? 'active' : ''} onClick={() => setMode('content')}>内容资产</button>
          <button className={mode === 'check' ? 'active' : ''} onClick={() => setMode('check')}>发布检查</button>
        </nav>
      </div>

      <div className="result-body">
        {mode === 'strategy' && (
          <div className="strategy-view">
            <section className="diagnosis-hero">
              <span className="section-kicker">CORE JUDGEMENT</span>
              <h3>{result.diagnosis.core_problem}</h3>
              <p>{result.diagnosis.strategy}</p>
            </section>

            <section className="result-section">
              <div className="section-title-row"><div><span className="section-kicker">AUDIENCE</span><h4>优先消费者</h4></div><small>先找最值得测试的人</small></div>
              <div className="audience-grid">
                {result.diagnosis.audience_segments.map((a, idx) => (
                  <article className="insight-card" key={`${a.name}-${a.recommended_scene}`}>
                    <div className="insight-card-top"><span>0{idx + 1}</span><b>{a.priority}</b></div>
                    <h5>{a.name}</h5>
                    <p>{a.need}</p>
                    <dl><div><dt>触发</dt><dd>{a.trigger}</dd></div><div><dt>主场景</dt><dd>{a.recommended_scene}</dd></div></dl>
                  </article>
                ))}
              </div>
            </section>

            <section className="result-section">
              <div className="section-title-row"><div><span className="section-kicker">SCENES</span><h4>场景机会</h4></div><small>白酒从“酒桌”拆成具体生活时刻</small></div>
              <div className="scene-list">
                {result.diagnosis.scene_opportunities.map((s, idx) => (
                  <article className="scene-card" key={s.scene}>
                    <span className="scene-index">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="scene-main"><h5>{s.scene}</h5><p>{s.why_fit}</p></div>
                    <div className="scene-side"><small>内容角度</small><p>{s.content_angle}</p></div>
                    <div className="scene-side"><small>转化动作</small><p>{s.conversion_action}</p></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="next-action-card">
              <div><span className="section-kicker">NEXT ACTION</span><h4>下一步先做这一件事</h4></div>
              <p>{result.diagnosis.next_action}</p>
            </section>

            {result.diagnosis.channel_plan.length > 0 && (
              <div className="channel-plan"><span>推荐渠道组合</span>{result.diagnosis.channel_plan.map((c) => <b key={c}>{c}</b>)}</div>
            )}
          </div>
        )}

        {mode === 'content' && (
          <div className="content-view">
            <div className="content-toolbar">
              <nav className="channel-tabs" role="tablist" aria-label="内容渠道">
                {result.contents.map((c) => (
                  <button key={c.channel} className={active?.channel === c.channel ? 'active' : ''} onClick={() => setActiveTab(c.channel)}>{CHANNEL_LABEL[c.channel] ?? c.channel}</button>
                ))}
              </nav>
              <button className="copy-btn" onClick={copyActive}>{copied ? '已复制 ✓' : '复制内容'}</button>
            </div>
            {active && (
              <article className="article">
                <div className="article-meta"><span>已按诊断结果生成</span><span>·</span><span>{CHANNEL_LABEL[active.channel]}</span></div>
                {active.title && <h3>{active.title}</h3>}
                <pre>{active.body}</pre>
                <div className="tags">{active.hashtags.map((t) => <span key={t}>#{t.replace(/^#/, '')}</span>)}</div>
              </article>
            )}
          </div>
        )}

        {mode === 'check' && (
          <div className="check-view">
            <section className={`check-summary ${result.compliance.passed ? 'pass' : 'warn'}`}>
              <span className="check-icon">{result.compliance.passed ? '✓' : '!'}</span>
              <div><span className="section-kicker">PRE-PUBLISH CHECK</span><h3>{result.compliance.passed ? '当前内容通过基础发布检查' : '发布前还有内容需要处理'}</h3><p>规则检查只能做基础兜底，正式商业发布仍建议人工复核。</p></div>
            </section>

            {result.compliance.issues.length > 0 ? (
              <section className="check-list-section"><h4>营销风险提示</h4><div className="check-list">{result.compliance.issues.map((i, idx) => (
                <article key={`${i.rule}-${idx}`}><b>{i.level.toUpperCase()}</b><div><h5>{i.rule}</h5><p>命中“{i.excerpt}”</p><small>{i.suggestion}</small></div></article>
              ))}</div></section>
            ) : <div className="clean-card"><span>✓</span><div><h4>未命中当前规则库中的高风险表达</h4><p>可以继续人工检查品牌事实、平台规则和最终发布语境。</p></div></div>}

            <section className="check-list-section">
              <h4>事实证据缺口</h4>
              {result.compliance.fact_gaps.length > 0 ? <div className="fact-gap-list">{result.compliance.fact_gaps.map((g) => <span key={g}>{g}</span>)}</div> : <div className="clean-card compact"><span>✓</span><div><h4>当前未发现明显事实缺口</h4></div></div>}
            </section>

            <details className="trace-details"><summary>查看 Agent 决策轨迹</summary><ol>{result.pipeline_trace.map((t) => <li key={t}>{t}</li>)}</ol></details>
          </div>
        )}
      </div>
    </div>
  )
}
