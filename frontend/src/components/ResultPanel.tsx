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

type ResultMode = 'materials' | 'strategy' | 'content' | 'check'

export default function ResultPanel({ result, loading = false }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('wechat')
  const [mode, setMode] = useState<ResultMode>('materials')
  const [copied, setCopied] = useState(false)
  const active = result?.contents.find((c) => c.channel === activeTab) ?? result?.contents[0]

  const copyActive = async () => {
    if (!active) return
    const text = [active.title, active.body].filter(Boolean).join('\n\n')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        el.remove()
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
    }
  }

  if (loading) {
    return (
      <div className="card result-card running-state">
        <div className="agent-orbit"><span>见</span><i /><b /></div>
        <span className="mini-label">AGENT IS WORKING</span>
        <h3>酿见正在先读资料，再做营销判断</h3>
        <p>资料中的事实和后面的营销推断会分开处理，避免把建议当成企业事实。</p>
        <div className="running-list">
          <span><i className="pulse-dot" /> 读取原始资料与来源</span>
          <span><i className="pulse-dot delay1" /> 建立可追溯品牌事实</span>
          <span><i className="pulse-dot delay2" /> 判断消费者与生活场景</span>
          <span><i className="pulse-dot delay3" /> 生成内容并做发布检查</span>
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
        <span className="mini-label">YOUR MARKETING MEMORY STARTS HERE</span>
        <h3>不用先想“怎么填营销表”</h3>
        <p>把产品资料交进来。酿见先把可确认事实整理出来，再决定人群、场景和内容。</p>
        <div className="empty-steps">
          <span><b>1</b> 读资料</span><i>→</i><span><b>2</b> 建事实</span><i>→</i><span><b>3</b> 找场景</span><i>→</i><span><b>4</b> 做营销</span>
        </div>
      </div>
    )
  }

  const material = result.material_analysis

  return (
    <div className="card result-card">
      <div className="result-toolbar">
        <div>
          <span className="result-status"><i /> 分析完成</span>
          <strong>{result.distillery}</strong>
        </div>
        <nav className="result-mode-tabs" aria-label="结果视图">
          <button className={mode === 'materials' ? 'active' : ''} onClick={() => setMode('materials')}>资料事实</button>
          <button className={mode === 'strategy' ? 'active' : ''} onClick={() => setMode('strategy')}>策略诊断</button>
          <button className={mode === 'content' ? 'active' : ''} onClick={() => setMode('content')}>内容资产</button>
          <button className={mode === 'check' ? 'active' : ''} onClick={() => setMode('check')}>发布检查</button>
        </nav>
      </div>

      <div className="result-body">
        {mode === 'materials' && (
          <div className="strategy-view">
            {material ? (
              <>
                <section className="diagnosis-hero">
                  <span className="section-kicker">SOURCE → FACT</span>
                  <h3>先把散乱资料变成可确认、可追溯的品牌事实</h3>
                  <p>本次读取 {material.source_names.length} 份资料，识别 {material.extracted_facts.length} 条有来源的事实。营销推断不会被混进这里。</p>
                </section>

                <section className="result-section">
                  <div className="section-title-row"><div><span className="section-kicker">SOURCES</span><h4>本次读取的资料</h4></div><small>企业已有资料就是入口</small></div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {material.source_names.map((name) => (
                      <span key={name} style={{ padding: '8px 11px', border: '1px solid #e5e7e5', background: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{name}</span>
                    ))}
                  </div>
                </section>

                <section className="result-section">
                  <div className="section-title-row"><div><span className="section-kicker">EVIDENCE</span><h4>可追溯事实</h4></div><small>发布前可以回看 AI 依据</small></div>
                  {material.extracted_facts.length > 0 ? (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {material.extracted_facts.map((fact, idx) => (
                        <article key={`${fact.label}-${fact.value}-${idx}`} style={{ border: '1px solid #e5e7e5', borderRadius: 14, padding: 14, background: '#fff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                            <div><span style={{ display: 'block', fontSize: 9, color: '#8a9098', marginBottom: 3 }}>{fact.label}</span><strong style={{ fontSize: 14 }}>{fact.value}</strong></div>
                            <span style={{ fontSize: 10, color: '#178562', background: '#e8f5ef', padding: '5px 8px', borderRadius: 999 }}>✓ {fact.source}</span>
                          </div>
                          {fact.source_excerpt && <p style={{ margin: '10px 0 0', paddingTop: 10, borderTop: '1px solid #f0f1ef', fontSize: 11.5, color: '#697079', lineHeight: 1.65 }}>原文：{fact.source_excerpt}</p>}
                        </article>
                      ))}
                    </div>
                  ) : <div className="clean-card compact"><span>!</span><div><h4>暂时没有提取到可追溯事实</h4><p>可以补充产品手册、瓶身文字或人工确认字段。</p></div></div>}
                </section>

                {material.missing_fields.length > 0 && (
                  <section className="next-action-card">
                    <div><span className="section-kicker">NEEDS CONFIRMATION</span><h4>只让人补这些缺口</h4></div>
                    <p>{material.missing_fields.join('、')}</p>
                  </section>
                )}
              </>
            ) : (
              <section className="diagnosis-hero">
                <span className="section-kicker">MANUAL CONFIRMATION</span>
                <h3>本次从人工确认信息开始</h3>
                <p>没有上传原始资料，所以酿见直接使用你确认过的产品字段。真实长期使用时，建议先建立资料与证据档案，后续任务就不需要重复填写。</p>
              </section>
            )}
          </div>
        )}

        {mode === 'strategy' && (
          <div className="strategy-view">
            <section className="diagnosis-hero">
              <span className="section-kicker">CORE JUDGEMENT</span>
              <h3>{result.diagnosis.core_problem}</h3>
              <p>{result.diagnosis.strategy}</p>
            </section>

            <section className="result-section">
              <div className="section-title-row">
                <div><span className="section-kicker">WHY THIS JUDGEMENT</span><h4>这次判断是怎么来的</h4></div>
                <small>{result.diagnosis.reasoning_mode === 'llm' ? 'AI 受证据约束推理' : '可解释规则兜底'}</small>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.diagnosis.reasoning_basis.map((basis, idx) => (
                  <div key={`${basis}-${idx}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', border: '1px solid #e5e7e5', background: '#fff', borderRadius: 12, fontSize: 11.5, color: '#545b63' }}>
                    <span style={{ color: '#5b5bd6', fontWeight: 800 }}>0{idx + 1}</span><span>{basis}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 10.5, color: '#8a9098' }}>这里展示的是判断依据，不代表场景建议已经被市场验证；真实经营反馈会决定下一轮是否继续。</p>
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
              <div className="section-title-row"><div><span className="section-kicker">SCENES</span><h4>场景机会</h4></div><small>从具体生活时刻，而不是抽象“酒桌”开始</small></div>
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
            <p style={{ margin: '0 0 18px', fontSize: 12, color: '#7a8087' }}>消费者内容草稿 · 策略判断留在“策略诊断”，事实依据来自“资料事实”。</p>
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
