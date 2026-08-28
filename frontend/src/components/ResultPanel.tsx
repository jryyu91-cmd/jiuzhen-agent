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

// 区块③-右：三件套结果（文章排版）+ 流水线五步 + 轨迹详情
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
            {active && (
              <article className="article">
                <h4>{result.distillery} · {CHANNEL_LABEL[active.channel] ?? active.channel}</h4>
                {active.title && <h5>{active.title}</h5>}
                <pre>{active.body}</pre>
                <div className="tags">
                  {active.hashtags.map((t) => <span key={t}>#{t}</span>)}
                </div>
              </article>
            )}

            <div className="pipeline" aria-label="生成流水线">
              <span className="pipe-step"><span className="pipe-dot">1</span><span className="txt">解析</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">2</span><span className="txt">卖点提取</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">3</span><span className="txt">生活方式装配</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">4</span><span className="txt">三通道生成</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">5</span><span className="txt">红线自查</span></span>
            </div>

            <details className="trace-details">
              <summary>流水线轨迹（现场演示用）</summary>
              <ol>{result.pipeline_trace.map((t) => <li key={t}>{t}</li>)}</ol>
            </details>
          </div>
        </>
      ) : (
        <>
          <div className="result-head">
            <nav className="tabs" role="tablist" aria-label="内容三件套">
              <button className="tab" role="tab" aria-selected="true">公众号</button>
              <button className="tab" role="tab" aria-selected="false">朋友圈</button>
              <button className="tab" role="tab" aria-selected="false">短视频</button>
            </nav>
          </div>
          <div className="result-body">
            <div className="result-placeholder">
              <span className="glyph">酿</span>
              <p>左侧填好酒厂信息，点击「生成内容三件套」；或者到上方案例展示馆，点「用此档案生成」看两家酒厂的风格差异。</p>
            </div>
            <div className="pipeline" aria-label="生成流水线">
              <span className="pipe-step"><span className="pipe-dot">1</span><span className="txt">解析</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">2</span><span className="txt">卖点提取</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">3</span><span className="txt">生活方式装配</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">4</span><span className="txt">三通道生成</span></span>
              <span className="pipe-arrow">→</span>
              <span className="pipe-step"><span className="pipe-dot">5</span><span className="txt">红线自查</span></span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
