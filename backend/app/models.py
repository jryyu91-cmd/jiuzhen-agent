"""酿见 AI · 数据模型定义"""
from pydantic import BaseModel, Field
from typing import Optional


class FactEvidence(BaseModel):
    """品牌事实证据：每一个可对外传播的硬事实都尽量绑定来源。"""
    label: str = Field(..., description="事实类型，如 工艺/度数/产区/资质/溯源")
    value: str = Field(..., description="事实内容")
    source: str = Field(default="", description="来源，如 检测报告/瓶身标签/企业资料/资质证书")
    source_excerpt: str = Field(default="", description="来源中的原文片段，便于回看证据")
    confidence: str = Field(default="confirmed", description="confirmed / inferred / needs_review")


class SourceMaterial(BaseModel):
    """企业原始资料。产品不要求企业先整理成标准字段。"""
    name: str
    media_type: str = "text/plain"
    text: str = ""
    source_kind: str = "upload"


class MaterialAnalysis(BaseModel):
    """资料理解结果：先把散乱资料变成可确认的品牌事实，再进入营销判断。"""
    source_names: list[str] = Field(default_factory=list)
    extracted_facts: list[FactEvidence] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)
    mode: str = "rules"


class MaterialProfileDraft(BaseModel):
    """从原始资料中抽出的档案草稿。只提取资料支持的内容，不替企业补事实。"""
    name: str = ""
    location: str = ""
    product_name: str = ""
    price_range: str = ""
    selling_points: list[str] = Field(default_factory=list)
    fact_evidence: list[FactEvidence] = Field(default_factory=list)
    extra_material: str = ""


class MaterialExtractResponse(BaseModel):
    materials: list[SourceMaterial] = Field(default_factory=list)
    analysis: MaterialAnalysis
    draft: MaterialProfileDraft


class BrandProfile(BaseModel):
    """一厂一档 · 品牌档案。"""
    profile_id: str = Field(..., description="档案唯一标识")
    distillery_name: str = Field(..., description="酒厂名称")
    positioning: str = Field(default="", description="一句话定位")
    lifestyle_scene: str = Field(default="", description="已经验证或希望测试的生活场景")
    location: str = Field(default="贵州遵义", description="产区位置")
    product_name: str = Field(..., description="主推产品名")
    price_range: str = Field(default="300-500元", description="价格带")
    target_audience: str = Field(default="", description="已知目标人群；不知道可留空，由营销诊断模块反推")
    selling_points: list[str] = Field(default_factory=list, description="已经确认的卖点关键词")
    brand_tone: str = Field(default="朴实、可信、有生活感", description="品牌语气")
    tone_taboos: list[str] = Field(default_factory=list, description="品牌表达红线")
    topic_preferences: list[str] = Field(default_factory=list, description="选题倾向")
    scene_materials: list[str] = Field(default_factory=list, description="真实场景素材库")
    fact_evidence: list[FactEvidence] = Field(default_factory=list, description="已确认事实与证据来源")
    extra_material: Optional[str] = Field(default=None, description="自由素材文本")


class DistilleryInfo(BaseModel):
    """一次营销任务的输入。未知的人群/场景允许为空，由 Agent 诊断。"""
    name: str = Field(default="", description="酒厂/品牌名称")
    location: str = Field(default="", description="产区位置")
    product_name: str = Field(default="", description="主推产品名")
    price_range: str = Field(default="", description="价格带")
    target_audience: str = Field(default="", description="已知目标人群；可留空")
    selling_points: list[str] = Field(default_factory=list, description="已确认卖点")
    consume_scene: Optional[str] = Field(default=None, description="已经发生或希望测试的消费场景；可留空")
    marketing_goal: str = Field(default="消费者动销", description="营销目标")
    existing_channels: list[str] = Field(default_factory=list, description="当前已有渠道")
    brand_tone: str = Field(default="朴实、可信、有生活感", description="品牌语气")
    tone_taboos: list[str] = Field(default_factory=list, description="品牌表达红线")
    fact_evidence: list[FactEvidence] = Field(default_factory=list, description="已确认事实与来源")
    extra_material: Optional[str] = Field(default=None, description="人物、车间、餐桌等真实素材")
    source_materials: list[SourceMaterial] = Field(default_factory=list, description="企业原始资料，可由上传/粘贴产生")


class AudienceSegment(BaseModel):
    name: str
    need: str
    trigger: str
    recommended_scene: str
    priority: str


class SceneOpportunity(BaseModel):
    scene: str
    why_fit: str
    content_angle: str
    conversion_action: str


class MarketingDiagnosis(BaseModel):
    core_problem: str
    strategy: str
    audience_segments: list[AudienceSegment] = Field(default_factory=list)
    scene_opportunities: list[SceneOpportunity] = Field(default_factory=list)
    channel_plan: list[str] = Field(default_factory=list)
    next_action: str


class GeneratedContent(BaseModel):
    channel: str
    title: Optional[str] = None
    body: str
    hashtags: list[str] = Field(default_factory=list)


class ComplianceIssue(BaseModel):
    level: str
    rule: str
    excerpt: str
    suggestion: str


class ComplianceReport(BaseModel):
    passed: bool
    issues: list[ComplianceIssue] = Field(default_factory=list)
    fact_gaps: list[str] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    distillery: str
    diagnosis: MarketingDiagnosis
    contents: list[GeneratedContent]
    compliance: ComplianceReport
    material_analysis: Optional[MaterialAnalysis] = None
    pipeline_trace: list[str] = Field(default_factory=list)


class CommentReply(BaseModel):
    comment: str
    reply: str
    intent: str


class CommentResponse(BaseModel):
    items: list[CommentReply]
