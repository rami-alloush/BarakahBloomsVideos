# BarakahBlooms surah explainer videos

Kids' animated explainers (Remotion, 1080x1920 vertical, 30fps) built over Adnaan Menk "Meaning of Surah X" YouTube Shorts audio.
Done so far: Ikhlas (16:9, vertical, ES, FR), Naas (vertical), Falaq (vertical), Ikhlas10 (vertical — Omar Suleiman reminder, not an Adnaan Menk short).

**New video from a link: use the `surah-video` skill** (`.devin/skills/surah-video/SKILL.md`). It has scripts for prepare/new/stills/render, a template with every helper, and a scene-recipe catalog.

## Layout
- Each Surah has a root folder (`ikhlas/`, `naas/`, `falaq/`) holding its timing map, transcript, source mp3, stills and renders.
- `remotion/`: the Remotion project (`npm install` already done). Compositions are registered in `src/Root.tsx`.
- `remotion/src/<surah>/<Surah>Vertical.tsx`: one self-contained file per video. Helpers are **copied** between files on purpose (house style). Start a new video by copying the latest one (`src/falaq/FalaqVertical.tsx` has the most helpers).
- `remotion/public/<surah>/voice.mp3`: the audio. `logo.png` is used by the Outro.
- `<surah>/timing.txt`: **the authoritative segment map** (Arabic and English spans). `<surah>/transcript.txt` is raw whisper output and its word timings are NOT reliable.
- `<surah>/stills/`: verification frames. Output files are named `BarakahBlooms_Surah_<Name>_Vertical.mp4` and live in `<surah>/`.
- `whisper_models/ggml-small.en.bin`: the whisper model. `scan_audio.sh`: the segment scanner (see below).
- Tools installed via Homebrew: `yt-dlp`, `ffmpeg`, `whisper-cpp` (`whisper-cli`).

## Pipeline for a new short (fast path)
1. Title: `webfetch https://www.youtube.com/oembed?url=<url>&format=json`.
2. Audio: `yt-dlp -x --audio-format mp3 -o "<surah>/Meaning of Surah X adnaanmenk - Adnaan Menk Clips.%(ext)s" <url>`. Copy it to `remotion/public/<surah>/voice.mp3`. Get the duration with `ffprobe`.
3. **Timing map: run `./scan_audio.sh remotion/public/x/voice.mp3`.** Then refine the boundaries with `./scan_audio.sh <mp3> 0.9 0.3` around the transitions (or crop with ffmpeg first). Write `x/timing.txt`.
   - **The speaker recites each verse in ARABIC first, then explains it in English.** Full-clip whisper (`small.en`, `-ml 1`) silently drops the Arabic and stretches English words over the gaps. Its word timestamps were off by up to 2–3s, and it falsely reported "no Arabic".
   - In the window scan, Arabic shows up as "(speaking in foreign language)" or English-sounding gibberish ("walk up" = "waqab", "One in Sherwin" = "wa min sharri", "Malikin Nast" = "maliki-n-naas").
   - Boundaries = where the window text changes, snapped to nearby RMS dips (< -30 dB). Accuracy is about ±0.3s. Silencedetect is useless here because the audio is continuous.
   - `-dtw` token timestamps need `-nfa`, and they were still unreliable.
   - Common mis-hearings: "knocks" = knots, "gym" = jinn, "Al-Nassa"/"Fanaq" = An-Naas/Falaq.
4. Scene plan: one scene per verse. Scene start = the start of the Arabic recitation. In each scene:
   - The verse's Arabic line pops at the scene start.
   - The English Caption and Big text pop when the English starts: `const en = s(EN_START - SCENE_START)`.
   - Actions keyed to words (sunrise on "Dawn", poof on "disappears", knots untie on "blow on knots") use absolute word times from the map.
   - Total = audio duration + ~3.7s Outro.
5. Copy the Arabic verses verbatim (fully voweled Uthmani text). Double-check them yourself; never let them be regenerated loosely.
6. Register the composition in `Root.tsx`, then verify (below) and render: `npx remotion render src/index.ts XVertical ../x/BarakahBlooms_Surah_X_Vertical.mp4`. Rendering takes about 1–2 min.

## Code rules (bugs we hit)
- **Never call hooks (`usePop`, etc.) inside ternaries or conditionals.** It crashes the render mid-way (React #300) even though stills look fine. Hoist every hook to the top of the scene.
- When a caption changes within a scene, render one `<Caption>` per text, each wrapped in a div gated by `opacity`/`visibility`. Don't swap the `text`/`at` props.
- Safe zones: key content between y≈220 and 1540. Caption pill at top 1420. Two-line Big text near the bottom must start at top ≤ ~1240 (size ~68–76) or it collides with the caption.
- Decor (Sun/Cloud/Moon) belongs in the top band (y ≈ 40–90). Otherwise it overlaps the Arabic heading at top ~300.
- **Protective halo/dome is inviolable.** "Evil" things (blobs, squiggles, the Puff) must bounce off or recoil and never cross the ring. Clamp their positions (e.g. `Math.max(ringEdge + margin, x)`). Don't drift them toward it with `x -= f * k`.
- Characters should rest on their props (the head on the pillow, the blanket drawn after the head so it tucks under the chin). Check this in stills.
- Style: cheerful and cute. The whisperer/Shaytan is the cute grey-purple `Puff` (green for jealousy). Draw no realistic people, magicians or prophets; the only figure is the abstract round `Child`.
- Captions: paraphrase lightly for kids (e.g. "unmindful" becomes "forgets Allah") but keep the meaning. Where the audio says "Lord" for إِلَٰه, the caption uses "God".

## Verification (always)
- `npx tsc --noEmit` and `npx remotion compositions src/index.ts` (check the frame count).
- Stills: `npx remotion still src/index.ts XVertical ../x/stills/tNN.png --frame=<sec*30>`. Take at least one per scene, plus frames just before and after each caption or phase switch and each Arabic-only window. Delete old stills first so none are stale, and look at every frame.
- After rendering: `ffprobe` shows the expected duration and an audio stream.
