#!/bin/zsh
# 酒阵 Agent · 用户级 LaunchAgent（登录即启动、崩溃自动拉起）
# 安装：zsh /Volumes/资料盘/Projects/jiuzhen-agent/install-launchd.sh
set -e
ROOT="/Volumes/资料盘/Projects/jiuzhen-agent"
PLIST_DIR="$HOME/Library/LaunchAgents"
NODE_BIN="$(dirname $(readlink -f $ROOT/frontend/node_modules/.bin/vite 2>/dev/null || echo x))/../node"
NODE_BIN=$(command -v node)
VITE_JS="$ROOT/frontend/node_modules/vite/bin/vite.js"
UVICORN="$ROOT/backend/.venv/bin/uvicorn"

mkdir -p "$PLIST_DIR"

cat > "$PLIST_DIR/cn.xiaojun.jiuzhen.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>cn.xiaojun.jiuzhen</string>
  <key>ProgramArguments</key>
  <array>
    <string>$UVICORN</string>
    <string>app.main:app</string>
    <string>--host</string>
    <string>127.0.0.1</string>
    <string>--port</string>
    <string>8000</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT/backend</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/jiuzhen-api.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/jiuzhen-api.err.log</string>
</dict>
</plist>
EOF

cat > "$PLIST_DIR/cn.xiaojun.jiuzhen-front.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>cn.xiaojun.jiuzhen-front</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$VITE_JS</string>
    <string>preview</string>
    <string>--host</string>
    <string>127.0.0.1</string>
    <string>--port</string>
    <string>5173</string>
    <string>--strictPort</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT/frontend</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/jiuzhen-front.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/jiuzhen-front.err.log</string>
</dict>
</plist>
EOF

if [ ! -d "$ROOT/frontend/dist" ]; then
  cd "$ROOT/frontend" && npm run build
fi

launchctl bootout gui/$(id -u)/cn.xiaojun.jiuzhen 2>/dev/null || true
launchctl bootout gui/$(id -u)/cn.xiaojun.jiuzhen-front 2>/dev/null || true
launchctl bootstrap gui/$(id -u) "$PLIST_DIR/cn.xiaojun.jiuzhen.plist"
launchctl bootstrap gui/$(id -u) "$PLIST_DIR/cn.xiaojun.jiuzhen-front.plist"
sleep 4
echo "backend: $(curl -s http://127.0.0.1:8000/api/health)"
echo "front: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5173/)"
