"""酒阵 Agent · 数据模型定义"""
from pydantic import BaseModel, Field
from typing import Optional


class FactEvidence(BaseModel):
    """品牌事实证据：只有确认过的事实才允许进入营销内容。"""
    label: str = Field(..., description="事实名称，如 工艺/产区/溯源/物流")
    value: str = Field(..., description="已确认事实")
    source: str = Field(default="企业提供", description="证据来源或资料名称")


class BrandProfile(BaseModel):
    """一厂一档 · 品牌档案。"""
    profile_id: str
    distillery_name: str
    positioning: str = ""
    lifestyle_scene: str = ""
    location: str = "贵州遵义"
    product_name: str
    price_range: str = "300-500元"
    target_audience: str = "成年白酒消费者"
    selling_points: list[str] = Field(default_factory=list)
    brand_tone: str = "朴实、可信、有生活感"
    tone_taboos: list[str] = Field(default_factory=list)
    topic_preferences: list[str] = Field(default_factory=list)
    scene_materials: list[str] = Field(default_factory=list)
    fact_evidence: list[FactEvidence] = Field(default_factory=list)
    extra_material: Optional[str] = None


class DistilleryInfo(BaseModel):
    """酒厂输入信息。不会营销的用户也可只填产品底层信息，由 Agent 反推人群和场景。"""
    name: str
    location: str = "贵州遵义"
    product_name: str
    price_range: str = "300-500元"
    target_audience: str = ""
    selling_points: list[str] = Field(default_factory=list)
    consume_scene: Optional[str] = None
    marketing_goal: str = Field(default="消费者动销", description="消费者动销/品牌认知/新品种草/私域转化")
    existing_channels: list[str] = Field(default_factory=list, description="现有渠道，如 朋友圈/视频号/抖音/线下门店")
    brand_tone: str = "朴实、可信、有生活感"
    tone_taboos: list[str] = Field(default_factory=list)
    fact_evidence: list[FactEvidence] = Field(default_factory=list)
    extra_material: Optional[str] = None


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


class ComplianceIssue(BaseModel):
    level: str
    rule: str
    excerpt: str
    suggestion: str


class ComplianceReport(BaseModel):
    passed: bool
    issues: list[ComplianceIssue] = Field(default_factory=list)
    fact_gaps: list[str] = Field(default_factory=list)


class GeneratedContent(BaseModel):
    channel: str
    title: Optional[str] = None
    body: str
    hashtags: list[str] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    distillery: str
    diagnosis: MarketingDiagnosis
    contents: list[GeneratedContent]
    compliance: ComplianceReport
    pipeline_trace: list[str] = Field(default_factory=list)


class CommentReply(BaseModel):
    comment: str
    reply: str
    intent: str


class CommentResponse(BaseModel):
    items: list[CommentReply]
