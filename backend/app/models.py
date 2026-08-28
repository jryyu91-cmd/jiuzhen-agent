"""酒阵 Agent · 数据模型定义"""
from pydantic import BaseModel, Field
from typing import Optional


class DistilleryInfo(BaseModel):
    """酒厂输入信息"""
    name: str = Field(..., description="酒厂名称", examples=["茅台镇某某烧坊"])
    location: str = Field(default="贵州遵义", description="产区位置")
    product_name: str = Field(..., description="主推产品名", examples=["某某·窖藏10"])
    price_range: str = Field(default="300-500元", description="价格带")
    target_audience: str = Field(
        default="30-45岁男性、商务送礼与自饮兼顾",
        description="目标人群"
    )
    selling_points: list[str] = Field(
        default_factory=list,
        description="卖点关键词，如 大曲坤沙、老酒勾调、赤水河谷"
    )
    brand_tone: str = Field(
        default="朴实、产区自豪感、有匠心但不装",
        description="品牌语气"
    )
    extra_material: Optional[str] = Field(
        default=None,
        description="产区文化素材/酒厂故事（自由文本）"
    )


class GeneratedContent(BaseModel):
    """单条生成内容"""
    channel: str          # wechat / moments / video
    title: Optional[str] = None
    body: str
    hashtags: list[str] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    """三件套 + 元信息"""
    distillery: str
    contents: list[GeneratedContent]
    pipeline_trace: list[str] = Field(
        default_factory=list, description="流水线步骤轨迹，便于现场演示讲解"
    )


class CommentReply(BaseModel):
    comment: str
    reply: str
    intent: str  # 咨询价格 / 质疑真假 / 要链接 / 闲聊


class CommentResponse(BaseModel):
    items: list[CommentReply]
