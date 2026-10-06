# Scene recipes — what to draw for each verse

Pick one recipe per scene. **Copy the referenced scene code** from the existing video file, rename it (`S2`, `S3`, …), then change only: Arabic text, times (`SCENE`, `en`, word times), caption, Big text, and (if needed) colors from the palette table.

Files:
- `F` = `remotion/src/falaq/FalaqVertical.tsx`
- `N` = `remotion/src/naas/NaasVertical.tsx`
- `I` = `remotion/src/ikhlas/IkhlasVertical.tsx`
- `T` = the template (helpers `Dome`, `Ring`, `Heart`, `SunRays`, `PoofBurst`, `Zzz`, `Show`, `NameCard`, `Balloon`, `Child`, `Puff`, `Squiggle`, `BadBlob`, `FlowerHead`, `Sparkle`, `Stars`, `Moon`, `Sun`, `Cloud`, `Hills`)

Line numbers may drift a little; search for the comment `// S3 [` etc.

## 1. Existing recipes (proven)

| Theme of the verse | Recipe | Copy from |
|---|---|---|
| Seeking refuge / "I seek protection with Allah" | Golden **dome** over the Child, warm sky | N `S2` (~L261) or T `S2` |
| Protection from **all evil** | Dome over Child, grey spiky **BadBlobs** fly in and bounce off | F `S3` (~L299) |
| Dawn / daybreak / morning / light after dark | Night sky turns to sunrise, sun rises on the word "Dawn" | F `S2` (~L269) |
| Night / darkness / sleep | Child asleep in bed (head on pillow, blanket over chin), stars, moon, Zzz, soft glow | F `S4` (~L363) |
| Magic / knots / harmful tricks | Rope with 3 knots that untie one by one + sparkles | F `S5` (~L418) |
| Jealousy / envy / bad wishes | Child with flower inside golden **Ring**; green Puff bounces off ring and shrinks | F `S6` (~L461) |
| Whispering / Shaytan / bad thoughts | Puff floats in, "psst… psst…" squiggles, zips away on "goes away" | N `S4` (~L358) |
| Forgetting Allah / being distracted | Child looks at a Balloon while Puff sneaks up | N `S5` (~L398) |
| Remembering Allah / dhikr / Shaytan runs away | Golden burst with rotating rays, big `الله`, Puff POOFS on the keyword | N `S6` (~L422) |
| Hearts / chests / inner self protected | Heart inside a pulsing golden Ring, squiggles bounce off; phase switch for a 2nd verse | N `S7` (~L463) |
| Names / attributes of Allah listed (Lord, King, God…) | Stacked white **NameCards** (Arabic + English + icon), one pops per name | N `S3` (~L286) |
| One / unique / "nothing like Him" (tawhid) | Huge single word or number "1" popping, rays/glow | I scenes `S2`, `S4`, `S7` |
| Title | Already in the template `S1` — never redesign it | T `S1` |
| Outro | Already in the template — never change it | T `Outro` |

## 2. New themes (ideas built only from existing shapes)

Build these from simple SVG shapes (circles, rounded rects, paths) in the same flat, cute style. Keep the Child as the only "person".

| Theme | Idea |
|---|---|
| Time / passing days (Al-Asr) | Big round hourglass (two triangles + sand rects shrinking/growing) or a sun moving across the sky turning into the moon. Big text "Time is precious". |
| Loss vs. success | Child next to a flower that blooms (FlowerHead scale 0→1) when doing good deeds; little hearts float up. |
| Patience / truth / helping each other | 2–3 Child figures (different shirt colors, smaller size ~200) side by side, hearts between them. |
| Abundance / a gift / river (Al-Kawthar) | Wavy blue river (two animated paths) with sparkles, a gift box that opens; prayer = Child with hands up (just raise the arm circles). |
| Prayer / sacrifice | Child on a small prayer mat (rounded rect with stripes), soft glow behind. |
| Elephant army / birds (Al-Fil) | Cute round grey elephant (circles), little birds (teardrops + wings) carrying tiny pebbles; never show harm — elephants simply turn back / sit down. |
| Journeys, winter & summer (Quraysh) | Caravan of cute camel shapes walking on hills; snowflakes ↔ sun swap; bowl of food + a safe house for "fed them, kept them safe". |
| Helping orphans / feeding the poor (Al-Ma'un) | Child handing a bowl/apple to another Child; hearts. Contrast: Puff pushing the bowl away = gentle frown, no violence. |
| Different religions "to you yours" (Al-Kafirun) | Two paths splitting on a hill, a Child happily walking the glowing one. |
| Victory / people joining (An-Nasr) | Many small Child figures (size 120–160) arriving in rows with confetti/Sparkles; Big text "Glorify Allah". |
| Punishment / fire (Al-Masad) | Keep it gentle: a wilted plant / a rope (reuse F `S5` rope) and a frowning cloud. No flames on any character. |

If no row fits, use a generic picture: dome/ring + Child + a symbolic object, and let the caption carry the meaning.

## 3. Palettes (backgrounds) — alternate, never the same twice in a row

| Name | Background | Hills c1 / c2 | Arabic / Big text color |
|---|---|---|---|
| Title night→dawn | `linear-gradient(#14104A, #4A2E8C 55%, #C86B98 85%, #FFB35C)` | `#3C2A8A` / `#2A1E66` | `#FFE27A` / `#fff` |
| Warm day | `linear-gradient(#FFE9C2, #FFC98A 60%, #FFB08A)` | `#8BD17C` / `#5DB75A` | `#7A3B10` / `#7A3B10` |
| Orange morning | `linear-gradient(#FFD98E, #FFB35C 60%, #FF9A76)` | `#8BD17C` / `#5DB75A` | `#7A3B10` / `#7A3B10` |
| Sky blue | `linear-gradient(#8FD8FF, #DDF4FF)` | `#8BD17C` / `#5DB75A` | `#3B2A63` / `#3B2A63` |
| Deep night | `linear-gradient(#0D0A2E, #221A55 55%, #3A2A7A)` | `#241845` / `#181040` | `#C9D4FF` / `#fff` |
| Dusk purple | `linear-gradient(#2A1E4E, #4A3678 60%, #6B4FA0)` | `#33245E` / `#241845` | `#E9D9FF` / `#fff` |
| Starry indigo | `linear-gradient(#151040, #2E2068 55%, #4A3590)` | — | `#FFE27A` / `#fff` |
| Lavender | `linear-gradient(160deg, #E3D7FF, #C7B8FF 60%, #B09BEF)` | `#9E8BE8` / `#7A66C8` | `#4A3570` / `#3B2A63` |
| Mint | `linear-gradient(160deg, #B8F1D8, #7FD8BE 55%, #4FB89E)` | `#6BCB77` / `#4FA95B` | `#1E5B4A` / `#14503F` |
| Golden burst | `radial-gradient(circle at 50% 45%, #FFF3B0, #FFC857 55%, #FF9A5C)` | — | `#B8860B` / `#7A3B10` |

Decor per palette: day palettes → `<Sun x={800} y={40} />` + `<Cloud x={40} y={90} />`; night palettes → `<Stars />` + `<Moon x={780} y={60} />`; lavender → `<Cloud x={720} y={80} />`.
Hills always `y={1560}`.

Accent colors: gold `#FFD23F`/`#FFE27A`, pink `#FF7AA2`, plum `#3B2A63`, Puff `#8D7BB8` (green `#5E9E6E` for jealousy), squiggles `#C9B8EA`.

## 4. Layout cheat-sheet (canvas 1080 × 1920)

| Element | Position |
|---|---|
| Sun / Cloud / Moon | y 40–90 (Moon `y={60}`) |
| Arabic verse | `<Arabic top={300} size={78–96} />` (long verse → smaller size, ≥ 72) |
| Optional heading Big text (no Arabic, e.g. "Ibn Abbas said…") | `top={300}` size 80 |
| Main picture centre | x 540, y ≈ 900–960 (Dome `cx={540} cy={960}`, Child `x={390} y={840} size={300}`) |
| Big text | `top` 1180–1245, size 68–80, 1–2 lines, `<br />` between lines |
| Caption | automatic, top 1420 — don't move |
| Safe zone | 220 ≤ y ≤ 1540 for anything important |

## 5. Animation vocabulary (use these, nothing fancier)

- Pop in: `const p = usePop(delayFrames, damping);` → `opacity: p`, `transform: scale(${p})` or `scale(${0.7 + 0.3 * p})`.
- Move: `interpolate(f, [startF, endF], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})`.
- Idle life: `Math.sin(f / 10) * 8` bobbing; pulse `1 + Math.sin(f / 14) * 0.02`.
- Disappear on a word: scale to 0 over 8 frames + `<PoofBurst x y at />`.
- Bounce off a ring: knock back with `Easing.out(Easing.back(2))` and clamp with `Math.max(...)` so it never enters.
