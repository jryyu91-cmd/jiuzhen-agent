import { forwardRef, useState } from 'react'
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
}

// 区块③ 工作台：左表单 + 右结果（表单状态由 App 持有，供档案回填）
const Workbench = forwardRef<HTMLDivElement, WorkbenchProps>(function Workbench(
  { form, onFormChange, result, onGenerate, loading, error },
  ref,
) {
  return (
    <div className="columns" ref={ref}>
      <section className="panel">
        <h2>🏗️ 内容工作台</h2>
        <p className="panel-hint">按「这瓶酒 → 卖给谁 → 怎么说话 → 素材库」的顺序填，改一个字也能生成。</p>
        <GeneratorForm
          value={form}
          onChange={onFormChange}
          onGenerate={onGenerate}
          loading={loading}
          error={error}
        />
      </section>
      <ResultPanel result={result} />
    </div>
  )
})

export default Workbench
