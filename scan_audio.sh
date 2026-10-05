#!/usr/bin/env bash
# Usage: ./scan_audio.sh remotion/public/<surah>/voice.mp3 [window=1.25] [step=0.75]
# Prints (1) a sliding-window transcript and (2) RMS dips (< -28 dB, 0.1s bins).
# Windows that print "(speaking in foreign language)" or garbled English = Arabic recitation.
set -euo pipefail
IN="$1"; WIN="${2:-1.25}"; STEP="${3:-0.75}"
MODEL="$(dirname "$0")/whisper_models/ggml-small.en.bin"
WAV=/tmp/scan16.wav
ffmpeg -hide_banner -loglevel error -y -i "$IN" -ar 16000 -ac 1 "$WAV"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$WAV")
echo "duration: $DUR"
echo "--- windows ---"
a=0
while (( $(echo "$a < $DUR" | bc) )); do
  b=$(echo "$a + $WIN" | bc)
  ffmpeg -hide_banner -loglevel error -y -ss "0$a" -to "0$b" -i "$WAV" /tmp/scanwin.wav
  printf "%6.2f-%6.2f: " "$a" "$b"
  whisper-cli -m "$MODEL" -f /tmp/scanwin.wav -nt -np 2>/dev/null | tr -d '\n'; echo
  a=$(echo "$a + $STEP" | bc)
done
echo "--- RMS dips (sec:dB) ---"
ffmpeg -hide_banner -loglevel error -i "$WAV" -af "asetnsamples=n=1600,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=/tmp/scanrms.txt" -f null -
python3 -c "
import re
v=[float(x) if x!='-inf' else -99 for x in re.findall(r'RMS_level=(\S+)',open('/tmp/scanrms.txt').read())]
print(' '.join(f'{i/10:.1f}:{int(x)}' for i,x in enumerate(v) if x<-28))
"
