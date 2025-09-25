#!/usr/bin/env bash
set -euo pipefail

# Resolve project root (one level up from this script)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "📦 Packaging DocFinder as a standalone binary"
echo "📂 Project root: $PROJECT_ROOT"

echo "➡️  Step 1/4: Installing Node dependencies"
npm ci

echo "➡️  Step 2/4: Building React app with Vite"
npm run build

echo "➡️  Step 3/4: Ensuring PyInstaller is available"
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found. Please install Python 3.10+ and re-run."
  exit 1
fi

if ! python3 -c "import PyInstaller" >/dev/null 2>&1; then
  echo "➡️  Installing PyInstaller"
  python3 -m pip install --upgrade pip >/dev/null
  python3 -m pip install pyinstaller
fi

echo "➡️  Step 4/4: Creating standalone executable with PyInstaller"
# On macOS/Linux, use ':' as separator in --add-data entries
pyinstaller \
  --name DocFinder \
  --onefile \
  --add-data "dist:dist" \
  --add-data "public:public" \
  --add-data "processes-database.json:processes-database.json" \
  server.py

echo "✅ Build complete"
echo "📁 Output binary: $PROJECT_ROOT/dist/DocFinder"
echo "💡 Tip: export DOCUMENTS_DIRECTORY=\"/path/to/library\" before running to point to an external data folder."


