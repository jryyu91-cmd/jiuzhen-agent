"""酒阵 Agent · FastAPI 入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .models import DistilleryInfo, GenerateResponse, CommentResponse
from .pipeline import run_pipeline
from .comments import gen_comment_replies

app = FastAPI(title="酒阵 Agent", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "jiuzhen-agent"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(info: DistilleryInfo) -> GenerateResponse:
    contents, trace = run_pipeline(info)
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
