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
const STEP_NAMES = ['交资料', '确认产品', '营销任务', '品牌补充']

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
          <h3>把你手上的东西先交进来</h3>
          <p>不用先整理成标准表格。酿见先读资料，识别不出来的再让你补。</p>
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
              <div><h4>资料不用先整理</h4><p>产品手册、PDF、历史文案、老板发来的文字，先给酿见读。</p></div>
            </div>
            <div className="fields">
              <div className="field">
                <label>上传已有资料 <span>选填</span></label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.csv,.json,text/plain,application/pdf"
                  onChange={(e) => setMaterialFiles(Array.from(e.target.files ?? []))}
                />
                <small>当前 Demo 支持 PDF 文本版、TXT、MD、CSV、JSON；正式产品可继续接图片/OCR、微信资料和企业知识库。</small>
              </div>
              {materialFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {materialFiles.map((file) => <span className="choice-chip active" key={`${file.name}-${file.size}`}>{file.name}</span>)}
                </div>
              )}
              <div className="field">
                <label>或者直接粘贴一段资料 <span>选填</span></label>
                <textarea
                  rows={7}
                  value={materialNotes}
                  onChange={(e) => setMaterialNotes(e.target.value)}
                  placeholder={'例如直接粘贴：\n酒厂：青溪酒厂\n产品名称：青溪·小坛\n建议零售价：168元\n瓶身标注酒精度：42%vol\n……'}
                />
              </div>
              <div style={{ padding: 12, border: '1px solid #e5e7e5', borderRadius: 12, background: '#f8f8f6', fontSize: 11.5, color: '#697079' }}>
                酿见先做的是<strong style={{ color: '#17191d' }}>事实提取</strong>，不会因为“这类酒通常怎样”就替企业补工艺、年份或资质。识别结果下一步由人确认。
              </div>
              {materialAnalysis && (
                <div style={{ padding: 12, border: '1px solid #d6ebe2', borderRadius: 12, background: '#e8f5ef', fontSize: 11.5 }}>
                  已读取 {materialAnalysis.source_names.length} 份资料 · 提取 {materialAnalysis.extracted_facts.length} 条可追溯事实
                  {materialAnalysis.missing_fields.length > 0 ? ` · 待确认：${materialAnalysis.missing_fields.join('、')}` : ' · 核心字段已识别'}
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
              <div><h4>确认酿见读对了吗</h4><p>AI 负责整理，人负责最后确认。以后确认过的内容可以复用。</p></div>
            </div>
            <div className="fields">
              {(value.source_materials?.length ?? 0) > 0 && (
                <div style={{ padding: 11, borderRadius: 11, background: '#eeeeff', color: '#4e4fb6', fontSize: 11.5 }}>
                  已从 {value.source_materials?.length} 份原始资料预填。只需要改错的，不用重新抄一遍。
                </div>
              )}
              <div className="form-grid2">
                <div className="field">
                  <label>产品名 <em>需要确认</em></label>
                  <input value={value.product_name} onChange={set('product_name')} placeholder="如：青溪·小坛" autoFocus />
                </div>
                <div className="field">
                  <label>价格带</label>
                  <input value={value.price_range} onChange={set('price_range')} placeholder="如：168 元" />
                </div>
              </div>
              <div className="field">
                <label>已识别 / 已确认卖点</label>
                <input value={value.selling_points.join('、')} onChange={setSellingPoints} placeholder="香型、度数、规格、已确认工艺，用顿号分隔" />
                <small>删除不确定的项。后面的发布检查会继续验证证据。</small>
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
              <div><h4>今天想解决什么？</h4><p>营销不是先选“生成哪篇文案”，而是先说清这次任务。</p></div>
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
                <label>你已经知道的目标人群 <span>选填</span></label>
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

        {step === 3 && (
          <>
            <div className="pane-title">
              <span>04</span>
              <div><h4>只补资料里没有的</h4><p>这些信息会逐渐沉淀成酒厂自己的营销记忆，不需要每次重填。</p></div>
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
                <label>事实证据 <span>已自动提取的可继续人工修正</span></label>
                <textarea
                  rows={5}
                  value={evidenceText}
                  onChange={setEvidence}
                  placeholder={'每行一条：标签｜事实｜来源\n例如：度数｜42%vol｜瓶身标签\n工艺｜大曲坤沙｜产品检测/企业资料'}
                />
                <small>真实产品里这里会继续保留“来源 + 原文片段”，方便发布前回看。</small>
              </div>
              <div className="field">
                <label>真实故事 / 人物 / 车间细节 <span>选填</span></label>
                <textarea rows={4} value={value.extra_material ?? ''} onChange={set('extra_material')} placeholder="资料里没有、但你能确认的细节，可以在这里补。" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="step-actions">
        {step > 0 ? <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>← 上一步</button> : <span />}
        {step === 0 ? (
          <button type="submit" className="btn btn-primary" disabled={extracting}>
            <span className="spark">✦</span>{extracting ? '酿见正在读资料…' : (materialFiles.length || materialNotes.trim() ? '先让酿见读资料' : '没有资料，手动开始')}
          </button>
        ) : step < 3 ? (
          <button type="submit" className="btn btn-primary" disabled={!canNext}>下一步 <span>→</span></button>
        ) : (
          <button type="submit" className="btn btn-primary run-agent" disabled={loading || !canNext}>
            <span className="spark">✦</span>{loading ? '酿见正在分析…' : '生成这次营销任务'}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
