#!/bin/zsh
# 酒阵 Agent · 评委一键启动（首次运行自动安装依赖）
# 用法：zsh setup.sh   然后浏览器打开 http://localhost:5173
set -e
cd "$(dirname "$0")"

echo "==> 1/4 检查 Python..."
PY=${PYTHON:-python3}
command -v $PY >/dev/null || { echo "需要先安装 Python 3.10+（https://www.python.org/downloads/）"; exit 1; }

echo "==> 2/4 准备后端..."
cd backend
[ -d .venv ] || $PY -m venv .venv
./.venv/bin/pip install -q -r requirements.txt

echo "==> 3/4 准备前端..."
cd ../frontend
command -v node >/dev/null || { echo "需要先安装 Node.js 18+（https://nodejs.org/）"; exit 1; }
[ -d node_modules ] || npm install --silent
[ -d dist ] || npm run build --silent

echo "==> 4/4 启动服务..."
cd ..
# 清理占用端口的旧进程
for port in 8000 5173; do
  pids=$(lsof -nP -iTCP:$port -sTCP:LISTEN -t 2>/dev/null || true)
  [ -n "$pids" ] && kill $pids 2>/dev/null || true
done
sleep 1
cd backend && nohup ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 > /tmp/jiuzhen-api.log 2>&1 < /dev/null &
cd frontend && nohup node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5173 --strictPort > /tmp/jiuzhen-front.log 2>&1 < /dev/null &
sleep 4

echo ""
echo "✅ 启动完成！浏览器打开 http://localhost:5173 即可试用"
echo "   停止服务：kill \$(lsof -ti :5173 :8000)"
