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
  target_audience: '30-45岁男性、商务送礼与自饮兼顾',
  selling_points: ['大曲坤沙', '老酒勾调', '赤水河谷产区'],
  consume_scene: '',
  brand_tone: '朴实、产区自豪感、有匠心但不装',
  tone_taboos: [],
  extra_material: '',
}

export default function App() {
  const [form, setForm] = useState<DistilleryInfo>(DEFAULT_FORM)
  const [profiles, setProfiles] = useState<ProfileFull[]>([])
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

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
    resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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

  // 案例馆「用此档案生成」：生成 → 档案回填表单（装配可视化）→ 滚到结果
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
        brand_tone: p.brand_tone,
        tone_taboos: [...p.tone_taboos],
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
      <main className="layout">
        <ShowcaseGallery profiles={profiles} onUseProfile={handleUseProfile} loading={loading} />
        <section className="section" id="workbench">
          <header className="section-head">
            <h2>🛠️ 自由生成</h2>
            <p className="section-sub">没有档案也能用：手动填酒厂信息，流水线一样跑。</p>
          </header>
          <Workbench
            ref={resultRef}
            form={form}
            onFormChange={setForm}
            result={result}
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
          />
        </section>
        <CommentsDemo comments={comments} loading={loading} />
      </main>
      <footer className="page-footer">
        酒阵 Agent · 贵客松 2026 赛道二（AI×白酒）· 48h 演示版：模板+规则引擎驱动，离线可跑；LLM 接入开关已预留
      </footer>
    </div>
  )
}
