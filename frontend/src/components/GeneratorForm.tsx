import type { DistilleryInfo } from '../types'

interface GeneratorFormProps {
  value: DistilleryInfo
  onChange: (next: DistilleryInfo) => void
  onGenerate: () => void
  loading: boolean
  error: string | null
}

// 区块③-左：酒厂信息表单，按内容生产的思考顺序分四组
export default function GeneratorForm({ value, onChange, onGenerate, loading, error }: GeneratorFormProps) {
  const set = (key: keyof DistilleryInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange({ ...value, [key]: e.target.value })

  const setSellingPoints = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, selling_points: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  const setToneTaboos = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, tone_taboos: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  return (
    <div className="form-groups">
      {/* ① 这瓶酒 */}
      <fieldset className="form-group-card">
        <legend>🍶 这瓶酒</legend>
        <label>主推产品名 *<input value={value.product_name} onChange={set('product_name')} /></label>
        <label>价格带<input value={value.price_range} onChange={set('price_range')} /></label>
        <label>卖点（顿号分隔）<input value={value.selling_points.join('、')} onChange={setSellingPoints} /></label>
        <label>酒厂名称<input value={value.name} onChange={set('name')} /></label>
        <label>产区位置<input value={value.location} onChange={set('location')} /></label>
      </fieldset>

      {/* ② 卖给谁 */}
      <fieldset className="form-group-card">
        <legend>🎯 卖给谁</legend>
        <label>目标人群<input value={value.target_audience} onChange={set('target_audience')} /></label>
        <label>典型消费场景（选填）
          <input
            value={value.consume_scene ?? ''}
            onChange={set('consume_scene')}
            placeholder="如：周末炖菜、烧烤摊朋友小聚、下班到家小酌"
          />
        </label>
      </fieldset>

      {/* ③ 怎么说话 */}
      <fieldset className="form-group-card">
        <legend>🗣️ 怎么说话</legend>
        <label>品牌语气<input value={value.brand_tone} onChange={set('brand_tone')} /></label>
        <label>语气红线（顿号分隔，选填）
          <input
            value={(value.tone_taboos ?? []).join('、')}
            onChange={setToneTaboos}
            placeholder="如：不摆大师腔、不吹年份"
          />
        </label>
      </fieldset>

      {/* ④ 素材库 */}
      <fieldset className="form-group-card">
        <legend>📦 素材库</legend>
        <label>酒厂故事 / 产区素材（选填）
          <textarea rows={3} value={value.extra_material ?? ''} onChange={set('extra_material')} placeholder="真实的细节最动人：师傅几点看酒醅、曲仓怎么测温…" />
        </label>
      </fieldset>

      <button className="primary" onClick={onGenerate} disabled={loading}>
        {loading ? '正在装配档案并写作…' : '生成内容三件套 ✦'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
