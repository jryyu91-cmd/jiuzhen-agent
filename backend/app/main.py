"""酒阵 Agent · FastAPI 入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import DistilleryInfo, GenerateResponse, CommentResponse, BrandProfile
from .pipeline import run_pipeline
from .comments import gen_comment_replies
from .profiles import get_profile, list_profiles, profile_to_info

app = FastAPI(title="酒阵 Agent", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "jiuzhen-agent"}


@app.get("/api/profiles", response_model=list[BrandProfile])
def profiles() -> list[BrandProfile]:
    """一厂一档：返回完整品牌档案（案例馆卡片展示 + 表单回填用）"""
    return list_profiles()


@app.post("/api/generate", response_model=GenerateResponse)
def generate(info: DistilleryInfo) -> GenerateResponse:
    contents, trace = run_pipeline(info)
    return GenerateResponse(
        distillery=info.name,
        contents=contents,
        pipeline_trace=trace,
    )


@app.post("/api/generate/by-profile/{profile_id}", response_model=GenerateResponse)
def generate_by_profile(profile_id: str) -> GenerateResponse:
    """按品牌档案生成：一厂一档的个性化定制入口"""
    profile = get_profile(profile_id)
    if profile is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"档案不存在: {profile_id}")
    info = profile_to_info(profile)
    contents, trace = run_pipeline(info)
    trace.insert(0, f"⓪ 装配品牌档案「{profile.profile_id}」：语气={profile.brand_tone}｜红线={('、'.join(profile.tone_taboos) or '无')}｜素材库={len(profile.scene_materials)}条")
    return GenerateResponse(
        distillery=info.name,
        contents=contents,
        pipeline_trace=trace,
    )


@app.post("/api/comments/reply", response_model=CommentResponse)
def comment_reply(payload: dict) -> CommentResponse:
    """payload: {product, name, location, price, comments?: list[str]}"""
    return gen_comment_replies(
        product=payload.get("product", "本款产品"),
        name=payload.get("name", "酒厂"),
        location=payload.get("location", "贵州遵义"),
        price=payload.get("price", "300-500元"),
        comments=payload.get("comments"),
    )
