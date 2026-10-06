---
name: surah-video
description: Make a new BarakahBlooms kids' surah explainer video (Remotion, 1080x1920) from an Adnaan Menk "Meaning of Surah X" YouTube Short link, in the exact house style of the Falaq/Naas videos.
argument-hint: "<youtube_url>"
allowed-tools:
  - read
  - grep
  - glob
---

# BarakahBlooms surah video — from a YouTube link to a finished MP4

You will turn one YouTube link into `<slug>/BarakahBlooms_Surah_<Name>_Vertical.mp4`.
Follow the steps **in order**. Do not skip a step. Do not "improve" the style — copy it.

Everything runs from the repo root `/Users/rami/Work/BarakahBloomsVideos` unless stated.
Skill files (paths relative to repo root):

| File | Use |
|---|---|
| `.devin/skills/surah-video/scripts/prepare.sh` | Step 1: title, audio, duration, Arabic verses, audio scan |
| `.devin/skills/surah-video/scripts/new_video.sh` | Step 4: create the `.tsx` from the template and register it |
| `.devin/skills/surah-video/scripts/stills.sh` | Step 6: render verification frames |
| `.devin/skills/surah-video/scripts/render.sh` | Step 7: type-check, render, check the MP4 |
| `.devin/skills/surah-video/template/TemplateVertical.tsx` | The starting file (all helpers included) |
| `.devin/skills/surah-video/reference/scene-recipes.md` | **Which picture to draw for which verse** + colors + layout numbers |
| `.devin/skills/surah-video/reference/worked-example-falaq.md` | A full example: timing map → scene list → code |

Also read the repo `AGENTS.md` once. Its rules are mandatory.

---

## Step 0 — Names

From the link's title (step 1 prints it) pick:
- `slug`: lowercase short name, no "al-"/"an-": `asr`, `kawthar`, `fil`, `nasr`, `masad`, `kafirun`, `quraysh`, `maun`.
- `Name`: the same in PascalCase: `Asr`, `Kawthar`, ...
- `n`: the surah number. If unsure, run:
  `curl -s https://api.alquran.cloud/v1/surah | python3 -c "import json,sys;[print(s['number'],s['englishName'],s['englishNameTranslation']) for s in json.load(sys.stdin)['data']]" | tail -40`

If you cannot get the title (oembed fails), ask the user for the surah name. Do not guess.

## Step 1 — Prepare (one command)

```bash
.devin/skills/surah-video/scripts/prepare.sh "<youtube_url>" <slug> <n>
```

It creates:
- `<slug>/title.txt`, `<slug>/duration.txt` (= **AUDIO_DUR**, seconds)
- `remotion/public/<slug>/voice.mp3` (the audio used by the video)
- `<slug>/verses.txt` — the **exact Arabic text** of each ayah (Bismillah removed). **This is the only allowed source of Arabic.** Copy-paste from it. Never type Arabic from memory.
- `<slug>/whisper_segments.txt` — English wording only. **Its timestamps are wrong.** Never use them.
- `<slug>/scan.txt` — sliding-window transcript (1.25 s windows every 0.75 s) + RMS dips. **This is your timing source.**

The scan takes a few minutes. Wait for it.

## Step 2 — Build the timing map `<slug>/timing.txt`

**How the audio works:** title in English ("Surah Al-Asr, a person says"), then for every verse: **Arabic recitation first, then the English meaning.** Sometimes an extra English explanation follows a verse.

**Reading `scan.txt`:**
- A window line looks like ` 1.50-  2.75: I seek the protection`.
- Arabic shows up as `(speaking in foreign language)`, `[foreign]`, `(Arabic)`, or **English-sounding nonsense** ("walk up" = waqab, "One in Sherwin" = wa min sharri, "Malikin Nast" = maliki-n-naas, "Cool, I don't think" = qul a'udhu...). If a window's words do not make sense as English in the explanation, it is Arabic.
- English windows contain the explanation words (compare with `whisper_segments.txt` wording).
- Known mis-hearings: "knocks" = knots, "gym" = jinn, "Al-Nassa"/"Fanaq" = An-Naas/Falaq, "swt" = Subhanahu wa Ta'ala.

**Procedure:**
1. Walk the windows top to bottom. Mark each window **EN** or **AR**.
2. A boundary is where the label changes. Because windows overlap, the true boundary lies between the start of the first window with the new label and the end of the last window with the old label.
3. Snap each boundary to the nearest **RMS dip** in the `--- RMS dips ---` list (`sec:dB`, e.g. `14.2:-34`) inside that range. If there is no dip, use the middle of the range.
4. If a boundary is still unclear, zoom in: `ffmpeg -y -ss 12 -to 18 -i remotion/public/<slug>/voice.mp3 /tmp/crop.mp3 && ./scan_audio.sh /tmp/crop.mp3 0.9 0.3` (times printed are then relative to 12 s — add 12).
5. Check: the number of AR spans must equal the number of ayahs in `verses.txt`, in order. If not, re-check the scan; ask the user only if you truly cannot resolve it.
6. Also note the absolute time of **key words** you will animate on (e.g. "Dawn" ~7.4). Take the start of the window where the word first appears, + ~0.3 s.

Write `<slug>/timing.txt` in exactly this format (copy the style of `falaq/timing.txt`):

```
# Surah Al-Xxx audio — corrected segment map (seconds, ±~0.3s)
# Derived from 1.25s sliding-window transcription + RMS dips. The speaker recites each
# verse in Arabic, then explains it in English.
0.00-1.90   EN  "Surah Al-Xxx, a person says"
1.95-3.30   AR  <ayah 1 copied from verses.txt>
3.40-7.60   EN  "<English meaning>"   ("keyword" ~6.7)
...
```

## Step 3 — Scene plan (write it down before coding)

Rules:
- **S1 = title**, from 0 to the start of the first Arabic span (usually ~1.9 s).
- **One scene per verse.** Scene start = **start of that verse's Arabic**. Scene end = start of the next verse's Arabic. The last verse scene ends at **AUDIO_DUR**.
- Extra English explanation after a verse stays in that verse's scene (switch the caption with `Show`), or gets its own scene if it is long (> ~5 s) and has a clear new idea (e.g. Naas S5 "Ibn Abbas said…", S6 "Remember Allah!"). Variant: the long explanation scene can continue into the next verse, whose Arabic then pops later with `at={s(AR_START - SCENE)}` (Falaq S3, see the worked example).
- Two very short verses may share one scene with a phase switch (Naas S7, Naas S3 "three names" cards).
- **Outro** = `[AUDIO_DUR, AUDIO_DUR + 3.7]`. Already in the template — do not change it.
- Inside a verse scene:
  - The Arabic line appears at scene start (`<Arabic ... />` with no `at`).
  - The English **Caption** and **Big** text appear when the English starts: `const en = s(EN_START - SCENE);`
  - Word-keyed actions use absolute times: `s(WORD_TIME - SCENE)`.
- Pick the **picture** for each verse from `reference/scene-recipes.md` (theme → recipe). Alternate backgrounds: warm-day / night / lavender / mint, never the same palette twice in a row.
- Write the **caption** (one sentence, kid-friendly paraphrase of the English, max ~60 characters, starts with "Say:" for a "Qul" verse, uses "…" when continuing a sentence from the previous scene) and the **Big text** (2–5 words, 1 or 2 lines, a simple kid takeaway like "Allah protects us").
- Where the speaker says "Lord" for إِلَٰه, the caption says "God".

Write the plan as a table in your reply (scene, start, end, Arabic, EN start, caption, big text, recipe). Check it against `timing.txt` once more.

## Step 4 — Create the file

```bash
.devin/skills/surah-video/scripts/new_video.sh <Name> <slug>
```

This creates `remotion/src/<slug>/<Name>Vertical.tsx` (a copy of the template) and registers `<Name>Vertical` in `remotion/src/Root.tsx`.

## Step 5 — Edit the file

Open `remotion/src/<slug>/<Name>Vertical.tsx`.

1. **EDIT ME block** at the top: `AUDIO_DUR` (from `duration.txt`, 2 decimals), `TITLE_AR` (copy the Arabic name from the `# ...` header in verses.txt — it already starts with `سُورَةُ`, e.g. `سُورَةُ الفَلَقِ` — and delete only the very last vowel mark, giving `سُورَةُ الفَلَق`), `TITLE_EN` (e.g. `Al-Asr`), `SUBTITLE` (English meaning from the verses.txt header, e.g. `The Time`).
2. **Keep S1 and Outro** as they are.
3. **Replace the example scenes S2, S3** with your scenes S2…Sn. For each, start from the recipe in `scene-recipes.md` (copy the referenced scene from `remotion/src/falaq/FalaqVertical.tsx` or `remotion/src/naas/NaasVertical.tsx`, then change the Arabic, times, caption, big text). Above each scene write a comment `// S4 [18.00, 24.15] <what it shows>`.
4. **Update `scenes`**: one row per scene, `[start, end, Component]`, consecutive (each end = next start), last story scene ends at `AUDIO_DUR`, then `[AUDIO_DUR, AUDIO_DUR + 3.7, Outro]`.
5. Delete helpers? **No.** Leave unused helpers in the file (house style).

### Hard code rules (each one crashed or broke a past video)
- **Every hook (`usePop`, `useCurrentFrame`, `useVideoConfig`) is called at the top of the scene component, unconditionally.** Never inside `? :`, `&&`, `if`, `.map`, or JSX props of conditionally rendered elements. Compute `const txt = usePop(en);` at the top, then use `txt` below. (Breaking this renders fine as stills but crashes the full render with React error #300.)
- `s(sec)` converts seconds to frames. Inside a scene, frame 0 = scene start. So any time from `timing.txt` must be written as `s(ABS_TIME - SCENE)`.
- Caption change inside a scene: one `<Caption>` per text, each wrapped in `<Show on={...}>`. Never change the `text`/`at` of one Caption.
- Arabic text: **paste from `<slug>/verses.txt`**. Wrap long verses by lowering `size` (78–96), never by splitting the text.
- Layout (1080 × 1920): decor Sun/Cloud/Moon at y 40–90 · Arabic heading `top={300}` · main picture between y ≈ 560 and 1200 · Big text `top` 1180–1245, size 68–80 (two lines must start at top ≤ 1240) · Caption is fixed at top 1420 (do not move it). Nothing important below 1540.
- Protective dome/ring is **never crossed**: evil things (BadBlob, Puff, Squiggle) bounce off. Clamp positions, e.g. `const puffX = Math.max(ringRight + 20, x);`.
- Characters: only the round `Child` and the cute `Puff` (grey-purple `#8D7BB8` default; green `#5E9E6E` for jealousy). **Never** draw realistic people, prophets, angels, magicians, faces of real beings, or images of Allah. Allah is shown only as the word `الله`, light, rays, a dome or ring.
- Style: cheerful, cute, soft gradients, round shapes, Fredoka/Amiri fonts. No scary content.

## Step 6 — Verify (always, before rendering)

```bash
cd remotion && npx tsc --noEmit && npx remotion compositions src/index.ts && cd ..
```
- `tsc` must print nothing. `compositions` must list `<Name>Vertical` with **frames = round((AUDIO_DUR + 3.7) × 30)**.

Then render stills (the script deletes old stills first):
```bash
.devin/skills/surah-video/scripts/stills.sh <Name> <slug> 1 <sec> <sec> ...
```
Choose seconds:
- 1 still in the middle of every scene,
- for every scene: 0.3 s **after** its start (Arabic visible, no caption yet) and 0.3 s **after** its EN start (caption + big text visible),
- 0.2 s before and after every caption switch / phase switch / word-keyed action,
- 1 in the Outro (AUDIO_DUR + 2).

**Open and look at every PNG** in `<slug>/stills/` with the read tool. Check each against this list and fix what fails, then re-run stills:
- [ ] Arabic is fully visible, not cut at the edges, correct verse for that time.
- [ ] Caption text matches what is being said at that moment; no caption before English starts.
- [ ] Big text does not touch the caption pill; nothing overlaps the Arabic heading.
- [ ] Sun/Cloud/Moon are in the top band and do not cover the Arabic.
- [ ] Evil things are outside the dome/ring.
- [ ] Child sits correctly on props (head on pillow, etc.).
- [ ] Colors are cheerful; scene looks like the Falaq/Naas stills style.

## Step 7 — Render

```bash
.devin/skills/surah-video/scripts/render.sh <Name> <slug>
```
Takes about 30 s – 2 min. Stills take ~2 s each. It checks the duration and the audio stream. Expected duration ≈ AUDIO_DUR + 3.7 s.
If the render crashes mid-way with React error #300 → a hook is inside a condition (see hard rules). Fix and re-render.

## Step 8 — Finish

1. Add the surah to the "Done so far" line in `AGENTS.md`.
2. Tell the user: output path, duration, the scene table, and anything uncertain (e.g. a boundary you were not sure about).
Do not commit unless asked.

## If something goes wrong
| Problem | Fix |
|---|---|
| `yt-dlp` fails | `brew upgrade yt-dlp`, retry. Still failing → ask the user for the mp3. |
| verses.txt empty | API down; retry. Never type Arabic yourself. |
| AR span count ≠ ayah count | Zoom scan (Step 2.4) on the doubtful part. Short ayahs (< 1.2 s) are easy to miss. |
| Arabic shows as boxes | Fonts not loaded: don't remove the `delayRender`/`document.fonts.load` block. |
| Frame count wrong | `AUDIO_DUR` wrong or `scenes` last row wrong. |
| Something in a still overlaps | Move it using the layout numbers above; check `scene-recipes.md` positions. |
