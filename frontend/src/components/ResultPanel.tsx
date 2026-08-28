import { useState } from 'react'
import type { GenerateResponse } from '../types'

interface ResultPanelProps {
  result: GenerateResponse | null
}

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '公众号',
  moments: '朋友圈',
  video: '短视频',
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('wechat')
  const active = result?.contents.find((c) => c.channel === activeTab) ?? result?.contents[0]

  return (
    <div className="card result-card">
      {result ? (
        <>
          <div className="result-head">
            <nav className="tabs" role="tablist" aria-label="内容三件套">
              {result.contents.map((c) => (
                <button
                  key={c.channel}
                  className="tab"
                  role="tab"
                  aria-selected={active?.channel === c.channel}
                  onClick={() => setActiveTab(c.channel)}
                >
                  {CHANNEL_LABEL[c.channel] ?? c.channel}
                </button>
              ))}
            </nav>
          </div>

          <div className="result-body">
            <section className="diagnosis-block">
              <h4>先诊断，再写内容</h4>
              <p><strong>核心判断：</strong>{result.diagnosis.core_problem}</p>
              <p><strong>策略：</strong>{result.diagnosis.strategy}</p>

              <h5>优先消费者</h5>
              <ul>
                {result.diagnosis.audience_segments.map((a) => (
                  <li key={`${a.name}-${a.recommended_scene}`}>
                    <strong>{a.name}</strong> · {a.priority}<br />
                    {a.need}；触发场景：{a.trigger}；建议主场景：{a.recommended_scene}
                  </li>
                ))}
              </ul>

              <h5>场景机会</h5>
              <ul>
                {result.diagnosis.scene_opportunities.map((s) => (
                  <li key={s.scene}>
                    <strong>{s.scene}</strong>：{s.why_fit}<br />
                    内容角度：{s.content_angle}；转化动作：{s.conversion_action}
                  </li>
                ))}
              </ul>

              <p><strong>下一步：</strong>{result.diagnosis.next_action}</p>
            </section>

            {active && (
              <article className="article">
                <h4>{result.distillery} · {CHANNEL_LABEL[active.channel] ?? active.channel}</h4>
                {active.title && <h5>{active.title}</h5>}
                <pre>{active.body}</pre>
                <div className="tags">
                  {active.hashtags.map((t) => <span key={t}>#{t.replace(/^#/, '')}</span>)}
                </div>
              </article>
            )}

            <section className="compliance-block">
              <h4>{result.compliance.passed ? '发布检查：通过' : '发布检查：需要补充'}</h4>
              {result.compliance.issues.length > 0 && (
                <ul>
                  {result.compliance.issues.map((i, idx) => (
                    <li key={`${i.rule}-${idx}`}>
                      <strong>{i.level.toUpperCase()}</strong> · {i.rule}：命中「{i.excerpt}」。{i.suggestion}
                    </li>
                  ))}
                </ul>
              )}
              {result.compliance.fact_gaps.length > 0 && (
                <>
                  <h5>事实证据缺口</h5>
                  <ul>{result.compliance.fact_gaps.map((g) => <li key={g}>{g}</li>)}</ul>
                </>
              )}
            </section>

            <div className="pipeline" aria-label="生成流水线">
              <span className="pipe-step"><span className="pipe-dot">1</span><span className="txt">诊断</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">2</span><span className="txt">人群场景</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">3</span><span className="txt">内容生成</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">4</span><span className="txt">事实核验</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">5</span><span className="txt">合规检查</span></span>
            </div>

            <details className="trace-details">
              <summary>Agent 决策轨迹</summary>
              <ol>{result.pipeline_trace.map((t) => <li key={t}>{t}</li>)}</ol>
            </details>
          </div>
        </>
      ) : (
        <div className="result-body">
          <div className="result-placeholder">
            <span className="glyph">阵</span>
            <p>先输入产品底层信息。Agent 会先判断卖给谁、进入什么生活场景，再生成内容，并做事实与合规检查。</p>
          </div>
        </div>
      )}
    </div>
  )
}
