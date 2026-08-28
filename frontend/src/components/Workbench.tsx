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
