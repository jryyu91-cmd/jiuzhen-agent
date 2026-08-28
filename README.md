# 酒阵 Agent · 酱酒厂市场部一个人的内容工厂

> 2026 多彩贵州·贵客松 黑客松 | 赛道二 · 传统行业 AI 解决方案 | AI × 白酒

一句话：**把遵义一家县级酱酒厂市场部那一个人的内容产能，放大成一个团队。**

## 它解决谁的什么问题

县级酱酒厂市场部往往只有 1 个人（甚至兼任）。他每周要出公众号、朋友圈、短视频内容，
但不会写、没预算请代运营。**酒阵 Agent** 输入酒厂产品信息 + 产区文化素材，
一条主链路自动产出三种形态内容，并附带评论区互动建议。

## 快速开始

### 后端

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

浏览器打开 http://localhost:5173

## 架构

```
酒厂产品信息 + 产区素材
        │
        ▼
  FastAPI /api/generate
        │
   ┌────┼─────────┐
   ▼    ▼         ▼
公众号  朋友圈   短视频脚本
 文案   短文案
   │
   ▼
 评论区互动建议（/api/comments/reply）
```

## License

MIT
