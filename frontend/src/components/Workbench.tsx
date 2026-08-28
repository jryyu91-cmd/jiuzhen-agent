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
}

// 酿见营销工作台：左侧引导输入，右侧展示 Agent 的策略、内容与检查结果。
const Workbench = forwardRef<HTMLDivElement, WorkbenchProps>(function Workbench(
  { form, onFormChange, result, onGenerate, loading, error },
  ref,
) {
  return (
    <div className="workbench" ref={ref}>
      <GeneratorForm
        value={form}
        onChange={onFormChange}
        onGenerate={onGenerate}
        loading={loading}
        error={error}
      />
      <ResultPanel result={result} loading={loading} />
    </div>
  )
})

export default Workbench
