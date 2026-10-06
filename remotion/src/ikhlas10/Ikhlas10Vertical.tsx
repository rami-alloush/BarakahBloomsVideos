import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';

// Vertical 9:16 version for Reels / TikTok / Shorts.
// Key content is kept between y≈220 and y≈1540 so app buttons and captions don't cover it.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const W = 1080;

const EN = 'Fredoka, sans-serif';
const AR = 'Amiri, serif';
const PLUM = '#3B1F4A';

// ===== EDIT ME (per video) =====
const AUDIO_DUR = 44.7; // ffprobe duration of voice.mp3 (seconds)
const TITLE_AR = 'سُورَةُ الإِخْلَاص';
const TITLE_EN = 'Al-Ikhlas';   // shown under "Surah"
const SUBTITLE = 'Read it 10 times!';

const BISM = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const A1 = 'قُلْ هُوَ اللَّهُ أَحَدٌ';
const A2 = 'اللَّهُ الصَّمَدُ';
const A4 = 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ';

// Fredoka can't render ﷺ / ﷻ — wrap them in the Arabic font.
const ArGlyph: React.FC<{children: React.ReactNode}> = ({children}) => <span style={{fontFamily: AR}}>{children}</span>;
export const TOTAL_V_IKHLAS10 = s(AUDIO_DUR + 3.7);

const usePop = (delay = 0, damping = 11) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping, mass: 0.7}});
};

const SceneFade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 8, dur - 8, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const Stars: React.FC<{count?: number; color?: string; opacity?: number}> = ({count = 40, color = '#fff', opacity = 1}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      {Array.from({length: count}).map((_, i) => {
        const x = (i * 397) % W;
        const y = (i * 263) % 1500;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 18 + i));
        const r = 3 + (i % 4) * 1.6;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: tw, boxShadow: `0 0 ${r * 4}px ${color}`}} />;
      })}
    </AbsoluteFill>
  );
};

const Hills: React.FC<{c1: string; c2: string; y?: number}> = ({c1, c2, y = 1500}) => (
  <svg width={W} height={1920} style={{position: 'absolute'}}>
    <path d={`M0 ${y} Q 250 ${y - 120} 540 ${y - 20} T 1080 ${y - 40} V1920 H0 Z`} fill={c1} />
    <path d={`M0 ${y + 80} Q 300 ${y - 10} 600 ${y + 60} T 1080 ${y + 50} V1920 H0 Z`} fill={c2} />
  </svg>
);

const Sparkle: React.FC<{x: number; y: number; size: number; delay: number; color?: string}> = ({x, y, size, delay, color = '#FFE27A'}) => {
  const f = useCurrentFrame();
  const t = ((f + delay) % 50) / 50;
  const sc = Math.sin(t * Math.PI);
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x, top: y, transform: `scale(${sc}) rotate(${t * 90}deg)`}}>
      <path d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10Z" fill={color} />
    </svg>
  );
};

const Caption: React.FC<{text: React.ReactNode; at?: number}> = ({text, at = 0}) => {
  const p = usePop(at, 14);
  return (
    <div style={{position: 'absolute', top: 1420, width: '100%', display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.95)', color: '#3B2A63', fontFamily: EN, fontWeight: 600, fontSize: 46, lineHeight: 1.25, padding: '20px 40px', borderRadius: 50, boxShadow: '0 10px 0 rgba(0,0,0,0.12)', maxWidth: 900, textAlign: 'center'}}>{text}</div>
    </div>
  );
};

const Arabic: React.FC<{text: string; size?: number; color?: string; at?: number; top?: number}> = ({text, size = 110, color = '#fff', at = 0, top = 120}) => {
  const p = usePop(at, 15);
  return (
    <div dir="rtl" style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: size, color, opacity: p, transform: `scale(${0.7 + 0.3 * p})`, textShadow: '0 6px 0 rgba(0,0,0,0.15)', lineHeight: 1.6}}>
      {text}
    </div>
  );
};

const Big: React.FC<{top: number; size: number; color: string; children: React.ReactNode; style?: React.CSSProperties}> = ({top, size, color, children, style}) => (
  <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: size, lineHeight: 1.1, color, ...style}}>{children}</div>
);

// Wrap a Caption (or anything) in this to switch it on/off by frame — never swap the text prop.
const Show: React.FC<{on: boolean; children: React.ReactNode}> = ({on, children}) => (
  <div style={{opacity: on ? 1 : 0, visibility: on ? 'visible' : 'hidden'}}>{children}</div>
);

// ---------- little drawings ----------
const Moon: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <svg width={220} height={220} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y + Math.sin(f / 20) * 8}}>
      <defs>
        <mask id="mvIkhlas10">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="64" cy="40" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="48" cy="50" r="38" fill="#FFE27A" mask="url(#mvIkhlas10)" />
    </svg>
  );
};

const Sun: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 220}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="-60 -60 120 120" style={{position: 'absolute', left: x, top: y}}>
      <g transform={`rotate(${f * 0.8})`}>
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x="-3" y="-58" width="6" height="16" rx="3" fill="#FFB627" transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r="36" fill="#FFD23F" />
      <circle cx="-12" cy="-4" r="4" fill="#5a3b00" />
      <circle cx="12" cy="-4" r="4" fill="#5a3b00" />
      <path d="M-12 10 Q0 20 12 10" stroke="#5a3b00" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const Cloud: React.FC<{x: number; y: number; rain?: boolean; delay?: number}> = ({x, y, rain, delay = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x + Math.sin(f / 30) * 15, top: y}}>
      <svg width={300} height={160} viewBox="0 0 150 80">
        <g fill="#fff">
          <circle cx="45" cy="45" r="25" />
          <circle cx="80" cy="35" r="32" />
          <circle cx="112" cy="48" r="22" />
          <rect x="40" y="45" width="80" height="25" rx="12" />
        </g>
      </svg>
      {rain &&
        Array.from({length: 7}).map((_, i) => {
          const t = ((f - delay) * 6 + i * 37) % 300;
          return f > delay ? <div key={i} style={{position: 'absolute', left: 50 + i * 30, top: 130 + t, width: 10, height: 22, borderRadius: 10, background: '#7FC8F8', opacity: 1 - t / 300}} /> : null;
        })}
    </div>
  );
};

// Cute round child figure — simple shapes, friendly, not realistic.
const Child: React.FC<{x: number; y: number; size?: number; lookX?: number; asleep?: boolean}> = ({x, y, size = 300, lookX = 0, asleep = false}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 16) * 6;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 100 125" style={{position: 'absolute', left: x, top: y + bob}}>
      {/* body */}
      <rect x="30" y="62" width="40" height="46" rx="18" fill="#7FB5F2" />
      {/* arms */}
      <circle cx="26" cy="80" r="9" fill="#7FB5F2" />
      <circle cx="74" cy="80" r="9" fill="#7FB5F2" />
      {/* legs */}
      <rect x="38" y="104" width="9" height="16" rx="4" fill="#4A6FA5" />
      <rect x="53" y="104" width="9" height="16" rx="4" fill="#4A6FA5" />
      {/* head */}
      <circle cx="50" cy="36" r="28" fill="#FFD9B3" />
      {/* hair tuft */}
      <path d="M30 30 Q34 8 50 10 Q66 8 70 30 Q60 18 50 18 Q40 18 30 30Z" fill="#6B4A2B" />
      {/* eyes: open dots or closed arcs */}
      {asleep ? (
        <>
          <path d="M35 36 Q41 41 47 36" stroke="#2E2A33" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M53 36 Q59 41 65 36" stroke="#2E2A33" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={41 + lookX} cy="36" r="3.6" fill="#2E2A33" />
          <circle cx={59 + lookX} cy="36" r="3.6" fill="#2E2A33" />
        </>
      )}
      {/* cheeks + smile */}
      <circle cx="34" cy="44" r="4" fill="#FFB0A0" opacity="0.7" />
      <circle cx="66" cy="44" r="4" fill="#FFB0A0" opacity="0.7" />
      <path d="M43 47 Q50 53 57 47" stroke="#B0654A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// The sneaky puff — cute, not scary. tintable.
const Puff: React.FC<{x: number; y: number; size?: number; wiggle?: boolean; color?: string}> = ({x, y, size = 200, wiggle = true, color = '#8D7BB8'}) => {
  const f = useCurrentFrame();
  const wig = wiggle ? Math.sin(f / 6) * 6 : 0;
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" style={{position: 'absolute', left: x, top: y + Math.sin(f / 10) * 12, transform: `rotate(${wig}deg)`}}>
      <g fill={color}>
        <circle cx="30" cy="50" r="22" />
        <circle cx="55" cy="38" r="26" />
        <circle cx="76" cy="55" r="18" />
        <circle cx="48" cy="62" r="24" />
      </g>
      <circle cx="50" cy="66" r="18" fill={color} opacity="0.6" />
      {/* sly half-lidded eyes */}
      <ellipse cx="42" cy="48" rx="8" ry="6" fill="#fff" />
      <ellipse cx="64" cy="48" rx="8" ry="6" fill="#fff" />
      <rect x="33" y="42" width="18" height="5" rx="2.5" fill={color} transform="rotate(-6 42 44)" />
      <rect x="55" y="42" width="18" height="5" rx="2.5" fill={color} transform="rotate(6 64 44)" />
      <circle cx="46" cy="50" r="2.6" fill="#2E2A33" />
      <circle cx="68" cy="50" r="2.6" fill="#2E2A33" />
      {/* smirk */}
      <path d="M48 62 Q56 66 62 61" stroke="#3E3550" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// "psst…" whisper squiggles drifting toward a target
const Squiggle: React.FC<{x: number; y: number; delay?: number; flip?: boolean; color?: string}> = ({x, y, delay = 0, flip, color = '#C9B8EA'}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  if (t < 0) return null;
  const drift = (t * 2.4) % 90;
  const o = Math.max(0, 1 - drift / 90);
  return (
    <svg width={90} height={50} viewBox="0 0 60 34" style={{position: 'absolute', left: x + (flip ? -drift : drift), top: y + Math.sin(f / 5) * 4, opacity: o, transform: `scaleX(${flip ? -1 : 1})`}}>
      <path d="M0 17 Q 8 6 16 17 T 32 17 T 48 17" stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
};

const FlowerHead: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 120}) => {
  const f = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{position: 'absolute', left: x, top: y + Math.sin(f / 9) * 6}}>
      <g transform="translate(40 40)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-22" rx="13" ry="20" fill="#FF7AA2" transform={`rotate(${a})`} />
        ))}
        <circle r="13" fill="#FFD23F" />
      </g>
    </svg>
  );
};

const BadBlob: React.FC<{fromX: number; fromY: number; toX: number; toY: number; delay: number}> = ({fromX, fromY, toX, toY, delay}) => {
  const f = useCurrentFrame();
  if (f < delay) return null;
  const t = (f - delay) % 50;
  const go = interpolate(t, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const back = interpolate(t, [20, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const x = fromX + (toX - fromX) * go + (fromX - toX) * back * 0.9;
  const y = fromY + (toY - fromY) * go + (fromY - toY) * back * 0.9 - Math.sin(back * Math.PI) * 40;
  const o = interpolate(t, [0, 4, 38, 46], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const r = 34;
  return (
    <svg width={r * 2 + 20} height={r * 2 + 20} viewBox="-50 -50 100 100" style={{position: 'absolute', left: x, top: y, opacity: o, transform: `rotate(${t * 6}deg)`}}>
      <g fill="#8A8FA3">
        <circle r="30" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 34} cy={Math.sin((a * Math.PI) / 180) * 34} rx="9" ry="5" transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 34} ${Math.sin((a * Math.PI) / 180) * 34})`} />
        ))}
      </g>
      <circle cx="-8" cy="-8" r="8" fill="#B8BFD4" opacity="0.8" />
    </svg>
  );
};

const NameCard: React.FC<{top: number; delay: number; arabic: string; title: string; icon: React.ReactNode}> = ({top, delay, arabic, title, icon}) => {
  const p = usePop(delay, 10);
  return (
    <div style={{position: 'absolute', left: 90, top, width: 900, height: 350, background: '#fff', borderRadius: 46, transform: `scale(${p}) rotate(${(1 - p) * -4}deg)`, boxShadow: '0 14px 0 rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', padding: '0 36px', boxSizing: 'border-box'}}>
      <div style={{width: 220, height: 220, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
      <div style={{flex: 1, textAlign: 'center'}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 82, color: '#5B3BA8', lineHeight: 1.4}}>{arabic}</div>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 50, color: '#3B2A63', lineHeight: 1.1}}>{title}</div>
      </div>
    </div>
  );
};

const IconHandsHeart = (
  <svg width={220} height={220} viewBox="0 0 100 100">
    {/* two cupped hands holding a heart */}
    <path d="M18 62 Q 30 78 50 78 Q 70 78 82 62 L 74 56 Q 64 68 50 68 Q 36 68 26 56Z" fill="#FFC857" />
    <path d="M14 58 Q 20 72 34 76 L 28 82 Q 14 76 8 62Z" fill="#F0A83B" />
    <path d="M86 58 Q 80 72 66 76 L 72 82 Q 86 76 92 62Z" fill="#F0A83B" />
    <path d="M50 30 C 42 18 26 22 26 34 C 26 46 40 54 50 62 C 60 54 74 46 74 34 C 74 22 58 18 50 30Z" fill="#FF6B8A" />
    <ellipse cx="40" cy="32" rx="6" ry="4" fill="#fff" opacity="0.5" transform="rotate(-20 40 32)" />
  </svg>
);

const IconCrown = (
  <svg width={220} height={220} viewBox="0 0 100 100">
    <path d="M15 70 L10 32 L32 50 L50 22 L68 50 L90 32 L85 70Z" fill="#FFD23F" stroke="#E8A820" strokeWidth="4" strokeLinejoin="round" />
    <rect x="15" y="70" width="70" height="10" rx="5" fill="#E8A820" />
    <circle cx="50" cy="20" r="6" fill="#FF6B8A" />
    <circle cx="11" cy="30" r="5" fill="#5BC0EB" />
    <circle cx="89" cy="30" r="5" fill="#5BC0EB" />
    <circle cx="50" cy="60" r="5" fill="#FF6B8A" />
  </svg>
);

const IconGlowStar = (
  <svg width={220} height={220} viewBox="-50 -50 100 100">
    <circle r="46" fill="#FFF3B0" opacity="0.5" />
    <circle r="34" fill="#FFE27A" opacity="0.5" />
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x="-3" y="-48" width="6" height="14" rx="3" fill="#FFB627" transform={`rotate(${i * 45})`} />
    ))}
    <path d="M0 -30 L8 -8 L30 -7 L13 7 L19 29 L0 17 L-19 29 L-13 7 L-30 -7 L-8 -8Z" fill="#FFD23F" stroke="#E8A820" strokeWidth="2" />
  </svg>
);

const Balloon: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <svg width={140} height={220} viewBox="0 0 60 95" style={{position: 'absolute', left: x + Math.sin(f / 14) * 10, top: y + Math.sin(f / 11) * 14}}>
      <path d="M30 44 Q 26 60 30 76" stroke="#8A6BB8" strokeWidth="2.5" fill="none" />
      <ellipse cx="30" cy="24" rx="22" ry="24" fill="#FF7AA2" />
      <path d="M27 47 L30 52 L33 47Z" fill="#FF7AA2" />
      <ellipse cx="22" cy="16" rx="6" ry="8" fill="#fff" opacity="0.5" />
    </svg>
  );
};

// Golden protective dome, centred at (cx, cy).
const Dome: React.FC<{cx: number; cy: number; r?: number; at?: number}> = ({cx, cy, r = 260, at = 4}) => {
  const f = useCurrentFrame();
  const dome = usePop(at, 9);
  const pulse = 1 + Math.sin(f / 14) * 0.02;
  return (
    <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,122,0.3), rgba(255,190,80,0.5) 65%, rgba(255,226,122,0.12) 78%, transparent 80%)', border: '8px solid rgba(255,226,122,0.85)', boxShadow: '0 0 80px rgba(255,210,90,0.6), inset 0 0 60px rgba(255,240,180,0.45)', transform: `scale(${dome * pulse})`, boxSizing: 'border-box'}} />
  );
};

// Golden glowing ring border, centred at (cx, cy).
const Ring: React.FC<{cx: number; cy: number; r?: number; at?: number}> = ({cx, cy, r = 240, at = 6}) => {
  const f = useCurrentFrame();
  const ring = usePop(at, 10);
  const beat = 1 + Math.sin(f / 8) * 0.03;
  return (
    <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', border: '9px solid rgba(255,210,90,0.9)', boxShadow: '0 0 70px rgba(255,210,90,0.6), inset 0 0 60px rgba(255,210,90,0.3)', transform: `scale(${ring * beat})`, boxSizing: 'border-box'}} />
  );
};

// Big pink heart svg; x,y = top-left, size = width.
const Heart: React.FC<{x: number; y: number; size?: number; scale?: number}> = ({x, y, size = 340, scale = 1}) => (
  <svg width={size} height={size * (95 / 100)} viewBox="0 0 100 95" style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`}}>
    <path d="M50 88 C 20 66 6 48 6 32 C 6 16 20 6 32 6 C 41 6 48 11 50 18 C 52 11 59 6 68 6 C 80 6 94 16 94 32 C 94 48 80 66 50 88Z" fill="#FF7AA2" />
    <ellipse cx="32" cy="28" rx="10" ry="7" fill="#fff" opacity="0.55" transform="rotate(-25 32 28)" />
  </svg>
);

// Rotating white ray fan filling the screen, centred at (cx, cy).
const SunRays: React.FC<{cx?: number; cy?: number; opacity?: number}> = ({cx = 540, cy = 860, opacity = 0.3}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={1920} style={{position: 'absolute', opacity}}>
      <g transform={`translate(${cx} ${cy}) rotate(${f * 0.5})`}>
        {Array.from({length: 18}).map((_, i) => (
          <path key={i} d="M0 0 L-70 -1500 L70 -1500Z" fill="#fff" transform={`rotate(${i * 20})`} />
        ))}
      </g>
    </svg>
  );
};

// 8-dot poof burst centred at (x, y), plays during [at, at+20).
const PoofBurst: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const f = useCurrentFrame();
  if (f < at || f >= at + 20) return null;
  return (
    <>
      {Array.from({length: 8}).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const d = interpolate(f - at, [0, 18], [30, 260], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        const o = interpolate(f - at, [10, 18], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <div key={i} style={{position: 'absolute', left: x + Math.cos(ang) * d, top: y + Math.sin(ang) * d, width: 26, height: 26, borderRadius: '50%', background: i % 2 ? '#C9B8EA' : '#FFE27A', opacity: o}} />;
      })}
    </>
  );
};

// Floating z's rising from (x, y) — for a sleeping child.
const Zzz: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <>
      {[0, 1, 2].map((i) => {
        const t = (f * 1.5 + i * 40) % 160;
        return (
          <div key={i} style={{position: 'absolute', left: x + i * 40 + Math.sin((f + i * 9) / 12) * 14, top: y - t * 1.6, fontFamily: EN, fontWeight: 700, fontSize: 54 - i * 8, color: '#C9D4FF', opacity: Math.max(0, 1 - t / 160)}}>
            z
          </div>
        );
      })}
    </>
  );
};

// ---------- extra drawings for this video ----------
const Flower: React.FC<{x: number; color: string; delay: number; bottom: number}> = ({x, color, delay, bottom}) => {
  const f = useCurrentFrame();
  const g = interpolate(f - delay, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  const sway = Math.sin((f + delay) / 14) * 4;
  return (
    <svg width={150} height={300} viewBox="0 0 80 160" style={{position: 'absolute', left: x, bottom, transformOrigin: 'bottom center', transform: `scaleY(${g}) rotate(${sway}deg)`}}>
      <path d="M40 160 Q 36 110 40 60" stroke="#3E9B4F" strokeWidth="6" fill="none" />
      <ellipse cx="28" cy="115" rx="14" ry="6" fill="#4CB860" transform="rotate(-30 28 115)" />
      <ellipse cx="52" cy="100" rx="14" ry="6" fill="#4CB860" transform="rotate(30 52 100)" />
      <g transform={`translate(40 45) scale(${g})`}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-17" rx="11" ry="17" fill={color} transform={`rotate(${a})`} />
        ))}
        <circle r="11" fill="#FFD23F" />
      </g>
    </svg>
  );
};

const Bird: React.FC<{delay: number; y: number}> = ({delay, y}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  const x = interpolate(t, [0, 120], [-200, 760], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flap = Math.sin(t / 3) * 25;
  return (
    <svg width={140} height={100} viewBox="0 0 70 50" style={{position: 'absolute', left: x, top: y + Math.sin(t / 10) * 20}}>
      <ellipse cx="35" cy="28" rx="18" ry="13" fill="#5BC0EB" />
      <circle cx="50" cy="20" r="9" fill="#5BC0EB" />
      <circle cx="53" cy="18" r="2" fill="#222" />
      <path d="M58 20 L66 22 L58 24Z" fill="#FFA62B" />
      <path d={`M30 24 Q 22 ${10 - flap / 3} 12 ${16 - flap / 2} Q 24 30 34 28Z`} fill="#3A9BD8" />
    </svg>
  );
};

const Card: React.FC<{top: number; delay: number; arabic: string; title: string; kind: 'down' | 'up'}> = ({top, delay, arabic, title, kind}) => {
  const p = usePop(delay, 10);
  const f = useCurrentFrame();
  const cross = interpolate(f - delay, [25, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dir = kind === 'down' ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: 110, top, width: 860, height: 480, background: '#fff', borderRadius: 50, transform: `scale(${p}) rotate(${(1 - p) * (kind === 'down' ? -6 : 6)}deg)`, boxShadow: '0 16px 0 rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', padding: '0 40px', boxSizing: 'border-box'}}>
      <svg width={260} height={260} viewBox="-90 -90 180 180" style={{flexShrink: 0}}>
        <circle cx="0" cy={-20 * dir} r="18" fill="#FFC857" />
        <path d={`M0 ${-2 * dir} V ${20 * dir} M-50 ${20 * dir} H50 M-50 ${20 * dir} V ${35 * dir} M0 ${20 * dir} V ${35 * dir} M50 ${20 * dir} V ${35 * dir}`} stroke="#C9B8EA" strokeWidth="5" strokeDasharray="6 6" fill="none" />
        {[-50, 0, 50].map((cx) => (
          <circle key={cx} cx={cx} cy={45 * dir} r="11" fill="none" stroke="#C9B8EA" strokeWidth="5" strokeDasharray="5 5" />
        ))}
        <g opacity={cross} transform={`translate(0 ${30 * dir}) scale(${cross})`} stroke="#FF5A5F" strokeWidth="12" strokeLinecap="round">
          <line x1="-40" y1="-30" x2="40" y2="30" />
          <line x1="40" y1="-30" x2="-40" y2="30" />
        </g>
      </svg>
      <div style={{flex: 1, textAlign: 'center'}}>
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 90, color: '#5B3BA8', lineHeight: 1.5}}>{arabic}</div>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 52, color: '#3B2A63', lineHeight: 1.1}}>{title}</div>
      </div>
    </div>
  );
};

// Little open book (rounded pages, gold spine) — for reading scenes.
const Book: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 220}) => {
  const f = useCurrentFrame();
  return (
    <svg width={w} height={w * 0.6} viewBox="0 0 140 84" style={{position: 'absolute', left: x, top: y + Math.sin(f / 12) * 5}}>
      <path d="M8 14 Q 38 2 68 14 V 76 Q 38 64 8 76 Z" fill="#fff" />
      <path d="M132 14 Q 102 2 72 14 V 76 Q 102 64 132 76 Z" fill="#fff" />
      <rect x="64" y="10" width="12" height="66" rx="5" fill="#E8A820" />
      <path d="M18 26 Q 40 18 58 26 M18 40 Q 40 32 58 40 M18 54 Q 40 46 58 54" stroke="#C9B8EA" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M82 26 Q 100 18 122 26 M82 40 Q 100 32 122 40 M82 54 Q 100 46 122 54" stroke="#C9B8EA" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Cute house ("a home in Jannah"): walls rise from the ground, roof drops in.
const House: React.FC<{x: number; y: number; w?: number; pop?: number}> = ({x, y, w = 460, pop = 1}) => {
  const f = useCurrentFrame();
  const wallT = interpolate(f, [24, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const roofT = interpolate(f, [34, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  return (
    <svg width={w} height={w} viewBox="0 0 400 400" style={{position: 'absolute', left: x, top: y, transform: `scale(${pop})`, transformOrigin: '50% 100%'}}>
      <ellipse cx="200" cy="372" rx="180" ry="22" fill="rgba(0,0,0,0.10)" />
      <g transform={`translate(0 350) scale(1 ${wallT}) translate(0 -350)`}>
        <rect x="70" y="150" width="260" height="200" rx="30" fill="#FFF1DC" />
        <path d="M172 350 V262 A28 28 0 0 1 228 262 V350 Z" fill="#B07CFF" />
        <circle cx="218" cy="310" r="5" fill="#FFE27A" />
        <rect x="100" y="200" width="58" height="56" rx="14" fill="#FFE27A" />
        <path d="M129 202 V254 M102 228 H156" stroke="#fff" strokeWidth="6" />
        <rect x="242" y="200" width="58" height="56" rx="14" fill="#FFE27A" />
        <path d="M271 202 V254 M244 228 H298" stroke="#fff" strokeWidth="6" />
      </g>
      <g opacity={roofT} transform={`translate(0 ${(1 - roofT) * -300})`}>
        <path d="M48 168 L200 60 L352 168 Q352 178 342 178 H58 Q48 178 48 168Z" fill="#FF7AA2" stroke="#E85A86" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="200" cy="62" r="20" fill="#FFB627" />
        <path d="M200 34 A14 14 0 1 0 200 62 A10 10 0 1 1 200 34Z" fill="#FFD23F" />
      </g>
    </svg>
  );
};

// Golden palace: central dome, two minarets with crescent tips, glowing windows.
const Palace: React.FC<{x: number; y: number; w?: number; pop?: number}> = ({x, y, w = 300, pop = 1}) => (
  <svg width={w} height={w * 0.95} viewBox="0 0 400 380" style={{position: 'absolute', left: x, top: y, transform: `scale(${pop})`, transformOrigin: '50% 100%', opacity: Math.min(1, pop)}}>
    <rect x="20" y="318" width="360" height="42" rx="18" fill="#E8A820" />
    <rect x="46" y="96" width="38" height="226" rx="16" fill="#FFE9A8" />
    <rect x="316" y="96" width="38" height="226" rx="16" fill="#FFE9A8" />
    <circle cx="65" cy="92" r="24" fill="#FFB627" />
    <circle cx="335" cy="92" r="24" fill="#FFB627" />
    <path d="M65 60 A13 13 0 1 0 65 86 A9 9 0 1 1 65 60Z" fill="#FFD23F" />
    <path d="M335 60 A13 13 0 1 0 335 86 A9 9 0 1 1 335 60Z" fill="#FFD23F" />
    <rect x="104" y="170" width="192" height="152" rx="24" fill="#FFF3C8" />
    <path d="M118 172 Q200 62 282 172 Z" fill="#FFB627" />
    <circle cx="200" cy="74" r="10" fill="#FFD23F" />
    <path d="M200 44 A13 13 0 1 0 200 70 A9 9 0 1 1 200 44Z" fill="#FFD23F" />
    <path d="M180 322 V252 A20 20 0 0 1 220 252 V322 Z" fill="#B07CFF" />
    <path d="M132 250 A14 14 0 0 1 160 250 V286 H132 Z" fill="#FFF8DC" />
    <path d="M240 250 A14 14 0 0 1 268 250 V286 H240 Z" fill="#FFF8DC" />
    <rect x="60" y="150" width="10" height="30" rx="5" fill="#FFF8DC" />
    <rect x="330" y="150" width="10" height="30" rx="5" fill="#FFF8DC" />
  </svg>
);

// Round stopwatch; hand angle driven by `angle` (degrees, 0 = pointing up).
const Stopwatch: React.FC<{x: number; y: number; w?: number; angle: number; pop?: number}> = ({x, y, w = 520, angle, pop = 1}) => (
  <svg width={w} height={w} viewBox="0 0 300 300" style={{position: 'absolute', left: x, top: y, transform: `scale(${pop})`, transformOrigin: '50% 50%'}}>
    <rect x="136" y="4" width="28" height="34" rx="10" fill="#E8A820" />
    <rect x="206" y="34" width="34" height="20" rx="9" fill="#E8A820" transform="rotate(35 206 34)" />
    <circle cx="150" cy="170" r="126" fill="#fff" stroke="#E8A820" strokeWidth="14" />
    {Array.from({length: 12}).map((_, i) => (
      <rect key={i} x="146" y="58" width="8" height={i % 3 === 0 ? 22 : 12} rx="4" fill={i % 3 === 0 ? '#E8A820' : '#F2D59B'} transform={`rotate(${i * 30} 150 170)`} />
    ))}
    <g transform={`rotate(${angle} 150 170)`}>
      <line x1="150" y1="170" x2="150" y2="84" stroke="#FF5A5F" strokeWidth="12" strokeLinecap="round" />
      <circle cx="150" cy="84" r="10" fill="#FF5A5F" />
    </g>
    <circle cx="150" cy="170" r="16" fill="#FFB627" />
  </svg>
);

// "Again and again" circular-arrow icon.
const RepeatIcon: React.FC<{x: number; y: number; size?: number; pop?: number}> = ({x, y, size = 190, pop = 1}) => (
  <svg width={size} height={size} viewBox="-60 -60 120 120" style={{position: 'absolute', left: x, top: y, transform: `scale(${pop})`}}>
    <circle r="56" fill="#fff" />
    <path d="M34 -10 A36 36 0 1 0 36 8" stroke="#FF9A5C" strokeWidth="12" fill="none" strokeLinecap="round" />
    <path d="M36 -22 L58 8 L22 12 Z" fill="#FF9A5C" />
  </svg>
);

// ---------- scenes ----------
// S1 [0, 3.0] Title + hadith speech bubble
const S1: React.FC = () => {
  const p = usePop(4, 9);
  const slide = usePop(10, 10);
  const card = usePop(6, 12);
  const quote = usePop(s(2.0), 10);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#14104A, #4A2E8C 55%, #C86B98 85%, #FFB35C)'}}>
      <Stars />
      <Moon x={780} y={60} />
      <Hills c1="#3C2A8A" c2="#2A1E66" y={1560} />
      <div dir="rtl" style={{position: 'absolute', top: 420, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 110, color: '#FFE27A', opacity: p, transform: `scale(${p})`, lineHeight: 1.6}}>
        {TITLE_AR}
      </div>
      <Big top={620} size={120} color="#fff" style={{opacity: slide, transform: `scale(${0.7 + 0.3 * slide})`, textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
        Surah
        <br />
        {TITLE_EN}
      </Big>
      <div style={{position: 'absolute', left: 90, top: 950, width: 900, padding: '36px 40px 44px', background: '#fff', borderRadius: 60, transform: `scale(${card})`, boxShadow: '0 14px 0 rgba(0,0,0,0.12)', textAlign: 'center', boxSizing: 'border-box'}}>
        <div style={{fontFamily: EN, fontSize: 48, color: '#7A6A9A', fontWeight: 500}}>The Prophet <ArGlyph>ﷺ</ArGlyph> said:</div>
        <div style={{fontFamily: EN, fontSize: 64, color: '#3B2A63', fontWeight: 700, marginTop: 10, lineHeight: 1.15, opacity: quote}}>“Whoever reads…”</div>
        <svg width="80" height="60" style={{position: 'absolute', bottom: -50, left: 410}}>
          <path d="M0 0 L80 0 L30 55Z" fill="#fff" />
        </svg>
      </div>
      <Sparkle x={120} y={420} size={70} delay={0} />
      <Sparkle x={880} y={720} size={60} delay={20} />
      <Caption text={<>The Prophet <ArGlyph>ﷺ</ArGlyph> said: “Whoever reads…</>} at={s(0.2)} />
    </AbsoluteFill>
  );
};

// S2 [3.0, 5.4] Golden burst: A1 + big "10×" + 10 filling circles
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 3.0;
  const tenF = s(4.2 - SCENE); // "10 times"
  const p = usePop(tenF, 8);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFF3B0, #FFC857 55%, #FF9A5C)'}}>
      <SunRays cx={540} cy={860} opacity={0.25} />
      <Arabic text={A1} size={110} top={300} color="#7A3B10" />
      <Big top={500} size={300} color="#7A3B10" style={{lineHeight: 1, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, textShadow: '0 16px 0 rgba(255,255,255,0.7)'}}>
        10×
      </Big>
      {Array.from({length: 10}).map((_, i) => {
        const lit = interpolate(f, [tenF + i * 3, tenF + i * 3 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
        return (
          <div key={i} style={{position: 'absolute', left: 78 + i * 96, top: 930, width: 60, height: 60, borderRadius: '50%', border: '5px solid rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.35)', boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', inset: 3, borderRadius: '50%', background: '#FFD23F', boxShadow: '0 0 18px rgba(255,210,63,0.9)', transform: `scale(${lit})`}} />
          </div>
        );
      })}
      <Sparkle x={150} y={640} size={70} delay={5} color="#fff" />
      <Sparkle x={860} y={760} size={60} delay={25} color="#fff" />
      <Caption text="“…Qul huwa Allahu ahad, 10 times,”" at={tenF} />
    </AbsoluteFill>
  );
};

// S3 [5.4, 8.3] Sky blue: a home in Jannah builds up
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 5.4;
  const txt = usePop(s(7.6 - SCENE)); // "Jannah"
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8FD8FF, #DDF4FF)'}}>
      <Sun x={800} y={40} />
      <Cloud x={40} y={90} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <House x={220} y={585} w={640} />
      <FlowerHead x={110} y={1120} size={110} />
      <FlowerHead x={880} y={1130} size={110} />
      {f > 44 && [[240, 700], [790, 720], [160, 950], [860, 980]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} size={60} delay={i * 8} />)}
      <Big top={1220} size={76} color="#3B2A63" style={{opacity: txt}}>
        A home in Jannah!
      </Big>
      <Caption text="“…Allah will build them a home in Jannah.”" at={4} />
    </AbsoluteFill>
  );
};

// S4 [8.3, 13.4] Lavender: child reading + 10-circle counter lighting up
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 8.3;
  const head = usePop(4);
  const cntStart = s(11.2 - SCENE); // counter lights start on "10 times"
  const capSwitch = cntStart;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #E3D7FF, #C7B8FF 60%, #B09BEF)'}}>
      <Cloud x={720} y={80} />
      <Hills c1="#9E8BE8" c2="#7A66C8" y={1560} />
      <Big top={300} size={90} color="#3B2A63" style={{opacity: head}}>
        SubhanAllah!
      </Big>
      {[0, 1].map((row) =>
        Array.from({length: 5}).map((_, c) => {
          const i = row * 5 + c;
          const litF = cntStart + i * 6;
          const lit = interpolate(f, [litF, litF + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const plusO = interpolate(f, [litF, litF + 5, litF + 18], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const x = 348 + c * 96;
          const y = 545 + row * 115;
          return (
            <div key={i}>
              <div style={{position: 'absolute', left: x, top: y, width: 68, height: 68, borderRadius: '50%', border: '5px solid #fff', background: 'rgba(255,255,255,0.35)', boxSizing: 'border-box'}}>
                <div style={{position: 'absolute', inset: 3, borderRadius: '50%', background: '#FFD23F', boxShadow: '0 0 20px rgba(255,210,63,0.9)', transform: `scale(${lit})`}} />
              </div>
              <div style={{position: 'absolute', left: x - 10, top: y - 54, width: 88, textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 40, color: '#E8A820', opacity: plusO, textShadow: '0 2px 0 #fff'}}>+1</div>
            </div>
          );
        })
      )}
      <Child x={390} y={760} size={300} />
      <Book x={440} y={1030} w={200} />
      <Show on={f < capSwitch}>
        <Caption text="SubhanAllah, what a reward for this surah!" at={4} />
      </Show>
      <Show on={f >= capSwitch}>
        <Caption text="…and you read it just 10 times!" at={capSwitch} />
      </Show>
    </AbsoluteFill>
  );
};

// S5 [13.4, 18.7] Warm day: "not just once" → "only 2 minutes" stopwatch
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 13.4;
  const phaseB = s(16.4 - SCENE); // 90
  const capSwitch = s(16.5 - SCENE); // 93
  const head1 = usePop(4);
  const head2 = usePop(phaseB);
  const ic1 = usePop(s(13.6 - SCENE));
  const ic2 = usePop(s(14.2 - SCENE));
  const ic3 = usePop(s(14.8 - SCENE));
  const watch = usePop(phaseB, 9);
  const angle = interpolate(f, [capSwitch, s(18.6 - SCENE)], [0, 90], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#FFE9C2, #FFC98A 60%, #FFB08A)'}}>
      <Sun x={800} y={40} />
      <Cloud x={40} y={90} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <Show on={f < phaseB}>
        <Big top={300} size={80} color="#7A3B10" style={{opacity: head1}}>
          Not just once a day!
        </Big>
      </Show>
      <Show on={f >= phaseB}>
        <Big top={300} size={90} color="#7A3B10" style={{opacity: head2}}>
          Only 2 minutes!
        </Big>
      </Show>
      <Show on={f < phaseB}>
        <RepeatIcon x={145} y={750} pop={ic1} />
        <RepeatIcon x={445} y={800} pop={ic2} />
        <RepeatIcon x={745} y={750} pop={ic3} />
      </Show>
      <Show on={f >= phaseB}>
        <Stopwatch x={280} y={556} w={520} angle={angle} pop={watch} />
      </Show>
      <Show on={f < capSwitch}>
        <Caption text="You can read it more than once a day!" at={4} />
      </Show>
      <Show on={f >= capSwitch}>
        <Caption text="It only takes a couple of minutes!" at={capSwitch} />
      </Show>
    </AbsoluteFill>
  );
};

// S6 [18.7, 21.0] Dusk purple: golden palace pops on "palace"
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 18.7;
  const palF = s(20.4 - SCENE); // 51
  const pop = usePop(palF, 9);
  const txt = usePop(palF);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2A1E4E, #4A3678 60%, #6B4FA0)'}}>
      <Stars count={30} />
      <Moon x={780} y={60} />
      <Hills c1="#33245E" c2="#241845" y={1560} />
      <div style={{position: 'absolute', left: 140, top: 700, width: 800, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,90,0.35), transparent 70%)'}} />
      {f < palF + 10 &&
        [[180, 240, 0], [620, 300, 8], [860, 200, 16], [320, 420, 24], [700, 470, 32], [500, 200, 40]].map(([x, y0, d], i) => {
          const t = f - d;
          if (t < 0) return null;
          const y = 1150 - ((t * 4 + i * 90) % 620);
          const o = interpolate(f, [palF - 6, palF + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <div key={i} style={{position: 'absolute', left: x, top: Math.min(y, y0 + 900), width: 56, height: 40, borderRadius: 8, background: '#FFD23F', opacity: o * 0.9, transform: `rotate(${t * 2}deg)`, boxShadow: '0 0 16px rgba(255,210,63,0.7)'}} />;
        })}
      <Palace x={260} y={630} w={560} pop={pop} />
      {f > palF + 6 && [[180, 620], [850, 640], [120, 1050], [900, 1080], [520, 560]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} size={70} delay={i * 6} />)}
      <Big top={1220} size={76} color="#fff" style={{opacity: txt, textShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>
        A palace for you!
      </Big>
      <Caption text={<>…and Allah <ArGlyph>ﷻ</ArGlyph> builds you a palace in Jannah!</>} at={4} />
    </AbsoluteFill>
  );
};

// S7 [21.0, 24.75] Mint: "20× 30× 40×" + grid of little palaces
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const SCENE = 21.0;
  const t20 = s(22.0 - SCENE); // 30
  const t30 = s(22.8 - SCENE); // 54
  const t40 = s(23.4 - SCENE); // 72
  const p20 = usePop(t20, 9);
  const p30 = usePop(t30, 9);
  const p40 = usePop(t40, 9);
  const popAt = (i: number) => spring({frame: f - i, fps, config: {damping: 10, mass: 0.7}});
  // 16 grid slots: 4 cols x 4 rows, palace 0 pops early and shrinks into place as the grid fills
  const slots: {x: number; y: number; delay: number; big?: boolean}[] = [];
  for (let i = 0; i < 16; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const delay = i === 0 ? 6 : i < 6 ? t20 + (i - 1) * 2 : i < 10 ? t30 + (i - 6) : t40 + (i - 10);
    slots.push({x: 115 + col * 235, y: 560 + row * 155, delay, big: i === 0});
  }
  const shrink = interpolate(f, [t20 - 4, t20 + 8], [1.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #B8F1D8, #7FD8BE 55%, #4FB89E)'}}>
      <Hills c1="#6BCB77" c2="#4FA95B" y={1560} />
      {slots.map((sl, i) => {
        const pp = popAt(sl.delay);
        return <Palace key={i} x={sl.x} y={sl.y} w={160} pop={pp * (sl.big ? shrink : 1)} />;
      })}
      <Show on={f >= t20 && f < t30}>
        <Big top={300} size={150} color="#14503F" style={{transform: `scale(${p20})`, textShadow: '0 8px 0 rgba(255,255,255,0.5)'}}>
          20×
        </Big>
      </Show>
      <Show on={f >= t30 && f < t40}>
        <Big top={300} size={150} color="#14503F" style={{transform: `scale(${p30})`, textShadow: '0 8px 0 rgba(255,255,255,0.5)'}}>
          30×
        </Big>
      </Show>
      <Show on={f >= t40}>
        <Big top={300} size={150} color="#14503F" style={{transform: `scale(${p40})`, textShadow: '0 8px 0 rgba(255,255,255,0.5)'}}>
          40×
        </Big>
      </Show>
      <Caption text="So what if you read it 20, 30 or 40 times a day?" at={4} />
    </AbsoluteFill>
  );
};

// S8 [24.75, 31.6] Starry indigo: "Let's read it together!" + Bismillah
const S8: React.FC = () => {
  const SCENE = 24.75;
  const head = usePop(0, 9);
  const bism = s(25.0 - SCENE); // 8
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#151040, #2E2068 55%, #4A3590)'}}>
      <Stars count={50} />
      <Moon x={780} y={60} />
      <Arabic text={BISM} size={96} top={300} color="#FFE27A" at={bism} />
      <Big top={560} size={76} color="#fff" style={{transform: `scale(${0.7 + 0.3 * head})`, opacity: head, textShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>
        Let's read it together!
      </Big>
      <div style={{position: 'absolute', left: 190, top: 700, width: 700, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,122,0.22), transparent 70%)'}} />
      <Child x={390} y={840} size={300} />
      <Book x={430} y={1080} w={220} />
      <Sparkle x={160} y={780} size={60} delay={10} />
      <Sparkle x={860} y={900} size={60} delay={30} />
      <Caption text="In the name of Allah, the Most Kind, the Most Merciful." at={bism} />
    </AbsoluteFill>
  );
};

// S9 [31.6, 34.5] Golden burst rays: A1 + big "1"
const S9: React.FC = () => {
  const p = usePop(4, 8);
  const txt = usePop(30);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFB35C, #FF7A59 55%, #E2557A)'}}>
      <SunRays cx={540} cy={860} opacity={0.25} />
      <Arabic text={A1} size={120} top={300} color="#fff" />
      <Big top={540} size={520} color="#FFF4C2" style={{lineHeight: 1, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, textShadow: '0 20px 0 #C9463D'}}>
        1
      </Big>
      <Big top={1180} size={80} color="#fff" style={{opacity: txt}}>
        Allah is the ONE
      </Big>
      <Sparkle x={200} y={700} size={80} delay={5} color="#fff" />
      <Sparkle x={800} y={820} size={70} delay={25} color="#fff" />
      <Caption text="Say: He is Allah, the One." at={4} />
    </AbsoluteFill>
  );
};

// S10 [34.5, 37.3] Sky blue: A2 + rain cloud + flowers
const S10: React.FC = () => {
  const txt = usePop(18); // s(0.6)
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8FD8FF, #DDF4FF)'}}>
      <Sun x={800} y={40} />
      <Cloud x={40} y={90} />
      <Cloud x={40} y={780} rain delay={10} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <Arabic text={A2} size={130} top={300} color="#3B2A63" />
      <Big top={560} size={68} color="#3B2A63" style={{opacity: txt}}>
        Everyone needs Allah.
        <br />
        Allah needs no one.
      </Big>
      <Flower x={80} color="#FF7AA2" delay={2} bottom={530} />
      <Flower x={250} color="#B07CFF" delay={10} bottom={545} />
      <Flower x={720} color="#FF9F43" delay={18} bottom={535} />
      <Flower x={880} color="#FF6B6B" delay={26} bottom={550} />
      <Bird delay={15} y={800} />
      <Caption text="Allah: everyone needs Him, He needs no one." at={4} />
    </AbsoluteFill>
  );
};

// S11 [37.3, 40.45] Lavender→pink: two cards, lam yalid / wa lam yulad
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 37.3;
  const second = s(38.6 - SCENE); // 39
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #C7B8FF, #FFC6E0)'}}>
      <Stars count={26} color="#ffffff" />
      <Card top={260} delay={4} arabic="لَمْ يَلِدْ" title="He has no children" kind="down" />
      <Card top={800} delay={second} arabic="وَلَمْ يُولَدْ" title="He has no parents" kind="up" />
      <Show on={f < second}>
        <Caption text="He has no children," at={4} />
      </Show>
      <Show on={f >= second}>
        <Caption text="…and He was not born." at={second} />
      </Show>
    </AbsoluteFill>
  );
};

// S12 [40.45, 44.70] Deep night: A4 + icon grid shrinks, "One & Unique" pops
const S12: React.FC = () => {
  const f = useCurrentFrame();
  const SCENE = 40.45;
  const big = s(42.6 - SCENE); // 65
  const shrink = interpolate(f, [big - 5, big + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const head = usePop(18);
  const p = usePop(big + 5, 9);
  const p0 = usePop(10, 9);
  const p1 = usePop(20, 9);
  const p2 = usePop(30, 9);
  const p3 = usePop(40, 9);
  const p4 = usePop(50, 9);
  const pops = [p0, p1, p2, p3, p4];
  const items = [
    <Sun key="sun" x={0} y={0} size={200} />,
    <svg key="moon" width={200} height={200} viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#F2F0E6" /><circle cx="38" cy="40" r="7" fill="#D9D5C5" /><circle cx="62" cy="62" r="9" fill="#D9D5C5" /></svg>,
    <svg key="mtn" width={200} height={200} viewBox="0 0 110 100"><path d="M5 95 L45 20 L85 95Z" fill="#7E8CA8" /><path d="M45 20 L35 40 L55 40Z" fill="#fff" /><path d="M50 95 L78 45 L105 95Z" fill="#5E6C88" /></svg>,
    <svg key="sea" width={200} height={200} viewBox="0 0 110 100"><path d="M5 50 Q 20 35 35 50 T 65 50 T 95 50 T 110 50 V95 H5Z" fill="#3FA7E8" /><path d="M5 70 Q 20 58 35 70 T 65 70 T 95 70 T 110 70" stroke="#BDE6FF" strokeWidth="5" fill="none" /></svg>,
    <svg key="star" width={200} height={200} viewBox="-50 -50 100 100"><path d="M0 -42 L12 -12 L42 -10 L18 10 L26 40 L0 23 L-26 40 L-18 10 L-42 -10 L-12 -12Z" fill="#FFD23F" /></svg>,
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #3A2A8C 60%, #6D4BC3)'}}>
      <Stars count={50} />
      <Arabic text={A4} size={84} top={300} color="#FFE27A" />
      <Big top={560} size={76} color="#fff" style={{opacity: head * shrink}}>
        Nothing is like Him!
      </Big>
      <div style={{position: 'absolute', top: 720, left: 100, width: 880, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, opacity: shrink, transform: `scale(${0.6 + 0.4 * shrink})`}}>
        {items.map((it, i) => (
          <div key={i} style={{position: 'relative', width: 240, height: 240, background: 'rgba(255,255,255,0.12)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pops[i]})`}}>
            <div style={{position: 'relative', width: 200, height: 200}}>{it}</div>
          </div>
        ))}
      </div>
      <Big top={680} size={190} color="#FFE27A" style={{transform: `scale(${p})`, textShadow: '0 0 60px rgba(255,226,122,0.7), 0 12px 0 #2A1E66'}}>
        One &amp;
        <br />
        Unique
      </Big>
      {f > big && [[120, 600], [860, 620], [160, 1150], [840, 1180], [500, 1250], [60, 900], [960, 920]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} size={70} delay={i * 7} />)}
      <Caption text="And nothing is like Him." at={4} />
    </AbsoluteFill>
  );
};


const Petal: React.FC<{i: number}> = ({i}) => {
  const f = useCurrentFrame();
  const x = (i * 173) % W;
  const y = ((f * (2 + (i % 3)) + i * 140) % 2100) - 150;
  const colors = ['#E58BB0', '#F2C14E', '#C8A2D8'];
  return <div style={{position: 'absolute', left: x + Math.sin((f + i * 20) / 20) * 30, top: y, width: 26, height: 38, borderRadius: '50% 50% 50% 0', background: colors[i % 3], opacity: 0.55, transform: `rotate(${f * 3 + i * 40}deg)`}} />;
};

const Outro: React.FC = () => {
  const p = usePop(0, 10);
  const t = usePop(18, 14);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#FFF7EE, #FBE3EC)'}}>
      {Array.from({length: 16}).map((_, i) => <Petal key={i} i={i} />)}
      <div style={{position: 'absolute', top: 560, left: 90, width: 900, height: 470, background: '#fff', borderRadius: 60, boxShadow: '0 20px 60px rgba(59,31,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`}}>
        <Img src={staticFile('logo.png')} style={{width: 800, height: 'auto'}} />
      </div>
      <Big top={1110} size={60} color={PLUM} style={{opacity: t, transform: `translateY(${(1 - t) * 40}px)`}}>
        Follow for more
        <br />
        <span style={{color: '#D4609A'}}>stories for little hearts</span>
      </Big>
    </AbsoluteFill>
  );
};

// Last story scene ends at AUDIO_DUR; Outro lasts 3.7s.
const scenes: [number, number, React.FC][] = [
  [0, 3.0, S1],
  [3.0, 5.4, S2],
  [5.4, 8.3, S3],
  [8.3, 13.4, S4],
  [13.4, 18.7, S5],
  [18.7, 21.0, S6],
  [21.0, 24.75, S7],
  [24.75, 31.6, S8],
  [31.6, 34.5, S9],
  [34.5, 37.3, S10],
  [37.3, 40.45, S11],
  [40.45, AUDIO_DUR, S12],
  [AUDIO_DUR, AUDIO_DUR + 3.7, Outro],
];

export const Ikhlas10Vertical: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('700 100px Amiri', 'الله'),
      document.fonts.load('700 100px Fredoka'),
      document.fonts.load('600 100px Fredoka'),
      document.fonts.load('500 100px Fredoka'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('ikhlas10/voice.mp3')} />
      {scenes.map(([a, b, C], i) => {
        const from = s(a);
        const dur = s(b) - from + (i < scenes.length - 1 ? 6 : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneFade dur={i === scenes.length - 1 ? dur + 30 : dur}>
              <C />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
