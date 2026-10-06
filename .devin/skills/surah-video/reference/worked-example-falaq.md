# Worked example — Surah Al-Falaq (113)

Finished result: `remotion/src/falaq/FalaqVertical.tsx`, timing map `falaq/timing.txt`.
Use this to check that your own plan has the same shape.

## Inputs
- AUDIO_DUR = 37.71 → total = s(37.71 + 3.7) = s(41.4) = 1242 frames.
- 5 ayahs in verses.txt → 5 AR spans found in the scan. ✔

## Timing map (from scan.txt)
```
0.00-1.45   EN  "Surah Al-Falaq,"
1.45-1.95   EN  "a person says"
1.95-3.65   AR  قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
3.65-8.00   EN  "I seek the protection of the Lord of the Dawn."   ("Lord" ~6.0, "Dawn" ~7.4)
8.00-14.20  EN  "Some of the scholars mention here, a person is asking Allah SWT to protect them from all evil."
14.25-15.20 AR  مِن شَرِّ مَا خَلَقَ
15.20-17.95 EN  "from all the evil that He has created,"
18.00-20.20 AR  وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ
20.25-24.10 EN  "and from the evil that occurs in the darkest parts of the night,"
24.15-26.75 AR  وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ
26.80-29.55 EN  "and from the evil of those magicians who blow on knots."
29.60-31.85 AR  وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ
31.95-37.65 EN  "And from the evil of the one who has jealousy and envy, when they have this jealousy and envy."
```
Scan clues that were Arabic: "walk up" (= waqab), "One in Sherwin" (= wa min sharri), "(speaking in foreign language)".

## Scene plan
| Scene | Start–End | Arabic (at start) | EN start → `en` | Caption | Big text | Recipe |
|---|---|---|---|---|---|---|
| S1 | 0 – 1.95 | title | — | — | Surah / Al-Falaq / The Daybreak | template title |
| S2 | 1.95 – 8.0 | ayah 1 | 3.65 → `s(3.65-1.95)` | Say: I seek protection with the Lord of the Dawn. | The Lord / of the Dawn (pops on "Lord" 6.0) | sunrise; sun finishes rising on "Dawn" 7.4 |
| S3 | 8.0 – 18.0 | ayah 2, **appears later** at 14.25 (`at={s(14.25-8.0)}`) | 8.3 → `s(0.3)` | (1) We ask Allah to protect us from every evil. (2) at 15.2: …from all the evil that He has created. | Protect me from / every evil | dome + bouncing BadBlobs |
| S4 | 18.0 – 24.15 | ayah 3 | 20.25 | …and from the evil that comes in the darkest night. | Safe in the / darkest night | sleeping child |
| S5 | 24.15 – 29.6 | ayah 4 | 26.8 (knots untie 26.8→29.0) | …and from the evil of those who blow on knots. | Allah protects us / from magic | rope & knots |
| S6 | 29.6 – 37.71 | ayah 5 | 31.95 (Puff bounces 32.5) | …and from the evil of the jealous when they envy. | …and from jealousy | jealous green Puff + ring |
| Outro | 37.71 – 41.4 | — | — | — | Follow for more… | template outro |

Notes:
- S3 is special: a long English explanation (8.0–14.2) came **before** ayah 2's Arabic, so the scene starts at 8.0 with the explanation and ayah 2's Arabic pops later; the caption switches with `Show` at 15.2.
- Palettes go: title night → dawn → warm day → deep night → lavender → mint. Never repeated back to back.
- Captions: "Say:" for the Qul verse; "…" to continue the sentence across scenes; magicians → "those who blow on knots" (no people drawn).

## Code pattern (from S4)
```tsx
// S4 [18.0, 24.15] Darkest night — child asleep, safe under glow
const S4: React.FC = () => {
  const f = useCurrentFrame();                 // hooks first, always
  const glow = usePop(8, 12);
  const txt = usePop(s(20.25 - 18.0));         // EN start - scene start
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0D0A2E, #221A55 55%, #3A2A7A)'}}>
      <Stars count={60} />
      <Moon x={780} y={60} />
      <Hills c1="#241845" c2="#181040" y={1560} />
      <Arabic text="وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" size={80} top={300} color="#C9D4FF" />
      {/* ...picture... */}
      <Big top={1240} size={76} color="#fff" style={{opacity: txt}}>Safe in the<br />darkest night</Big>
      <Caption text="…and from the evil that comes in the darkest night." at={s(20.25 - 18.0)} />
    </AbsoluteFill>
  );
};

const scenes: [number, number, React.FC][] = [
  [0, 1.95, S1],
  [1.95, 8.0, S2],
  [8.0, 18.0, S3],
  [18.0, 24.15, S4],
  [24.15, 29.6, S5],
  [29.6, 37.71, S6],
  [37.71, 41.4, Outro],
];
```
