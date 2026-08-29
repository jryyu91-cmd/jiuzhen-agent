import { forwardRef } from 'react'
import type { DistilleryInfo, GenerateResponse } from '../types'
import GeneratorForm from './GeneratorForm'
import ResultPanel from './ResultPanel'

interface WorkbenchProps {
  form: DistilleryInfo
  onFormChange: (next: DistilleryInfo) => void
  result: GenerateResponse | null
  onGenerate: () => void
  loading: boolean
  error: string | null
  demoMode?: boolean
  onStartOwn?: () => void
}

// 酿见营销工作台：真实使用时左侧输入资料；一键演示时左侧只解释演示状态，避免用户误以为还要继续填表。
const Workbench = forwardRef<HTMLDivElement, WorkbenchProps>(function Workbench(
  { form, onFormChange, result, onGenerate, loading, error, demoMode = false, onStartOwn },
  ref,
) {
  return (
    <div className="workbench" ref={ref}>
      {demoMode ? (
        <aside className="card form-card">
          <div className="form-card-head">
            <div>
              <span className="mini-label">QUICK DEMO</span>
              <h3>演示已经自动跑完</h3>
              <p>这次不用继续填表。系统已经代入一份贵州白酒演示资料，直接看右边结果就行。</p>
            </div>
            <span className="step-count">✓</span>
          </div>

          <div className="form-pane">
            <div className="pane-title">
              <span>01</span>
              <div><h4>先看“策略诊断”</h4><p>看看酿见为什么建议这些消费者和消费场景。</p></div>
            </div>
            <div className="fields">
              <div style={{ padding: 14, border: '1px solid #e5e7e5', borderRadius: 14, background: '#f8f8f6' }}>
                <strong style={{ display: 'block', marginBottom: 6 }}>这次演示已经替你完成：</strong>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: '#697079' }}>
                  代入产品资料 → 识别事实 → 判断人群和场景 → 生成内容 → 做发布检查
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>①</b><span style={{ fontSize: 12 }}>先看右边的<strong>策略诊断</strong>，理解这瓶酒先卖给谁、在哪些场景测试。</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>②</b><span style={{ fontSize: 12 }}>再点<strong>内容资产</strong>，看公众号、朋友圈和短视频怎么落地。</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><b style={{ color: '#762e3f' }}>③</b><span style={{ fontSize: 12 }}>最后看<strong>发布检查</strong>，哪些话有依据、哪些还需要补证据。</span></div>
              </div>
            </div>
          </div>

          <div className="step-actions">
            <span />
            <button type="button" className="btn btn-primary" onClick={onStartOwn}>用我的资料重新试 <span>→</span></button>
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
