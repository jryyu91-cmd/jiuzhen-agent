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
    window.setTimeout(() => workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    scrollToResult()
    try {
      const res = await generate(form)
      setResult(res)
      await pullComments(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleUseProfile = async (p: ProfileFull) => {
    setLoading(true)
    setError(null)
    scrollToResult()
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

        <section className="section workbench-section" id="workbench">
          <div className="wrap">
            <div className="section-heading workbench-heading">
              <div>
                <span className="section-kicker">MARKETING WORKSPACE</span>
                <h2>把一瓶酒，变成一条能执行的营销任务</h2>
                <p>左边只填你确定知道的内容，右边看 Agent 的判断和执行结果。目标人群、消费场景不知道都可以留空。</p>
              </div>
              <div className="workspace-legend"><span><i className="required-dot" /> 产品必填</span><span><i className="optional-dot" /> 其余可跳过</span></div>
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
        <div className="wrap footer-inner">
          <div className="footer-brand"><span className="brand-mark small">见</span><div><strong>酿见 AI</strong><small>先看见消费者，再决定怎么卖。</small></div></div>
          <div className="footer-flow"><span>营销诊断</span><i>→</i><span>人群场景</span><i>→</i><span>内容生成</span><i>→</i><span>事实 / 合规</span></div>
          <span className="footer-note">AI × 白酒场景化营销</span>
        </div>
      </footer>
    </div>
  )
}
