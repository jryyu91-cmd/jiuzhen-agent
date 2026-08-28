#!/bin/zsh
# 酒阵 Agent · 手动启动（不装系统服务时用）
ROOT="$HOME/Projects/jiuzhen-agent"
for port in 8000 5173; do
  pids=$(lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null || true)
  [ -n "$pids" ] && kill $pids 2>/dev/null || true
done
sleep 1
cd "$ROOT/backend" && nohup ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/jiuzhen-api.log 2>&1 < /dev/null &
cd "$ROOT/frontend" && [ -d dist ] || npm run build
nohup node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5173 --strictPort > /tmp/jiuzhen-front.log 2>&1 < /dev/null &
sleep 4
echo "backend: $(curl -s http://127.0.0.1:8000/api/health)"
echo "front: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/)"
