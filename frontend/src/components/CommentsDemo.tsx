import type { CommentResponse } from '../types'

interface CommentsDemoProps {
  comments: CommentResponse | null
  loading: boolean
}

// 未生成时展示的内置演示对话（灰字空态，头像取首字）
const DEMO_COMMENTS = [
  { user: '酱香观察员', ch: '公众号留言 · 2 小时前', q: '这酒多少钱一瓶？哪里能买到？', head: '客' },
  { user: '只喝纯粮的赵哥', ch: '视频号评论 · 昨天', q: '茅台镇三百多的坤沙，是真的坤沙工艺吗？', head: '真' },
  { user: 'Momo', ch: '小红书评论 · 3 小时前', q: '蹲一个链接！想先买一瓶试试', head: '链' },
  { user: '给老爸挑酒的小林', ch: '公众号留言 · 今天 09:40', q: '想给长辈送礼，这款拿得出手吗？', head: '礼' },
]

// 区块④ 评论区演示：AI 用同一种语气接住每一条提问
export default function CommentsDemo({ comments, loading }: CommentsDemoProps) {
  const items = comments?.items ?? []

  return (
    <section className="section" id="comments">
      <div className="wrap">
        <div className="comments-head">
          <h2>评论区，也是内容的一部分</h2>
          <p className="sub">价格、真假、链接、送礼——规则引擎秒级接住，不用一个人盯评论到半夜。以下为演示对话。</p>
        </div>

        <div className="comments-grid">
          {items.map((it) => (
            <article className="card comment" key={it.comment}>
              <div className="comment-top">
                <span className="avatar">{it.intent.slice(0, 1)}</span>
                <div>
                  <div className="comment-user">{it.intent}</div>
                  <div className="comment-meta">刚生成 · 自动接住</div>
                </div>
              </div>
              <p className="comment-q">{it.comment}</p>
              <div className="comment-ai">
                <p>{it.reply}</p>
              </div>
            </article>
          ))}
          {items.length === 0 && DEMO_COMMENTS.map((d) => (
            <article className={`card comment ${loading ? '' : 'comment-card-muted'}`} key={d.q}>
              <div className="comment-top">
                <span className="avatar">{d.head}</span>
                <div>
                  <div className="comment-user">{d.user}</div>
                  <div className="comment-meta">{d.ch}</div>
                </div>
              </div>
              <p className="comment-q">{d.q}</p>
              <div className="comment-ai">
                <p>{loading ? '正在生成，回复马上来…' : '先在工作台生成一次，AI 会带着你家酒的信息自动接住每一条。'}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
