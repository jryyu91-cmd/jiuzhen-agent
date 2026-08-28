import type { CommentResponse } from '../types'

interface CommentsDemoProps {
  comments: CommentResponse | null
  loading: boolean
}

// 未生成时展示的内置演示评论（灰字空态）
const DEMO_COMMENTS = [
  { icon: '👤', comment: '这酒多少钱一瓶？', note: '价格咨询' },
  { icon: '👤', comment: '茅台镇几十块的酒多得是，你这不智商税？', note: '质疑真假' },
  { icon: '👤', comment: '哪里能买到？发个链接', note: '要购买链接' },
  { icon: '👤', comment: '中秋送老丈人拿得出手吗？', note: '送礼场景' },
]

// 区块④ 评论区演示：四类高频评论，规则引擎秒回（未生成时显示内置空态）
export default function CommentsDemo({ comments, loading }: CommentsDemoProps) {
  return (
    <section className="section" id="comments-demo">
      <div className="comments-layout">
        <header className="section-head">
          <h2>💬 评论区，也是内容的一部分</h2>
          <p className="section-sub">
            价格、真假、链接、送礼——中小酒企最常被问到的四类评论。
            规则引擎秒级接住，不用一个人盯评论到半夜。生成内容后，回复会自动带上你家酒的信息。
          </p>
        </header>

        <div className="comments-grid">
          {(comments?.items ?? []).map((it) => (
            <div className="comment-card" key={it.comment}>
              <p className="q"><span className="avatar">👤</span>{it.comment}</p>
              <span className="intent-badge">{it.intent}</span>
              <p className="a"><span className="avatar bot">🤖</span>{it.reply}</p>
            </div>
          ))}
          {!comments && DEMO_COMMENTS.map((d) => (
            <div className="comment-card muted" key={d.comment}>
              <p className="q"><span className="avatar">{d.icon}</span>{d.comment}</p>
              <span className="intent-badge">{d.note}</span>
              <p className="a">{loading ? '🤖 正在生成，回复马上来…' : '🤖 先在工作台生成一次，看 AI 怎么自动接住用户'}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
