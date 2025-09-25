#!/usr/bin/env bash
set -euo pipefail

APP_NAME="DocFinder"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
APP_DIR="$DIST_DIR/${APP_NAME}.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RES_DIR="$CONTENTS_DIR/Resources"
ICONSET_DIR="${RES_DIR}/AppIcon.iconset"
PNG_ICON_SRC="$ROOT_DIR/src/assets/logo.png"

echo "📦 Packaging $APP_NAME to $APP_DIR"

rm -rf "$APP_DIR"
mkdir -p "$MACOS_DIR" "$RES_DIR"

# Create Info.plist
cat >"$CONTENTS_DIR/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>DocFinder</string>
    <key>CFBundleDisplayName</key>
    <string>DocFinder</string>
    <key>CFBundleIdentifier</key>
    <string>com.local.docfinder</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleExecutable</key>
    <string>DocFinder</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSBackgroundOnly</key>
    <false/>
</dict>
</plist>
PLIST

# Build .icns icon if possible
ICNS_PATH="$RES_DIR/AppIcon.icns"
if [[ -f "$PNG_ICON_SRC" ]]; then
  echo "🎨 Building .icns from $PNG_ICON_SRC"
  rm -rf "$ICONSET_DIR"
  mkdir -p "$ICONSET_DIR"
  for s in 16 32 64 128 256 512; do
    s2=$((s*2))
    sips -z "$s" "$s" "$PNG_ICON_SRC" --out "$ICONSET_DIR/icon_${s}x${s}.png" >/dev/null 2>&1 || true
    sips -z "$s2" "$s2" "$PNG_ICON_SRC" --out "$ICONSET_DIR/icon_${s}x${s}@2x.png" >/dev/null 2>&1 || true
  done
  if command -v iconutil >/dev/null 2>&1; then
    iconutil -c icns "$ICONSET_DIR" -o "$ICNS_PATH" >/dev/null 2>&1 || true
  fi
fi

# Launcher (keeps process alive)
cat >"$MACOS_DIR/${APP_NAME}" <<'LAUNCH'
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Project root is four levels up from Contents/MacOS
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$PROJECT_ROOT"
export VITE_DATABASE_URL=processes-database.json
exec /usr/bin/env python3 server.py
LAUNCH
chmod +x "$MACOS_DIR/${APP_NAME}"

echo "✅ ${APP_NAME}.app created at: $APP_DIR"

