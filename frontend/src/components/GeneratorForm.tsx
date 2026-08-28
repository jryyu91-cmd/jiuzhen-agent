import { useState } from 'react'
import type { DistilleryInfo, FactEvidence } from '../types'

interface GeneratorFormProps {
  value: DistilleryInfo
  onChange: (next: DistilleryInfo) => void
  onGenerate: () => void
  loading: boolean
  error: string | null
}

const GOALS = ['消费者动销', '新品种草', '品牌认知', '私域转化']
const CHANNELS = ['朋友圈', '短视频', '公众号', '小红书']

export default function GeneratorForm({ value, onChange, onGenerate, loading, error }: GeneratorFormProps) {
  const [step, setStep] = useState(0)

  const set = (key: keyof DistilleryInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => onChange({ ...value, [key]: e.target.value })

  const setSellingPoints = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, selling_points: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  const setToneTaboos = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, tone_taboos: e.target.value.split(/[、,，]/).map((s) => s.trim()).filter(Boolean) })

  const toggleChannel = (channel: string) => {
    const now = value.existing_channels ?? []
    onChange({
      ...value,
      existing_channels: now.includes(channel) ? now.filter((c) => c !== channel) : [...now, channel],
    })
  }

  const evidenceText = (value.fact_evidence ?? [])
    .map((e) => `${e.label}｜${e.value}｜${e.source}`)
    .join('\n')

  const setEvidence = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items: FactEvidence[] = e.target.value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label = '', fact = '', source = ''] = line.split(/[|｜]/).map((s) => s.trim())
        return { label, value: fact, source }
      })
      .filter((item) => item.label && item.value)
    onChange({ ...value, fact_evidence: items })
  }

  const canNext = value.product_name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canNext) return
    if (step < 2) {
      setStep(step + 1)
      return
    }
    onGenerate()
  }

  return (
    <form className="card form-card" onSubmit={submit}>
      <div className="form-card-head">
        <div>
          <span className="mini-label">NEW MARKETING TASK</span>
          <h3>新建营销任务</h3>
          <p>不用一次填完。确定的信息填上，不知道的交给 Agent 判断。</p>
        </div>
        <span className="step-count">{step + 1} / 3</span>
      </div>

      <div className="form-step-nav" role="tablist" aria-label="填写步骤">
        {['产品底子', '营销线索', '品牌证据'].map((name, idx) => (
          <button
            key={name}
            type="button"
            className={`step-chip ${step === idx ? 'active' : ''} ${idx < step ? 'done' : ''}`}
            onClick={() => { if (idx === 0 || canNext) setStep(idx) }}
          >
            <span>{idx < step ? '✓' : idx + 1}</span>{name}
          </button>
        ))}
      </div>

      <div className="form-pane" key={step}>
        {step === 0 && (
          <>
            <div className="pane-title">
              <span>01</span>
              <div><h4>先说清这瓶酒</h4><p>这是 Agent 做所有判断的基础。</p></div>
            </div>
            <div className="fields">
              <div className="form-grid2">
                <div className="field">
                  <label>产品名 <em>必填</em></label>
                  <input value={value.product_name} onChange={set('product_name')} placeholder="如：青溪·小坛" autoFocus />
                </div>
                <div className="field">
                  <label>价格带</label>
                  <input value={value.price_range} onChange={set('price_range')} placeholder="如：168 元" />
                </div>
              </div>
              <div className="field">
                <label>已确认卖点</label>
                <input value={value.selling_points.join('、')} onChange={setSellingPoints} placeholder="香型、度数、规格、已确认工艺，用顿号分隔" />
                <small>只写确定的信息，不确定的不要猜。</small>
              </div>
              <div className="form-grid2">
                <div className="field">
                  <label>酒厂 / 品牌</label>
                  <input value={value.name} onChange={set('name')} placeholder="如：青溪酒厂" />
                </div>
                <div className="field">
                  <label>产区位置</label>
                  <input value={value.location} onChange={set('location')} placeholder="如：贵州遵义" />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="pane-title">
              <span>02</span>
              <div><h4>你现在知道多少营销线索？</h4><p>知道就填，不知道全部可以跳过。</p></div>
            </div>
            <div className="fields">
              <div className="field">
                <label>当前营销目标</label>
                <div className="choice-row">
                  {GOALS.map((goal) => (
                    <button key={goal} type="button" className={`choice-chip ${value.marketing_goal === goal ? 'active' : ''}`} onClick={() => onChange({ ...value, marketing_goal: goal })}>{goal}</button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label>你认为的目标人群 <span>选填</span></label>
                <input value={value.target_audience} onChange={set('target_audience')} placeholder="不知道就留空，让 Agent 反推" />
              </div>
              <div className="field">
                <label>已经发生过的真实消费场景 <span>选填</span></label>
                <input value={value.consume_scene ?? ''} onChange={set('consume_scene')} placeholder="如：家庭聚餐、朋友小聚、夜宵；没有就留空" />
              </div>
              <div className="field">
                <label>目前在用的渠道</label>
                <div className="choice-row">
                  {CHANNELS.map((channel) => (
                    <button key={channel} type="button" className={`choice-chip ${(value.existing_channels ?? []).includes(channel) ? 'active' : ''}`} onClick={() => toggleChannel(channel)}>{channel}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="pane-title">
              <span>03</span>
              <div><h4>给 Agent 真实材料</h4><p>越真实，越不像“任何酒厂都能套”的文案。</p></div>
            </div>
            <div className="fields">
              <div className="field">
                <label>品牌语气</label>
                <input value={value.brand_tone} onChange={set('brand_tone')} placeholder="如：朴实、可信、有生活感" />
              </div>
              <div className="field">
                <label>表达红线 <span>选填</span></label>
                <input value={(value.tone_taboos ?? []).join('、')} onChange={setToneTaboos} placeholder="如：不摆大师腔、不用绝对化词汇" />
              </div>
              <div className="field">
                <label>事实证据 <span>推荐填写</span></label>
                <textarea
                  rows={4}
                  value={evidenceText}
                  onChange={setEvidence}
                  placeholder={'每行一条：标签｜事实｜来源\n例如：度数｜42%vol｜瓶身标签\n工艺｜大曲坤沙｜产品检测/企业资料'}
                />
                <small>后续内容涉及这些事实时，Agent 才有依据可用。</small>
              </div>
              <div className="field">
                <label>真实故事 / 人物 / 车间细节 <span>选填</span></label>
                <textarea rows={4} value={value.extra_material ?? ''} onChange={set('extra_material')} placeholder="写真实发生、可以确认的细节。" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="step-actions">
        {step > 0 ? <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← 上一步</button> : <span />}
        {step < 2 ? (
          <button type="submit" className="btn btn-primary" disabled={!canNext}>下一步 <span>→</span></button>
        ) : (
          <button type="submit" className="btn btn-primary run-agent" disabled={loading || !canNext}>
            <span className="spark">✦</span>{loading ? '酿见正在分析…' : '让酿见开始分析'}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
