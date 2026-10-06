#!/usr/bin/env bash
# Usage: render.sh <Name> <slug>
# Typechecks, lists compositions, renders the vertical mp4, then verifies duration + audio stream.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

if [ $# -ne 2 ]; then
  echo "usage: $0 <Name> <slug>" >&2
  exit 1
fi
NAME="$1"; SLUG="$2"
OUT="$SLUG/BarakahBlooms_Surah_${NAME}_Vertical.mp4"

cd remotion
npx tsc --noEmit
npx remotion compositions src/index.ts | grep "${NAME}Vertical"
npx remotion render src/index.ts "${NAME}Vertical" "../$OUT"
cd "$ROOT"

echo
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"
if ! ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$OUT" | grep -q audio; then
  echo "error: $OUT has no audio stream" >&2
  exit 1
fi
echo "ok: $OUT has an audio stream"
