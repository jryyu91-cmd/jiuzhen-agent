#!/bin/zsh
# 酒阵 Agent · 本地一键启动脚本（后台常驻，日志在 /tmp）
set -e
ROOT="/Volumes/资料盘/Projects/jiuzhen-agent"

# 先清理旧进程（按端口找）
for port in 8000 5173; do
  pids=$(lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null || true)
  [ -n "$pids" ] && kill $pids 2>/dev/null || true
done
sleep 1

cd "$ROOT/backend"
nohup ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/jiuzhen-api.log 2>&1 < /dev/null &

cd "$ROOT/frontend"
# 生产模式：先构建（若无 dist），再用 vite preview 托管，比 dev server 稳
if [ ! -d "$ROOT/frontend/dist" ]; then
  npm run build > /tmp/jiuzhen-build.log 2>&1
fi
nohup node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5173 --strictPort > /tmp/jiuzhen-front.log 2>&1 < /dev/null &

sleep 4
echo "backend: $(curl -s http://127.0.0.1:8000/api/health)"
echo "frontend: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/)"
