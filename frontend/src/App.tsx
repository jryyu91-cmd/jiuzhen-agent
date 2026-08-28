import { useState } from 'react'
import { generate, fetchCommentReplies } from './api'
import type { DistilleryInfo, GenerateResponse, CommentResponse } from './api'

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '📝 公众号文案',
  moments: '💬 朋友圈短文案',
  video: '🎬 短视频脚本',
}

const DEFAULT_FORM: DistilleryInfo = {
  name: '茅台镇老烧坊',
  location: '贵州遵义·茅台镇',
  product_name: '老烧坊·窖藏10',
  price_range: '388元',
  target_audience: '30-45岁男性、商务送礼与自饮兼顾',
  selling_points: ['大曲坤沙', '老酒勾调', '赤水河谷产区'],
  brand_tone: '朴实、产区自豪感、有匠心但不装',
  extra_material: '',
}

export default function App() {
  const [form, setForm] = useState<DistilleryInfo>(DEFAULT_FORM)
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse | null>(null)
  const [activeTab, setActiveTab] = useState<string>('wechat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof DistilleryInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [key]: e.target.value })

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generate(form)
      setResult(res)
      const c = await fetchCommentReplies({
        product: form.product_name,
        name: form.name,
        location: form.location,
        price: form.price_range,
      })
      setComments(c)
      setActiveTab(res.contents[0]?.channel ?? 'wechat')
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const active = result?.contents.find((c) => c.channel === activeTab)

  return (
    <div className="layout">
      <header className="header">
        <h1>🍶 酒阵 Agent</h1>
        <p>酱酒厂市场部一个人的内容工厂 —— 输入酒厂信息，产出公众号 / 朋友圈 / 短视频三件套</p>
      </header>

      <div className="columns">
        <section className="panel">
          <h2>酒厂信息</h2>
          <label>酒厂名称<input value={form.name} onChange={set('name')} /></label>
          <label>产区位置<input value={form.location} onChange={set('location')} /></label>
          <label>主推产品名<input value={form.product_name} onChange={set('product_name')} /></label>
          <label>价格带<input value={form.price_range} onChange={set('price_range')} /></label>
          <label>目标人群<input value={form.target_audience} onChange={set('target_audience')} /></label>
          <label>卖点（顿号分隔）<input value={form.selling_points.join('、')} onChange={(e) => setForm({ ...form, selling_points: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })} /></label>
          <label>品牌语气<input value={form.brand_tone} onChange={set('brand_tone')} /></label>
          <label>产区素材 / 酒厂故事（可选）<textarea rows={3} value={form.extra_material ?? ''} onChange={set('extra_material')} /></label>
          <button className="primary" onClick={handleGenerate} disabled={loading}>
            {loading ? '生成中…' : '生成内容三件套'}
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output">
          {result ? (
            <>
              <nav className="tabs">
                {result.contents.map((c) => (
                  <button
                    key={c.channel}
                    className={activeTab === c.channel ? 'tab active' : 'tab'}
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
              {comments && (
                <div className="comments">
                  <h3>评论区互动建议</h3>
                  {comments.items.map((it) => (
                    <div className="comment" key={it.comment}>
                      <p className="q">👤 {it.comment} <em>{it.intent}</em></p>
                      <p className="a">🤖 {it.reply}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="placeholder">
              <p>左侧填好酒厂信息，点击「生成内容三件套」。</p>
              <p>一条主链路：解析 → 卖点提取 → 三通道并行生成 → 品牌语气校验。</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
