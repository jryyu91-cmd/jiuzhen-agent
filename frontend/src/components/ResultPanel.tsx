import { useState } from 'react'
import type { GenerateResponse } from '../types'

interface ResultPanelProps {
  result: GenerateResponse | null
}

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '📝 公众号文案',
  moments: '💬 朋友圈短文案',
  video: '🎬 短视频脚本',
}

// 区块③-右：三件套结果 + 流水线轨迹（评论区已独立为区块④）
export default function ResultPanel({ result }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('wechat')
  const active = result?.contents.find((c) => c.channel === activeTab) ?? result?.contents[0]

  return (
    <section className="panel output" id="result-panel">
      {result ? (
        <>
          <nav className="tabs">
            {result.contents.map((c) => (
              <button
                key={c.channel}
                className={active?.channel === c.channel ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(c.channel)}
              >
                {CHANNEL_LABEL[c.channel]}
              </button>
            ))}
          </nav>
          {active && (
            <article className="content">
              {active.title && <h3>{active.title}</h3>}
              <pre>{active.body}</pre>
              <div className="tags">
                {active.hashtags.map((t) => <span key={t}>#{t}</span>)}
              </div>
            </article>
          )}
          <details className="trace">
            <summary>流水线轨迹（现场演示用）</summary>
            <ol>{result.pipeline_trace.map((t) => <li key={t}>{t}</li>)}</ol>
          </details>
        </>
      ) : (
        <div className="placeholder">
          <p>左侧填好酒厂信息，点击「生成内容三件套」。</p>
          <p>或者到上方案例展示馆，点「用此档案生成」看两家酒厂的风格差异。</p>
          <p>一条主链路：解析 → 卖点提取 → 生活方式场景装配 → 三通道并行生成 → 红线自查。</p>
        </div>
      )}
    </section>
  )
}
