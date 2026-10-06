#!/usr/bin/env bash
# Usage: stills.sh <Name> <slug> <sec> [<sec> ...]
# Deletes <slug>/stills/*.png, then renders one still per second mark as t<sec>.png.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

if [ $# -lt 3 ]; then
  echo "usage: $0 <Name> <slug> <sec> [<sec> ...]" >&2
  exit 1
fi
NAME="$1"; SLUG="$2"; shift 2
DIR="$SLUG/stills"
mkdir -p "$DIR"
rm -f "$DIR"/*.png

cd remotion
for sec in "$@"; do
  frame=$(python3 -c "print(round($sec * 30))")
  npx remotion still src/index.ts "${NAME}Vertical" "../$DIR/t${sec}.png" --frame="$frame"
done

echo
echo "stills:"
ls -1 "../$DIR"/*.png
