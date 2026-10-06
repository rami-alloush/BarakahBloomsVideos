#!/usr/bin/env bash
# Usage: new_video.sh <Name> <slug>   e.g. new_video.sh Asr asr
# Copies the surah-video template to remotion/src/<slug>/<Name>Vertical.tsx
# and registers the composition in remotion/src/Root.tsx.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

if [ $# -ne 2 ]; then
  echo "usage: $0 <Name> <slug>   (Name PascalCase, slug lowercase)" >&2
  exit 1
fi
NAME="$1"; SLUG="$2"
UP="$(echo "$SLUG" | tr '[:lower:]' '[:upper:]')"
TEMPLATE=".devin/skills/surah-video/template/TemplateVertical.tsx"
SRC="remotion/src/$SLUG"
OUT="$SRC/${NAME}Vertical.tsx"
ROOT_TSX="remotion/src/Root.tsx"

if [ -f "$OUT" ]; then
  echo "error: $OUT already exists" >&2
  exit 1
fi

mkdir -p "$SRC" "$SLUG/stills"

python3 - "$TEMPLATE" "$OUT" "$NAME" "$SLUG" "$UP" <<'PY'
import sys
tpl, out, name, slug, up = sys.argv[1:6]
src = open(tpl).read()
src = src.replace('TemplateVertical', f'{name}Vertical')
src = src.replace('TOTAL_V_TEMPLATE', f'TOTAL_V_{up}')
src = src.replace("'template/voice.mp3'", f"'{slug}/voice.mp3'")
src = src.replace('mvT', f'mv{name}')
open(out, 'w').write(src)
PY

python3 - "$ROOT_TSX" "$NAME" "$SLUG" "$UP" <<'PY'
import sys
path, name, slug, up = sys.argv[1:6]
lines = open(path).read().splitlines(keepends=True)
imp = f"import {{{name}Vertical, TOTAL_V_{up}}} from './{slug}/{name}Vertical';"
if not any(imp in l for l in lines):
    last_import = max(i for i, l in enumerate(lines) if l.startswith('import '))
    lines.insert(last_import + 1, imp + '\n')
comp = f'    <Composition id="{name}Vertical" component={{{name}Vertical}} durationInFrames={{TOTAL_V_{up}}} fps={{30}} width={{1080}} height={{1920}} />'
if not any(f'id="{name}Vertical"' in l for l in lines):
    close = next(i for i, l in enumerate(lines) if l.strip() == '</>')
    lines.insert(close, comp + '\n')
open(path, 'w').writelines(lines)
PY

echo "created $OUT"
echo "registered ${NAME}Vertical in $ROOT_TSX"
echo
echo "next steps:"
echo "  1. (prepare.sh should already have been run — see SKILL.md step 1)"
echo "  2. Edit $OUT: set AUDIO_DUR/TITLE_*/SUBTITLE, build one scene per verse from $SLUG/timing.txt, update \`scenes\`."
echo "  3. ./.devin/skills/surah-video/scripts/stills.sh $NAME $SLUG <sec>..."
echo "  4. ./.devin/skills/surah-video/scripts/render.sh $NAME $SLUG"
