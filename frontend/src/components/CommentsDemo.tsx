import type { CommentResponse } from '../types'

interface CommentsDemoProps {
  comments: CommentResponse | null
  loading: boolean
}

const DEMO_COMMENTS = [
  { user: '本地消费者', ch: '公众号留言 · 2 小时前', q: '这款大概什么价位？哪里能了解更多？', head: '价' },
  { user: '酱酒爱好者', ch: '短视频评论 · 昨天', q: '你们说的这个工艺，有资料可以看吗？', head: '证' },
  { user: 'Momo', ch: '内容平台评论 · 3 小时前', q: '想先了解一下这款酒，怎么联系？', head: '问' },
  { user: '给家里挑酒的小林', ch: '公众号留言 · 今天 09:40', q: '家里聚餐用，这款适合什么场景？', head: '场' },
]

export default function CommentsDemo({ comments, loading }: CommentsDemoProps) {
  const items = comments?.items ?? []

  return (
    <section className="section comments-section" id="comments">
      <div className="wrap">
        <div className="section-heading comments-heading">
          <div>
            <span className="section-kicker">CONVERSION HANDOFF</span>
            <h2>内容发出去之后，还要有人接住咨询</h2>
            <p>酿见根据已经确认的产品信息生成回复建议；不知道的信息不替企业承诺，避免为了“回复得快”而编事实。</p>
          </div>
          <span className="safe-note"><i /> 事实安全回复</span>
        </div>

        <div className="comments-grid">
          {items.map((it) => (
            <article className="comment-card" key={it.comment}>
              <div className="comment-top">
                <span className="avatar">{it.intent.slice(0, 1)}</span>
                <div><div className="comment-user">{it.intent}</div><div className="comment-meta">刚生成 · Agent 建议</div></div>
              </div>
              <p className="comment-q">{it.comment}</p>
              <div className="comment-ai"><span>✦ 酿见建议</span><p>{it.reply}</p></div>
            </article>
          ))}
          {items.length === 0 && DEMO_COMMENTS.map((d) => (
            <article className={`comment-card ${loading ? 'is-loading' : 'is-muted'}`} key={d.q}>
              <div className="comment-top">
                <span className="avatar">{d.head}</span>
                <div><div className="comment-user">{d.user}</div><div className="comment-meta">{d.ch}</div></div>
              </div>
              <p className="comment-q">{d.q}</p>
              <div className="comment-ai"><span>✦ 酿见建议</span><p>{loading ? '正在结合产品事实生成回复建议…' : '先在上方工作台跑一次，回复建议会出现在这里。'}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
