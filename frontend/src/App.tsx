import { useEffect, useRef, useState } from 'react'
import { generate, generateByProfile, fetchCommentReplies, listProfiles } from './api'
import type { DistilleryInfo, GenerateResponse, CommentResponse, ProfileFull } from './types'
import BrandHero from './components/BrandHero'
import ShowcaseGallery from './components/ShowcaseGallery'
import Workbench from './components/Workbench'
import CommentsDemo from './components/CommentsDemo'

const DEFAULT_FORM: DistilleryInfo = {
  name: '茅台镇老烧坊',
  location: '贵州遵义·茅台镇',
  product_name: '老烧坊·窖藏10',
  price_range: '388元',
  target_audience: '',
  selling_points: ['大曲坤沙', '老酒勾调', '赤水河谷产区'],
  consume_scene: '',
  marketing_goal: '消费者动销',
  existing_channels: ['朋友圈', '短视频', '公众号'],
  brand_tone: '朴实、可信、有生活感',
  tone_taboos: [],
  fact_evidence: [],
  extra_material: '',
}

export default function App() {
  const [form, setForm] = useState<DistilleryInfo>(DEFAULT_FORM)
  const [profiles, setProfiles] = useState<ProfileFull[]>([])
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const workbenchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listProfiles().then(setProfiles).catch(() => setProfiles([]))
  }, [])

  const pullComments = async (f: DistilleryInfo) => {
    const c = await fetchCommentReplies({
      product: f.product_name,
      name: f.name,
      location: f.location,
      price: f.price_range,
    })
    setComments(c)
  }

  const scrollToResult = () =>
    workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await generate(form)
      setResult(res)
      await pullComments(form)
      scrollToResult()
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleUseProfile = async (p: ProfileFull) => {
    setLoading(true)
    setError(null)
    try {
      const res = await generateByProfile(p.profile_id)
      const filled: DistilleryInfo = {
        name: p.distillery_name,
        location: p.location,
        product_name: p.product_name,
        price_range: p.price_range,
        target_audience: p.target_audience,
        selling_points: [...p.selling_points],
        consume_scene: p.lifestyle_scene,
        marketing_goal: '消费者动销',
        existing_channels: ['朋友圈', '短视频', '公众号'],
        brand_tone: p.brand_tone,
        tone_taboos: [...p.tone_taboos],
        fact_evidence: [...p.fact_evidence],
        extra_material: p.scene_materials.join('；'),
      }
      setForm(filled)
      setResult(res)
      await pullComments(filled)
      scrollToResult()
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <BrandHero />
      <main>
        <ShowcaseGallery profiles={profiles} onUseProfile={handleUseProfile} loading={loading} />

        <section className="section" id="workbench">
          <div className="wrap">
            <div className="workbench-head">
              <h2>营销工作台</h2>
              <p className="sub">先交代产品底子；不知道卖给谁、在哪个场景卖，也可以交给 Agent 先诊断。</p>
            </div>
            <Workbench
              ref={workbenchRef}
              form={form}
              onFormChange={setForm}
              result={result}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
            />
          </div>
        </section>

        <CommentsDemo comments={comments} loading={loading} />
      </main>
      <footer className="footer">
        <div className="wrap">
          <span className="brand">酒阵 Agent</span>
          <span className="dot">·</span>
          <span>AI×白酒场景化营销</span>
          <span className="dot">·</span>
          <span>诊断 → 人群场景 → 内容 → 事实核验 → 合规检查</span>
        </div>
      </footer>
    </div>
  )
}
