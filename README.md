# 酒阵 Agent · 酱酒厂市场部一个人的内容工厂

> 2026 多彩贵州·贵客松 黑客松 | 赛道二 · 传统行业 AI 解决方案 | AI × 白酒

一句话：**把遵义一家县级酱酒厂市场部那一个人的内容产能，放大成一个团队。**

## 它解决谁的什么问题

县级酱酒厂市场部往往只有 1 个人（甚至兼任）。他每周要出公众号、朋友圈、短视频内容，
但不会写、没预算请代运营（市场价 3000-8000 元/月起）。

**酒阵 Agent** = 一厂一档建档 + 一键生成内容三件套 + 评论区互动兜底：
- **一厂一档**：每家酒厂一份品牌档案（语气红线、选题倾向、场景素材库），生成时按档案装配——同一价位两家酒厂，产出风格完全不同
- **三件套**：公众号文案 / 朋友圈短文案 / 短视频脚本，生活场景做主角、工艺做信任背书（白酒消费从应酬驱动转向情绪价值驱动的行业打法）
- **评论区兜底**：价格咨询 / 真假质疑 / 要链接 / 送礼场景四类高频评论自动回复建议

详细痛点论证见 [docs/作品说明.md](docs/作品说明.md)。

## 评委试用（三选一，按顺序推荐）

### 方式 A · 一键脚本（推荐，Mac/Linux）

前提：装了 Python 3.10+ 和 Node.js 18+（没有的话看下方「环境安装」）。

```bash
git clone https://github.com/jryyu91-cmd/jiuzhen-agent.git
cd jiuzhen-agent
zsh setup.sh        # 首次运行自动装依赖并启动
```

浏览器打开 **http://localhost:5173** 即可。

### 方式 B · Docker（装了 Docker 的话最省事）

```bash
git clone https://github.com/jryyu91-cmd/jiuzhen-agent.git
cd jiuzhen-agent
docker compose up --build
```

浏览器打开 **http://localhost:5173**。

### 方式 C · 现场演示

我们展位有热备环境；或现场扫二维码访问演示机（同一局域网）。

### 环境安装（都没有的话）

- Python 3.10+：https://www.python.org/downloads/ （Mac 也可 `brew install python`）
- Node.js 18+：https://nodejs.org/ （Mac 也可 `brew install node`）
- Docker Desktop：https://www.docker.com/products/docker-desktop/

## 演示流程建议（3 分钟）

1. 打开页面，顶部「一厂一档」栏点「青溪酒厂」→ 生成 → 看朋友圈的轻松朋友体
2. 再点「茅台镇老烧坊」→ 生成 → 对比公众号的匠人叙事——同一条流水线，档案不同风格完全不同
3. 左侧表单随便改几个字段再点「生成内容三件套」→ 验证不是写死的
4. 展开「流水线轨迹」看装配过程，底部看「评论区互动建议」

## API（评委自测）

```bash
# 健康检查
curl http://localhost:8000/api/health
# 品牌档案列表
curl http://localhost:8000/api/profiles
# 按档案生成
curl -X POST http://localhost:8000/api/generate/by-profile/qingxi
# 自定义生成
curl -X POST http://localhost:8000/api/generate -H "Content-Type: application/json" \
  -d '{"name":"我的酒厂","product_name":"测试·头曲","price_range":"198元","selling_points":["纯粮","固态发酵"]}'
```

## 架构

```
酒厂品牌档案（一厂一档）
        │ 装配：语气红线 + 选题倾向 + 场景素材库
        ▼
  FastAPI /api/generate
        │
   ┌────┼─────────┐
   ▼    ▼         ▼
公众号  朋友圈   短视频脚本     ← 生活场景做主角，工艺做背书
   │
   ▼
 评论区互动建议（/api/comments/reply）
```

- 后端：Python FastAPI，模板+规则引擎（48h 版离线可跑，`USE_LLM=1` 预留 LLM 模式）
- 前端：React 18 + Vite + TypeScript
- 写作纪律：粥左罗人×AI 共创方法论（场景开头 / 段间钩子 / 收尾禁总结）

## License

MIT
