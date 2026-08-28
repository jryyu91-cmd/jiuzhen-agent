import type { DistilleryInfo } from '../types'

interface GeneratorFormProps {
  value: DistilleryInfo
  onChange: (next: DistilleryInfo) => void
  onGenerate: () => void
  loading: boolean
  error: string | null
}

// 区块③-左：卷宗式四组表单卡（衬线序号 01-04）
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
      {/* 01 这瓶酒 */}
      <div className="form-group">
        <span className="serial">01<small>THE JIU</small></span>
        <h3>这瓶酒</h3>
        <p className="g-sub">把产品的底子交代清楚</p>
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
            <label>卖点（顿号分隔）</label>
            <input value={value.selling_points.join('、')} onChange={setSellingPoints} />
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

      {/* 02 卖给谁 */}
      <div className="form-group">
        <span className="serial">02<small>FOR WHOM</small></span>
        <h3>卖给谁</h3>
        <p className="g-sub">想清楚坐到生活桌上的那群人</p>
        <div className="fields">
          <div className="field">
            <label>目标人群</label>
            <input value={value.target_audience} onChange={set('target_audience')} />
          </div>
          <div className="field">
            <label>典型消费场景（选填）</label>
            <input
              value={value.consume_scene ?? ''}
              onChange={set('consume_scene')}
              placeholder="如：周末炖菜、烧烤摊朋友小聚、下班到家小酌"
            />
          </div>
        </div>
      </div>

      {/* 03 怎么说话 */}
      <div className="form-group">
        <span className="serial">03<small>THE TONE</small></span>
        <h3>怎么说话</h3>
        <p className="g-sub">语气是品牌的声音，红线是品牌的底线</p>
        <div className="fields">
          <div className="field">
            <label>品牌语气</label>
            <input value={value.brand_tone} onChange={set('brand_tone')} />
          </div>
          <div className="field">
            <label>语气红线（顿号分隔，选填）</label>
            <input
              value={(value.tone_taboos ?? []).join('、')}
              onChange={setToneTaboos}
              placeholder="如：不摆大师腔、不吹年份"
            />
          </div>
        </div>
      </div>

      {/* 04 素材库 */}
      <div className="form-group">
        <span className="serial">04<small>MATERIALS</small></span>
        <h3>素材库</h3>
        <p className="g-sub">只有你家才有的真细节</p>
        <div className="fields">
          <div className="field">
            <label>酒厂故事 / 产区素材（选填）</label>
            <textarea
              rows={3}
              value={value.extra_material ?? ''}
              onChange={set('extra_material')}
              placeholder="如：酒师傅凌晨四点看酒醅，说这时候的酸香最骗不了人……"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-block gen-btn" disabled={loading}>
        <span className="spark">✦</span> {loading ? '正在装配档案并写作…' : '生成内容三件套'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
