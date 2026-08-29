import { useEffect, useRef, useState } from 'react'
import { generate, generateByProfile, fetchCommentReplies, listProfiles } from './api'
import type { DistilleryInfo, GenerateResponse, CommentResponse, ProfileFull } from './types'
import BrandHero from './components/BrandHero'
import ShowcaseGallery from './components/ShowcaseGallery'
import Workbench from './components/Workbench'
import CommentsDemo from './components/CommentsDemo'

const DEFAULT_FORM: DistilleryInfo = {
  name: '',
  location: '',
  product_name: '',
  price_range: '',
  target_audience: '',
  selling_points: [],
  consume_scene: '',
  marketing_goal: '消费者动销',
  existing_channels: ['朋友圈', '短视频', '公众号'],
  brand_tone: '朴实、可信、有生活感',
  tone_taboos: [],
  fact_evidence: [],
  extra_material: '',
  source_materials: [],
}

export default function App() {
  const [form, setForm] = useState<DistilleryInfo>(DEFAULT_FORM)
  const [profiles, setProfiles] = useState<ProfileFull[]>([])
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
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
    setDemoMode(false)
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
    setDemoMode(true)
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
        source_materials: [],
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

  const handleQuickDemo = () => {
    const demo = profiles.find((p) => p.profile_id === 'qingxi') ?? profiles[0]
    if (demo) handleUseProfile(demo)
  }

  const handleStartOwn = () => {
    setDemoMode(false)
    setForm(DEFAULT_FORM)
    setResult(null)
    setComments(null)
    setError(null)
    window.setTimeout(() => workbenchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <div className="page">
      <BrandHero onQuickDemo={handleQuickDemo} quickDemoDisabled={loading || profiles.length === 0} />
      <main>
        <ShowcaseGallery profiles={profiles} onUseProfile={handleUseProfile} loading={loading} />

        <section className="section workbench-section" id="workbench">
          <div className="wrap">
            <div className="section-heading workbench-heading">
              <div>
                <span className="section-kicker">MARKETING WORKSPACE</span>
                <h2>把手头资料放进来，剩下的让酿见先做</h2>
                <p>上传产品手册、PDF，或者直接粘一段文字。酿见先识别产品、卖点和事实来源，识别不出的地方才让你补。</p>
              </div>
              <div className="workspace-legend"><span><i className="required-dot" /> 先上传 / 粘贴</span><span><i className="optional-dot" /> AI 先读，人来确认</span></div>
            </div>
            <Workbench
              ref={workbenchRef}
              form={form}
              onFormChange={setForm}
              result={result}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
              demoMode={demoMode}
              onStartOwn={handleStartOwn}
            />
          </div>
        </section>

        <CommentsDemo comments={comments} loading={loading} />
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand"><span className="brand-mark small">见</span><div><strong>酿见 AI</strong><small>把散乱资料变成可用的营销资产。</small></div></div>
          <div className="footer-flow"><span>读资料</span><i>→</i><span>建事实</span><i>→</i><span>找场景</span><i>→</i><span>做内容</span><i>→</i><span>事实 / 合规</span></div>
          <span className="footer-note">中小酒企的 AI 营销大脑</span>
        </div>
      </footer>
    </div>
  )
}
