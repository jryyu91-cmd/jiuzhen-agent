"""酿见 AI · FastAPI 入口"""
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .models import DistilleryInfo, GenerateResponse, CommentResponse, BrandProfile
from .pipeline import run_pipeline
from .marketing import diagnose_marketing
from .compliance import review_content
from .comments import gen_comment_replies
from .profiles import get_profile, list_profiles, profile_to_info

app = FastAPI(title="酿见 AI", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "niangjian-ai", "version": "0.3.0"}


@app.get("/api/profiles", response_model=list[BrandProfile])
def profiles() -> list[BrandProfile]:
    return list_profiles()


def _generate(info: DistilleryInfo) -> GenerateResponse:
    diagnosis = diagnose_marketing(info)
    if not info.consume_scene and diagnosis.scene_opportunities:
        info = info.model_copy(update={"consume_scene": diagnosis.scene_opportunities[0].scene})
    contents, trace = run_pipeline(info)
    compliance = review_content(info, contents)
    return GenerateResponse(
        distillery=info.name,
        diagnosis=diagnosis,
        contents=contents,
        compliance=compliance,
        pipeline_trace=trace,
    )


@app.post("/api/generate", response_model=GenerateResponse)
def generate(info: DistilleryInfo) -> GenerateResponse:
    return _generate(info)


@app.post("/api/generate/by-profile/{profile_id}", response_model=GenerateResponse)
def generate_by_profile(profile_id: str) -> GenerateResponse:
    profile = get_profile(profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail=f"档案不存在: {profile_id}")
    info = profile_to_info(profile)
    result = _generate(info)
    result.pipeline_trace.insert(
        0,
        f"⓪ 装配品牌档案「{profile.profile_id}」：语气={profile.brand_tone}｜事实证据={len(profile.fact_evidence)}条｜场景素材={len(profile.scene_materials)}条",
    )
    return result


@app.post("/api/comments/reply", response_model=CommentResponse)
def comment_reply(payload: dict) -> CommentResponse:
    return gen_comment_replies(
        product=payload.get("product", "本款产品"),
        name=payload.get("name", "酒厂"),
        location=payload.get("location", ""),
        price=payload.get("price", ""),
        comments=payload.get("comments"),
    )


# 在线演示采用单容器部署时，把构建后的 React 页面交给 FastAPI 同域提供。
# 本地开发没有 STATIC_DIR，不影响原有 Vite + FastAPI 双服务模式。
STATIC_DIR = os.getenv("STATIC_DIR", "").strip()
if STATIC_DIR and Path(STATIC_DIR).is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
