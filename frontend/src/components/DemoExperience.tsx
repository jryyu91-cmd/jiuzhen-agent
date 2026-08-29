import { useEffect, useMemo, useState } from 'react'

interface DemoExperienceProps {
  resultReady: boolean
  error: string | null
  onFinish: () => void
  onSkip: () => void
  onRetry: () => void
}

const STEP_MS = 4600

const STEPS = [
  {
    title: '打开一份真实工作方式的演示资料',
    detail: '模拟酒厂市场人员把产品手册和过去发过的内容直接交给酿见。',
    output: '青溪·小坛 · 168 元 · 贵州遵义·习水县',
  },
  {
    title: '先读资料，不急着写文案',
    detail: '酿见正在识别产品、价格、度数、规格、产区和已有内容，不要求使用者先整理成表格。',
    output: '读取：产品手册-demo.txt / 历史内容-demo.txt',
  },
  {
    title: '把“事实”和“营销判断”分开',
    detail: '能从资料找到来源的内容进入事实层；找不到依据的说法不会自动补给品牌。',
    output: '53%vol ✓　168 元 ✓　小坛储存 ✓　均保留来源',
  },
  {
    title: '判断这瓶酒先卖给谁、在哪卖',
    detail: '再结合价格、产品事实和已有场景，提出值得先测试的成年消费者与生活场景。',
    output: '优先测试：朋友小聚 / 日常佐餐等具体场景',
  },
  {
    title: '把判断变成能用的内容',
    detail: '策略确定以后，再分别生成公众号、朋友圈和短视频草稿，不把后台分析硬塞进消费者文案。',
    output: '已生成：公众号 × 1　朋友圈 × 1　短视频脚本 × 1',
  },
  {
    title: '发布前再过一道安全闸',
    detail: '最后回看事实依据和酒类营销风险，再把完整结果交给使用者。',
    output: '事实检查 + 营销风险检查 + 评论承接建议',
  },
]

export default function DemoExperience({ resultReady, error, onFinish, onSkip, onRetry }: DemoExperienceProps) {
  const [step, setStep] = useState(0)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    if (error || step >= STEPS.length - 1) return
    const timer = window.setTimeout(() => setStep((current) => Math.min(current + 1, STEPS.length - 1)), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [step, error])

  useEffect(() => {
    if (error || step !== STEPS.length - 1 || !resultReady || finishing) return
    setFinishing(true)
    const timer = window.setTimeout(onFinish, 1500)
    return () => window.clearTimeout(timer)
  }, [step, resultReady, error, finishing, onFinish])

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step])
  const current = STEPS[step]

  if (error) {
    return (
      <div className="card" style={{ padding: 28, gridColumn: '1 / -1' }}>
        <span className="mini-label">DEMO INTERRUPTED</span>
        <h3 style={{ margin: '8px 0 10px', fontSize: 24 }}>演示没有跑完</h3>
        <p style={{ margin: 0, color: '#697079', lineHeight: 1.8 }}>{error}</p>
        <div style={{ marginTop: 20 }}>
          <button type="button" className="btn btn-primary" onClick={onRetry}>重新跑一次演示 <span>→</span></button>
        </div>
      </div>
    )
  }

  return (
    <section className="card" style={{ padding: 28, gridColumn: '1 / -1', overflow: 'hidden' }} aria-live="polite">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <span className="mini-label">30-SECOND FULL DEMO</span>
          <h3 style={{ margin: '8px 0 8px', fontSize: 26 }}>正在演示酿见怎么完成一次营销任务</h3>
          <p style={{ margin: 0, color: '#697079', lineHeight: 1.75 }}>不用操作。看它怎么从酒厂现成资料，一步走到营销判断、内容和发布检查。</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <strong style={{ display: 'block', fontSize: 13 }}>{String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</strong>
          <small style={{ color: '#8a9098' }}>{progress}%</small>
        </div>
      </div>

      <div style={{ height: 6, background: '#ececf0', borderRadius: 99, margin: '24px 0', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#762e3f,#5b5bd6)', borderRadius: 99, transition: 'width .6s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(260px,.8fr)', gap: 22 }}>
        <div style={{ padding: 22, borderRadius: 18, background: 'linear-gradient(145deg,#faf7f8,#f5f4fb)', border: '1px solid #e8e2e5' }}>
          <span style={{ display: 'inline-flex', width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', background: '#762e3f', color: '#fff', fontWeight: 800 }}>{step + 1}</span>
          <h4 style={{ margin: '16px 0 10px', fontSize: 22 }}>{current.title}</h4>
          <p style={{ margin: 0, color: '#60666d', lineHeight: 1.8, fontSize: 13.5 }}>{current.detail}</p>
          <div style={{ marginTop: 18, padding: '13px 15px', borderRadius: 13, background: '#fff', border: '1px solid #e5e7e5' }}>
            <small style={{ display: 'block', marginBottom: 5, color: '#8a9098' }}>当前输出</small>
            <strong style={{ fontSize: 13.5 }}>{current.output}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {STEPS.map((item, idx) => {
            const done = idx < step
            const active = idx === step
            return (
              <div key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12, border: active ? '1px solid #d9ced3' : '1px solid #eceeec', background: active ? '#fff7f8' : '#fff', opacity: idx > step ? .55 : 1, transition: 'all .25s ease' }}>
                <span style={{ width: 24, height: 24, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', fontSize: 10, fontWeight: 800, background: done ? '#e8f5ef' : active ? '#762e3f' : '#f1f2f1', color: done ? '#178562' : active ? '#fff' : '#8a9098' }}>{done ? '✓' : idx + 1}</span>
                <span style={{ fontSize: 11.5, fontWeight: active ? 800 : 600, color: active ? '#17191d' : '#697079' }}>{item.title}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, marginTop: 22, paddingTop: 18, borderTop: '1px solid #eceeec', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11.5, color: '#7a8087' }}>
          {step === STEPS.length - 1
            ? (resultReady ? '完整结果已经准备好，马上进入策略诊断。' : '演示步骤完成，正在等待完整结果返回…')
            : '这是演示过程，不需要你填写任何内容。'}
        </span>
        <button type="button" className="btn btn-secondary" onClick={onSkip} disabled={!resultReady}>跳过过程，直接看结果</button>
      </div>
    </section>
  )
}
