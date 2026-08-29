import { useState } from 'react'
import { extractMaterials } from '../api'
import type { DistilleryInfo, FactEvidence, MaterialAnalysis } from '../types'

interface GeneratorFormProps {
  value: DistilleryInfo
  onChange: (next: DistilleryInfo) => void
  onGenerate: () => void
  loading: boolean
  error: string | null
}

const GOALS = ['消费者动销', '新品种草', '品牌认知', '私域转化']
const CHANNELS = ['朋友圈', '短视频', '公众号', '小红书']
const STEP_NAMES = ['给资料', '确认产品', '说目标', '补信息']

export default function GeneratorForm({ value, onChange, onGenerate, loading, error }: GeneratorFormProps) {
  const [step, setStep] = useState(0)
  const [materialFiles, setMaterialFiles] = useState<File[]>([])
  const [materialNotes, setMaterialNotes] = useState('')
  const [materialAnalysis, setMaterialAnalysis] = useState<MaterialAnalysis | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)

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
        return { label, value: fact, source, confidence: 'confirmed' }
      })
      .filter((item) => item.label && item.value)
    onChange({ ...value, fact_evidence: items })
  }

  const mergeEvidence = (existing: FactEvidence[], incoming: FactEvidence[]) => {
    const keys = new Set(existing.map((item) => `${item.label}|${item.value}|${item.source}`))
    return [...existing, ...incoming.filter((item) => !keys.has(`${item.label}|${item.value}|${item.source}`))]
  }

  const handleAnalyzeMaterials = async () => {
    if (materialFiles.length === 0 && !materialNotes.trim()) {
      setStep(1)
      return
    }
    setExtracting(true)
    setExtractError(null)
    try {
      const res = await extractMaterials(materialFiles, materialNotes)
      setMaterialAnalysis(res.analysis)
      const draft = res.draft
      const nextPoints = [...value.selling_points]
      draft.selling_points.forEach((point) => { if (!nextPoints.includes(point)) nextPoints.push(point) })
      onChange({
        ...value,
        name: value.name || draft.name,
        location: value.location || draft.location,
        product_name: value.product_name || draft.product_name,
        price_range: value.price_range || draft.price_range,
        selling_points: nextPoints,
        fact_evidence: mergeEvidence(value.fact_evidence ?? [], draft.fact_evidence),
        extra_material: value.extra_material || draft.extra_material,
        source_materials: res.materials,
      })
      setStep(1)
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : '资料读取失败')
    } finally {
      setExtracting(false)
    }
  }

  const canNext = value.product_name.trim().length > 0

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 0) {
      void handleAnalyzeMaterials()
      return
    }
    if (!canNext) return
    if (step < 3) {
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
          <h3>手头有什么，就先给酿见什么</h3>
          <p>产品手册、PDF、过去写过的内容都可以。酿见先自己读，实在看不出来的再问你。</p>
        </div>
        <span className="step-count">{step + 1} / 4</span>
      </div>

      <div className="form-step-nav" role="tablist" aria-label="填写步骤" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {STEP_NAMES.map((name, idx) => (
          <button
            key={name}
            type="button"
            className={`step-chip ${step === idx ? 'active' : ''} ${idx < step ? 'done' : ''}`}
            onClick={() => { if (idx === 0 || idx === 1 || canNext) setStep(idx) }}
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
              <div><h4>先把现成资料给酿见</h4><p>不用为了用 AI 再做一份新表格。你现在有什么资料，就直接上传或粘贴。</p></div>
            </div>
            <div className="fields">
              <div className="field">
                <label>上传手头已有的文件 <span>选填</span></label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.csv,.json,text/plain,application/pdf"
                  onChange={(e) => setMaterialFiles(Array.from(e.target.files ?? []))}
                />
                <small>当前 Demo 支持文本型 PDF、TXT、MD、CSV、JSON。以后可以继续接图片、瓶身照片、微信资料和企业知识库。</small>
              </div>
              {materialFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {materialFiles.map((file) => <span className="choice-chip active" key={`${file.name}-${file.size}`}>{file.name}</span>)}
                </div>
              )}
              <div className="field">
                <label>没有文件？直接粘一段文字也可以 <span>选填</span></label>
                <textarea
                  rows={7}
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  placeholder={'例如直接粘贴：\n酒厂：青溪酒厂\n产品名称：青溪·小坛\n建议零售价：168元\n瓶身标注酒精度：53%vol\n……'}
                />
              </div>
              <div style={{ padding: 12, border: '1px solid #e5e7e5', borderRadius: 12, background: '#f8f8f6', fontSize: 11.5, color: '#697079' }}>
                酿见先找的是<strong style={{ color: '#17191d' }}>“资料里真的写了什么”</strong>。比如度数、价格、规格、产区会保留来源；资料没写的工艺、年份、资质，不会替酒厂编出来。
              </div>
              {materialAnalysis && (
                <div style={{ padding: 12, border: '1px solid #d6ebe2', borderRadius: 12, background: '#e8f5ef', fontSize: 11.5 }}>
                  已读取 {materialAnalysis.source_names.length} 份资料 · 找到 {materialAnalysis.extracted_facts.length} 条有来源的信息
                  {materialAnalysis.missing_fields.length > 0 ? ` · 还需要你确认：${materialAnalysis.missing_fields.join('、')}` : ' · 主要信息已经识别'}
                </div>
              )}
              {extractError && <p className="error">{extractError}</p>}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="pane-title">
              <span>02</span>
              <div><h4>看一眼，酿见有没有读错</h4><p>你只需要改错的、补缺的，不用重新抄一遍资料。</p></div>
            </div>
            <div className="fields">
              {(value.source_materials?.length ?? 0) > 0 && (
                <div style={{ padding: 11, borderRadius: 11, background: '#eeeeff', color: '#4e4fb6', fontSize: 11.5 }}>
                  已从 {value.source_materials?.length} 份原始资料自动预填。确认没问题就继续下一步。
                </div>
              )}
              <div className="form-grid2">
                <div className="field">
                  <label>产品名 <em>需要确认</em></label>
                  <input value={value.product_name} onChange={set('product_name')} placeholder="如：青溪·小坛" autoFocus />
                </div>
                <div className="field">
                  <label>价格</label>
                  <input value={value.price_range} onChange={set('price_range')} placeholder="如：168 元" />
                </div>
              </div>
              <div className="field">
                <label>已经确认的产品特点</label>
                <input value={value.selling_points.join('、')} onChange={setSellingPoints} placeholder="如：53%vol、小规格、大曲坤沙，用顿号分隔" />
                <small>不确定的就删掉。后面的发布检查还会继续核对依据。</small>
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

        {step === 2 && (
          <>
            <div className="pane-title">
              <span>03</span>
              <div><h4>这次最想解决什么？</h4><p>不用先想“写公众号还是朋友圈”，先告诉酿见这次要解决的生意问题。</p></div>
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
                <label>你已经知道哪些人会买 <span>选填</span></label>
                <input value={value.target_audience} onChange={set('target_audience')} placeholder="不知道就留空，让酿见先判断" />
              </div>
              <div className="field">
                <label>你已经见过哪些真实消费场景 <span>选填</span></label>
                <input value={value.consume_scene ?? ''} onChange={set('consume_scene')} placeholder="如：家庭聚餐、朋友小聚、夜宵；不知道就留空" />
              </div>
              <div className="field">
                <label>目前在用哪些渠道</label>
                <div className="choice-row">
                  {CHANNELS.map((channel) => (
                    <button key={channel} type="button" className={`choice-chip ${(value.existing_channels ?? []).includes(channel) ? 'active' : ''}`} onClick={() => toggleChannel(channel)}>{channel}</button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="pane-title">
              <span>04</span>
              <div><h4>最后补一点资料里没有的信息</h4><p>这些内容以后会记在这家酒厂的档案里，不需要每次重新填。</p></div>
            </div>
            <div className="fields">
              <div className="field">
                <label>品牌平时怎么说话</label>
                <input value={value.brand_tone} onChange={set('brand_tone')} placeholder="如：朴实、可信、有生活感" />
              </div>
              <div className="field">
                <label>哪些话坚决不要说 <span>选填</span></label>
                <input value={(value.tone_taboos ?? []).join('、')} onChange={setToneTaboos} placeholder="如：不摆大师腔、不用绝对化词汇" />
              </div>
              <div className="field">
                <label>已经确认的事实和来源 <span>AI 提取后也可以人工修改</span></label>
                <textarea
                  rows={5}
                  value={evidenceText}
                  onChange={setEvidence}
                  placeholder={'每行一条：标签｜事实｜来源\n例如：度数｜53%vol｜瓶身标签\n工艺｜大曲坤沙｜企业产品资料'}
                />
                <small>以后实际使用时，这里会继续保留“来自哪份文件 + 哪段原文”，发布前随时可以回看。</small>
              </div>
              <div className="field">
                <label>还有哪些真实故事 / 人物 / 车间细节 <span>选填</span></label>
                <textarea rows={4} value={value.extra_material ?? ''} onChange={set('extra_material')} placeholder="资料里没写、但你确定真实发生过的内容，可以补在这里。" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="step-actions">
        {step > 0 ? <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← 上一步</button> : <span />}
        {step === 0 ? (
          <button type="submit" className="btn btn-primary" disabled={extracting}>
            <span className="spark">✦</span>{extracting ? '酿见正在读资料…' : (materialFiles.length || materialNotes.trim() ? '让酿见先读一下' : '没有资料，直接手动填写')}
          </button>
        ) : step < 3 ? (
          <button type="submit" className="btn btn-primary" disabled={!canNext}>下一步 <span>→</span></button>
        ) : (
          <button type="submit" className="btn btn-primary run-agent" disabled={loading || !canNext}>
            <span className="spark">✦</span>{loading ? '酿见正在分析…' : '让酿见开始判断'}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
