// 区块① 品牌定位区：生活方式叙事 + 三缺痛点 + ROI 对比（纯静态，无 props）
export default function BrandHero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <p className="hero-kicker">酱酒厂市场部 · 一个人的内容工厂</p>
        <h1>白酒，正在变成一种<span>生活方式</span></h1>
        <p className="hero-sub">
          像咖啡一样，从应酬桌走向生活桌——酒阵 Agent 帮酒厂把这句话，讲给年轻人听。
        </p>
        <div className="hero-cards">
          <div className="hero-card">
            <strong>缺品牌</strong>
            <span>中小酒企有酒没故事，内容靠copy大厂，讲不出自己产区的底气</span>
          </div>
          <div className="hero-card">
            <strong>缺资金</strong>
            <span>代运营报价 3000-8000 元/月起，一个号一年吃掉一个小厂的销售费用</span>
          </div>
          <div className="hero-card">
            <strong>缺人才</strong>
            <span>一个市场部写不动公众号+朋友圈+短视频三个平台，更盯不完评论区</span>
          </div>
        </div>
        <p className="hero-roi">
          一瓶酒的成本，换一支随叫随到的内容团队：建档 → 三件套生成 → 评论区接住，全程 3 分钟。
        </p>
      </div>
    </section>
  )
}
