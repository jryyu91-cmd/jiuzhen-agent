import { forwardRef } from 'react'
import type { DistilleryInfo, GenerateResponse } from '../types'
import GeneratorForm from './GeneratorForm'
import ResultPanel from './ResultPanel'
import DemoExperience from './DemoExperience'

interface WorkbenchProps {
  form: DistilleryInfo
  onFormChange: (next: DistilleryInfo) => void
  result: GenerateResponse | null
  onGenerate: () => void
  loading: boolean
  error: string | null
  demoMode?: boolean
  demoRunning?: boolean
  onDemoFinish?: () => void
  onDemoSkip?: () => void
  onDemoRetry?: () => void
  onStartOwn?: () => void
}

// 酿见营销工作台：真实使用时左侧输入资料；评审演示先完整展示 Agent 工作过程，再进入结果。
const Workbench = forwardRef<HTMLDivElement, WorkbenchProps>(function Workbench(
  {
    form,
    onFormChange,
    result,
    onGenerate,
    loading,
    error,
    demoMode = false,
    demoRunning = false,
    onDemoFinish,
    onDemoSkip,
    onDemoRetry,
    onStartOwn,
  },
  ref,
) {
  if (demoMode && demoRunning) {
    return (
      <div className="workbench" ref={ref} style={{ gridTemplateColumns: '1fr' }}>
        <DemoExperience
          resultReady={!loading && Boolean(result)}
          error={error}
          onFinish={onDemoFinish ?? (() => {})}
          onSkip={onDemoSkip ?? (() => {})}
          onRetry={onDemoRetry ?? (() => {})}
        />
      </div>
    )
  }

  return (
    <div className="workbench" ref={ref}>
      {demoMode ? (
        <aside className="card form-card">
          <div className="form-card-head">
            <div>
              <span className="mini-label">DEMO COMPLETE</span>
              <h3>完整演示已经跑完</h3>
              <p>现在不用再填任何东西。右边先看策略诊断，再看内容和发布检查。</p>
            </div>
            <span className="step-count">✓</span>
          </div>

          <div className="form-pane">
            <div className="pane-title">
              <span>01</span>
              <div><h4>先看酿见做出的判断</h4><p>重点不是“写了几篇”，而是它为什么建议这些消费者和消费场景。</p></div>
            </div>
            <div className="fields">
              <div style={{ padding: 14, border: '1px solid #e5e7e5', borderRadius: 14, background: '#f8f8f6' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>刚才演示的完整链路：</strong>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: '#697079' }}>
                  读取酒厂资料 → 提取有来源的事实 → 判断人群和场景 → 生成内容 → 发布前检查
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>①</b><span style={{ fontSize: 12 }}>先看右边的<strong>策略诊断</strong>：这瓶酒先卖给谁，为什么。</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>②</b><span style={{ fontSize: 12 }}>再点<strong>内容资产</strong>：判断怎么变成公众号、朋友圈和短视频。</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>③</b><span style={{ fontSize: 12 }}>最后看<strong>发布检查</strong>：哪些话有依据，哪些还要补证据。</span></div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <span />
            <button type="button" className="btn btn-primary" onClick={onStartOwn}>换成我的资料试试 <span>→</span></button>
          </div>
        </aside>
      ) : (
        <GeneratorForm
          value={form}
          onChange={onFormChange}
          onGenerate={onGenerate}
          loading={loading}
          error={error}
        />
      )}
      <ResultPanel result={result} loading={loading} />
    </div>
  )
})

export default Workbench
