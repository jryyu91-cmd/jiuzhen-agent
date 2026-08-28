import type { DistilleryInfo } from '../types'

interface GeneratorFormProps {
  value: DistilleryInfo
  onChange: (next: DistilleryInfo) => void
  onGenerate: () => void
  loading: boolean
  error: string | null
}

export default function GeneratorForm({ value, onChange, onGenerate, loading, error }: GeneratorFormProps) {
  const set = (key: keyof DistilleryInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange({ ...value, [key]: e.target.value })

  const setSellingPoints = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, selling_points: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  const setToneTaboos = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, tone_taboos: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  return (
    <form className="card form-card" onSubmit={(e) => { e.preventDefault(); onGenerate() }}>
      <div className="form-group">
        <span className="serial">01<small>PRODUCT</small></span>
        <h3>先说清这瓶酒</h3>
        <p className="g-sub">只填你确定知道的产品底层信息，不确定的不要猜</p>
        <div className="fields">
          <div className="form-grid2">
            <div className="field">
              <label>产品名 *</label>
              <input value={value.product_name} onChange={set('product_name')} />
            </div>
            <div className="field">
              <label>价格带</label>
              <input value={value.price_range} onChange={set('price_range')} />
            </div>
          </div>
          <div className="field">
            <label>已知卖点（顿号分隔）</label>
            <input value={value.selling_points.join('、')} onChange={setSellingPoints} placeholder="如：香型、度数、规格、已确认工艺" />
          </div>
          <div className="form-grid2">
            <div className="field">
              <label>酒厂名称</label>
              <input value={value.name} onChange={set('name')} />
            </div>
            <div className="field">
              <label>产区位置</label>
              <input value={value.location} onChange={set('location')} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <span className="serial">02<small>MARKETING</small></span>
        <h3>营销线索</h3>
        <p className="g-sub">知道就填，不知道可以留空，由 Agent 先判断</p>
        <div className="fields">
          <div className="field">
            <label>你认为的目标人群（选填）</label>
            <input
              value={value.target_audience}
              onChange={set('target_audience')}
              placeholder="不知道可以不填，Agent 会按价格带与产品信息反推"
            />
          </div>
          <div className="field">
            <label>已有真实消费场景（选填）</label>
            <input
              value={value.consume_scene ?? ''}
              onChange={set('consume_scene')}
              placeholder="如：家庭聚餐、朋友小聚、夜宵；没有就留空"
            />
          </div>
          <div className="field">
            <label>当前营销目标</label>
            <input
              value={value.marketing_goal ?? '消费者动销'}
              onChange={set('marketing_goal')}
              placeholder="消费者动销 / 品牌认知 / 新品种草 / 私域转化"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <span className="serial">03<small>VOICE</small></span>
        <h3>品牌怎么说话</h3>
        <p className="g-sub">控制风格，不让不同酒厂最后都写成同一种声音</p>
        <div className="fields">
          <div className="field">
            <label>品牌语气</label>
            <input value={value.brand_tone} onChange={set('brand_tone')} />
          </div>
          <div className="field">
            <label>品牌语气红线（选填）</label>
            <input
              value={(value.tone_taboos ?? []).join('、')}
              onChange={setToneTaboos}
              placeholder="如：不摆大师腔、不用绝对化词汇"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <span className="serial">04<small>EVIDENCE</small></span>
        <h3>真实素材与证据</h3>
        <p className="g-sub">只有这家酒厂才有的真细节，优先于漂亮形容词</p>
        <div className="fields">
          <div className="field">
            <label>酒厂故事 / 人物 / 车间 / 消费者素材（选填）</label>
            <textarea
              rows={4}
              value={value.extra_material ?? ''}
              onChange={set('extra_material')}
              placeholder="只写真实发生、可以确认的细节。正式版还会把工艺、资质、溯源等资料做成事实证据库。"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-block gen-btn" disabled={loading}>
        <span className="spark">✦</span> {loading ? '正在诊断并生成…' : '先诊断，再生成营销内容'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
