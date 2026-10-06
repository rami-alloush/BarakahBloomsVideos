#!/usr/bin/env bash
# Usage: prepare.sh <youtube_url | local.mp3> <slug> <surah_number>
# Downloads/copies audio, writes title.txt, duration.txt, verses.txt,
# whisper_segments.txt and scan.txt into <slug>/, and voice.mp3 into remotion/public/<slug>/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

if [ $# -ne 3 ]; then
  echo "usage: $0 <youtube_url | local.mp3> <slug> <surah_number>" >&2
  exit 1
fi
SRC="$1"; SLUG="$2"; N="$3"
DIR="$SLUG"
PUB="remotion/public/$SLUG"
mkdir -p "$DIR" "$DIR/stills" "$PUB"

if [ -f "$SRC" ]; then
  AUDIO="$SRC"
  basename "$SRC" > "$DIR/title.txt"
else
  curl -s "https://www.youtube.com/oembed?url=$SRC&format=json" \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["title"])' > "$DIR/title.txt"
  yt-dlp -x --audio-format mp3 \
    -o "$DIR/Meaning of Surah $SLUG adnaanmenk - Adnaan Menk Clips.%(ext)s" "$SRC"
  AUDIO="$(ls "$DIR"/*.mp3 | head -1)"
fi

cp "$AUDIO" "$PUB/voice.mp3"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$PUB/voice.mp3" | tee "$DIR/duration.txt"

curl -s "https://api.alquran.cloud/v1/surah/$N/quran-simple" -o "/tmp/${SLUG}_surah.json"
python3 - "$N" "$DIR/verses.txt" "/tmp/${SLUG}_surah.json" <<'PY'
import json, re, sys
n, out, jf = int(sys.argv[1]), sys.argv[2], sys.argv[3]
data = json.load(open(jf))['data']

# alquran.cloud puts shadda before the vowel mark; house style puts it last
def norm(text):
    return re.sub(r'([ً-ٰٟ]+)', lambda m: ''.join(sorted(m.group(1), key=lambda c: c == 'ّ')), text)
lines = [f"# {data['englishName']} — {data['englishNameTranslation']} — {data['name']} — surah {n}, {data['numberOfAyahs']} ayahs"]
for a in data['ayahs']:
    text = norm(a['text'])
    # Strip the leading basmala from ayah 1 (diacritic order varies, so match by words)
    if n != 1 and a['numberInSurah'] == 1:
        words = text.split(' ')
        if len(words) > 4 and words[0] == 'بِسْمِ' and words[3].startswith('الر'):
            text = ' '.join(words[4:])
        else:
            print(f'warning: ayah 1 basmala not stripped: {text[:40]!r}', file=sys.stderr)
    lines.append(f"{a['numberInSurah']}\t{text}")
open(out, 'w').write('\n'.join(lines) + '\n')
PY

ffmpeg -hide_banner -loglevel error -y -i "$PUB/voice.mp3" -ar 16000 -ac 1 "/tmp/${SLUG}16.wav"
{
  echo "# whisper small.en, segment-level — TIMINGS ARE UNRELIABLE (off by up to 2-3s); use for WORDING ONLY."
  echo "# Authoritative timings come from scan.txt (see AGENTS.md)."
  whisper-cli -m whisper_models/ggml-small.en.bin -f "/tmp/${SLUG}16.wav" -np
} > "$DIR/whisper_segments.txt"

./scan_audio.sh "$PUB/voice.mp3" | tee "$DIR/scan.txt"

echo
echo "outputs:"
echo "  $DIR/title.txt            $(cat "$DIR/title.txt")"
echo "  $DIR/duration.txt         $(cat "$DIR/duration.txt")"
echo "  $DIR/verses.txt"
echo "  $DIR/whisper_segments.txt"
echo "  $DIR/scan.txt"
echo "  $PUB/voice.mp3"
echo
echo "verses:"
cat "$DIR/verses.txt"
