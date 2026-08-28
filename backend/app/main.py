"""酿见 AI · FastAPI 入口"""
import os
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pypdf import PdfReader

from .models import (
    BrandProfile,
    CommentResponse,
    DistilleryInfo,
    GenerateResponse,
    MaterialExtractResponse,
    SourceMaterial,
)
from .pipeline import run_pipeline
from .marketing import diagnose_marketing
from .compliance import review_content
from .comments import gen_comment_replies
from .material_intelligence import analyze_materials, merge_material_draft
from .profiles import get_profile, list_profiles, profile_to_info

app = FastAPI(title="酿见 AI", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "niangjian-ai", "version": "0.4.0"}


@app.get("/api/profiles", response_model=list[BrandProfile])
def profiles() -> list[BrandProfile]:
    return list_profiles()


def _decode_text(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="ignore")


def _extract_file_text(filename: str, content_type: str, data: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf" or content_type == "application/pdf":
        reader = PdfReader(BytesIO(data))
        pages = [(page.extract_text() or "").strip() for page in reader.pages]
        return "\n\n".join(page for page in pages if page)
    if suffix in {".txt", ".md", ".csv", ".json"} or content_type.startswith("text/"):
        return _decode_text(data)
    return ""


@app.post("/api/materials/extract", response_model=MaterialExtractResponse)
async def extract_materials(
    files: list[UploadFile] | None = File(default=None),
    notes: str = Form(default=""),
) -> MaterialExtractResponse:
    """把企业已有 PDF / TXT / MD / CSV / JSON 先变成可确认档案，而不是要求用户先填营销表。"""
    materials: list[SourceMaterial] = []
    warnings: list[str] = []
    uploads = (files or [])[:8]

    for upload in uploads:
        filename = upload.filename or "未命名资料"
        data = await upload.read()
        if len(data) > 6 * 1024 * 1024:
            warnings.append(f"{filename} 超过 6MB，当前 Demo 未读取")
            continue
        try:
            text = _extract_file_text(filename, upload.content_type or "application/octet-stream", data)
        except Exception:
            warnings.append(f"{filename} 解析失败，请尝试 PDF 文本版或复制文字")
            continue
        if not text.strip():
            warnings.append(f"{filename} 当前没有提取到可读文字；扫描件/图片后续将接 OCR/视觉模型")
            continue
        materials.append(SourceMaterial(
            name=filename,
            media_type=upload.content_type or "text/plain",
            text=text[:30000],
            source_kind="upload",
        ))

    if notes.strip():
        materials.append(SourceMaterial(
            name="现场补充.txt",
            media_type="text/plain",
            text=notes.strip()[:10000],
            source_kind="paste",
        ))

    analysis, draft = analyze_materials(materials)
    analysis.notes.extend(warnings)
    return MaterialExtractResponse(materials=materials, analysis=analysis, draft=draft)


def _generate(info: DistilleryInfo) -> GenerateResponse:
    material_analysis = None
    if info.source_materials:
        material_analysis, draft = analyze_materials(info.source_materials)
        info = merge_material_draft(info, material_analysis, draft)

    if not info.product_name.strip():
        raise HTTPException(status_code=422, detail="还没有识别到产品名称，请确认一次产品名后再继续。")
    if not info.name.strip():
        info = info.model_copy(update={"name": "未命名酒企"})

    diagnosis = diagnose_marketing(info)
    if not info.consume_scene and diagnosis.scene_opportunities:
        info = info.model_copy(update={"consume_scene": diagnosis.scene_opportunities[0].scene})
    contents, trace = run_pipeline(info)
    if material_analysis:
        trace.insert(
            0,
            f"⓪ 读取企业原始资料 {len(material_analysis.source_names)} 份，提取可追溯事实 {len(material_analysis.extracted_facts)} 条（{material_analysis.mode}）",
        )
    compliance = review_content(info, contents)
    return GenerateResponse(
        distillery=info.name,
        diagnosis=diagnosis,
        contents=contents,
        compliance=compliance,
        material_analysis=material_analysis,
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
        f"演示档案「{profile.profile_id}」：语气={profile.brand_tone}｜人工确认事实={len(profile.fact_evidence)}条｜场景素材={len(profile.scene_materials)}条",
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
