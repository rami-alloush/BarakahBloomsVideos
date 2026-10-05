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
export const TOTAL_V_FALAQ = s(41.4);
const W = 1080;

const EN = 'Fredoka, sans-serif';
const AR = 'Amiri, serif';
const PLUM = '#3B1F4A';

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

const Caption: React.FC<{text: string; at?: number}> = ({text, at = 0}) => {
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

// ---------- little drawings ----------
const Moon: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <svg width={220} height={220} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y + Math.sin(f / 20) * 8}}>
      <defs>
        <mask id="mvF">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="64" cy="40" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="48" cy="50" r="38" fill="#FFE27A" mask="url(#mvF)" />
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

const Cloud: React.FC<{x: number; y: number}> = ({x, y}) => {
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

// ---------- scenes ----------
// S1 [0, 1.89] Title
const S1: React.FC = () => {
  const p = usePop(4, 9);
  const sub = usePop(22, 12);
  const slide = usePop(12, 10);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#14104A, #4A2E8C 55%, #C86B98 85%, #FFB35C)'}}>
      <Stars />
      <Moon x={760} y={60} />
      <Hills c1="#3C2A8A" c2="#2A1E66" y={1560} />
      <div dir="rtl" style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 120, color: '#FFE27A', opacity: p, transform: `scale(${p})`, lineHeight: 1.6}}>
        سُورَةُ الْفَلَق
      </div>
      <Big top={840} size={120} color="#fff" style={{transform: `translateY(${(1 - slide) * 600}px)`, textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
        Surah
        <br />
        Al-Falaq
      </Big>
      <Big top={1140} size={64} color="#FFE0B8" style={{opacity: sub}}>
        The Daybreak
      </Big>
      <Sparkle x={120} y={420} size={70} delay={0} />
      <Sparkle x={880} y={720} size={60} delay={20} />
    </AbsoluteFill>
  );
};

// S2 [1.89, 8.24] Dawn — night fades to sunrise, sun rises
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const riseStart = s(1.7);
  const riseEnd = s(7.4 - 1.95);
  const dawn = interpolate(f, [riseStart, riseEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const sunY = interpolate(f, [riseStart, riseEnd], [1450, 620], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const txt = usePop(s(6.0 - 1.95), 10);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #4A2E8C)'}}>
      {/* dawn overlay */}
      <AbsoluteFill style={{background: 'linear-gradient(#2E2068, #E86AA0 55%, #FFB35C 80%, #FFE27A)', opacity: dawn}} />
      <Stars opacity={1 - dawn} />
      {/* rising sun (no face) */}
      <svg width={420} height={420} viewBox="-60 -60 120 120" style={{position: 'absolute', left: 330, top: sunY}}>
        <circle r="52" fill="#FFD23F" />
        <circle r="52" fill="none" stroke="#FFB627" strokeWidth="6" opacity="0.6" />
      </svg>
      <Hills c1="#5B4A9E" c2="#3C2A8A" y={1560} />
      <Arabic text="قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ" size={92} top={300} color="#FFF0C8" />
      <Big top={1140} size={86} color="#fff" style={{opacity: txt, transform: `scale(${0.7 + 0.3 * txt})`, textShadow: '0 8px 0 rgba(0,0,0,0.2)'}}>
        The Lord
        <br />
        of the Dawn
      </Big>
      <Caption text="Say: I seek protection with the Lord of the Dawn." at={s(3.65 - 1.95)} />
    </AbsoluteFill>
  );
};

// S3 [8.0, 18.0] Protect from every evil — dome over child, blobs bounce off
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

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const dome = usePop(4, 9);
  const pulse = 1 + Math.sin(f / 14) * 0.02;
  const txt = usePop(s(0.3));
  const capSwitch = s(15.2 - 8.0);
  const cx = 540;
  const cy = 960; // dome center
  const blobs: [number, number][] = [[-80, 700], [1100, 640], [-80, 1080], [1120, 1120], [200, 520], [900, 500]];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#FFE9C2, #FFC98A 60%, #FFB08A)'}}>
      <Sun x={800} y={40} />
      <Cloud x={40} y={90} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <Arabic text="مِن شَرِّ مَا خَلَقَ" size={92} top={300} color="#7A3B10" at={s(14.25 - 8.0)} />
      {/* golden dome */}
      <div style={{position: 'absolute', left: cx - 260, top: cy - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,122,0.3), rgba(255,190,80,0.5) 65%, rgba(255,226,122,0.12) 78%, transparent 80%)', border: '8px solid rgba(255,226,122,0.85)', boxShadow: '0 0 80px rgba(255,210,90,0.6), inset 0 0 60px rgba(255,240,180,0.45)', transform: `scale(${dome * pulse})`, boxSizing: 'border-box'}} />
      <Child x={390} y={840} size={300} />
      {blobs.map(([bx, by], i) => {
        // aim each blob at the dome edge
        const ang = Math.atan2(by + 44 - cy, bx + 44 - cx);
        const tx = cx + Math.cos(ang) * 265 - 44;
        const ty = cy + Math.sin(ang) * 265 - 44;
        return <BadBlob key={i} fromX={bx} fromY={by} toX={tx} toY={ty} delay={10 + i * 40} />;
      })}
      <Big top={1240} size={68} color="#7A3B10" style={{opacity: txt, textShadow: '0 4px 0 rgba(255,255,255,0.4)'}}>
        Protect me from
        <br />
        every evil
      </Big>
      <div style={{opacity: f < capSwitch ? 1 : 0, visibility: f < capSwitch ? 'visible' : 'hidden'}}>
        <Caption text="We ask Allah to protect us from every evil." at={s(0.3)} />
      </div>
      <div style={{opacity: f < capSwitch ? 0 : 1, visibility: f < capSwitch ? 'hidden' : 'visible'}}>
        <Caption text="…from all the evil that He has created." at={capSwitch} />
      </div>
    </AbsoluteFill>
  );
};

// S4 [18.40, 26.92] Darkest night — child asleep, safe under glow
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const glow = usePop(8, 12);
  const txt = usePop(s(20.25 - 18.0));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0D0A2E, #221A55 55%, #3A2A7A)'}}>
      <Stars count={60} />
      <Moon x={780} y={60} />
      <Hills c1="#241845" c2="#181040" y={1560} />
      <Arabic text="وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" size={80} top={300} color="#C9D4FF" />
      {/* bed: mattress + pillow (blanket drawn after the head so it tucks under the chin) */}
      <svg width={760} height={360} viewBox="0 0 200 95" style={{position: 'absolute', left: 160, top: 880}}>
        <rect x="5" y="42" width="190" height="40" rx="14" fill="#5B4A9E" />
        <rect x="8" y="30" width="184" height="24" rx="12" fill="#8E7BD8" />
        <ellipse cx="42" cy="30" rx="26" ry="16" fill="#fff" />
      </svg>
      {/* soft protective glow */}
      <div style={{position: 'absolute', left: 240, top: 600, width: 600, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,122,0.30), rgba(255,226,122,0.1) 55%, transparent 75%)', transform: `scale(${glow})`}} />
      {/* child's head resting ON the pillow (asleep) */}
      <div style={{position: 'absolute', left: 265, top: 852, transform: 'rotate(-8deg)'}}>
        <svg width={200} height={170} viewBox="0 0 100 85">
          <circle cx="50" cy="40" r="32" fill="#FFD9B3" />
          <path d="M26 34 Q30 12 50 14 Q70 12 74 34 Q62 22 50 22 Q38 22 26 34Z" fill="#6B4A2B" />
          <path d="M36 40 Q42 45 48 40" stroke="#2E2A33" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M52 40 Q58 45 64 40" stroke="#2E2A33" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="48" r="4" fill="#FFB0A0" opacity="0.7" />
          <circle cx="66" cy="48" r="4" fill="#FFB0A0" opacity="0.7" />
          <path d="M44 52 Q50 57 56 52" stroke="#B0654A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      {/* blanket over the chin */}
      <svg width={760} height={360} viewBox="0 0 200 95" style={{position: 'absolute', left: 160, top: 880}}>
        <path d="M62 30 Q 110 12 158 26 L 186 34 L 186 58 L 62 58 Q 56 42 62 30Z" fill="#FF9FB2" />
        <path d="M62 30 Q 110 12 158 26" stroke="#FF7AA2" strokeWidth="4" fill="none" />
      </svg>
      {/* floating z's */}
      {[0, 1, 2].map((i) => {
        const t = (f * 1.5 + i * 40) % 160;
        return (
          <div key={i} style={{position: 'absolute', left: 640 + i * 40 + Math.sin((f + i * 9) / 12) * 14, top: 860 - t * 1.6, fontFamily: EN, fontWeight: 700, fontSize: 54 - i * 8, color: '#C9D4FF', opacity: Math.max(0, 1 - t / 160)}}>
            z
          </div>
        );
      })}
      <Big top={1240} size={76} color="#fff" style={{opacity: txt, textShadow: '0 6px 0 rgba(0,0,0,0.3)'}}>
        Safe in the
        <br />
        darkest night
      </Big>
      <Caption text="…and from the evil that comes in the darkest night." at={s(20.25 - 18.0)} />
    </AbsoluteFill>
  );
};

// S5 [26.92, 29.99] Knots — rope unties knot by knot
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const untieStart = s(26.8 - 24.15);
  const untieEnd = s(29.0 - 24.15);
  const txt = usePop(untieStart);
  const ropeY = 900;
  // knots untie evenly between the untie window, swaying gently before
  const knotAt = [untieStart, untieStart + Math.round((untieEnd - untieStart) / 3), untieStart + Math.round((2 * (untieEnd - untieStart)) / 3)];
  const knotScales = knotAt.map((d) => interpolate(f, [d, d + 14], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.back(1.5))}));
  const done = knotScales.reduce((a, b) => a + (1 - b), 0) / 3; // 0..1
  const amp = (16 + Math.sin(f / 10) * 8) * (1 - done); // gentle sway, straightens as knots untie
  const knotX = [330, 540, 750];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #E3D7FF, #C7B8FF 60%, #B09BEF)'}}>
      <Cloud x={720} y={80} />
      <Hills c1="#9E8BE8" c2="#7A66C8" y={1560} />
      <Arabic text="وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ" size={78} top={300} color="#4A3570" />
      <svg width={W} height={200} style={{position: 'absolute', top: ropeY - 80 + Math.sin(f / 12) * 6}}>
        {/* rope */}
        <path d={`M60 100 Q ${270} ${100 - amp} ${540} 100 T ${1020} 100`} stroke="#B07C4A" strokeWidth="16" fill="none" strokeLinecap="round" />
        {/* knots */}
        {knotX.map((kx, i) => (
          <g key={i} transform={`translate(${kx} 100) scale(${knotScales[i]})`}>
            <circle r="34" fill="#B07C4A" />
            <path d="M-22 -10 Q 0 10 22 -10 M-22 10 Q 0 -10 22 10" stroke="#8A5A2B" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {/* sparkle burst as each knot unties */}
      {knotX.map((kx, i) =>
        f > knotAt[i] + 6 ? <Sparkle key={i} x={kx - 40} y={ropeY - 40} size={90} delay={i * 11} /> : null
      )}
      <Big top={1180} size={72} color="#3B2A63" style={{opacity: txt}}>
        Allah protects us
        <br />
        from magic
      </Big>
      <Caption text="…and from the evil of those who blow on knots." at={untieStart} />
    </AbsoluteFill>
  );
};

// S6 [29.99, 37.71] Envy — jealous green puff bounces off golden ring
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const ring = usePop(6, 10);
  const beat = 1 + Math.sin(f / 8) * 0.03;
  const en = s(31.95 - 29.6);
  const txt = usePop(en);
  const bounceAt = s(32.5 - 29.6);
  const puffIn = interpolate(f, [8, 30], [1150, 760], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.3))});
  const puffShrink = interpolate(f, [bounceAt + 10, bounceAt + 50], [1, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const puffFade = interpolate(f, [bounceAt + 10, bounceAt + 50], [1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const knockBack = interpolate(f, [bounceAt, bounceAt + 18], [0, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
  const puffX = Math.max(660, puffIn + knockBack + Math.sin(f / 15) * 10);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #B8F1D8, #7FD8BE 55%, #4FB89E)'}}>
      <Sun x={800} y={40} />
      <Hills c1="#6BCB77" c2="#4FA95B" y={1560} />
      <Arabic text="وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ" size={82} top={300} color="#1E5B4A" />
      {/* golden ring + child holding flower */}
      <div style={{position: 'absolute', left: 120, top: 640, width: 460, height: 460, borderRadius: '50%', border: '9px solid rgba(255,210,90,0.9)', boxShadow: '0 0 70px rgba(255,210,90,0.6), inset 0 0 60px rgba(255,210,90,0.3)', transform: `scale(${ring * beat})`, boxSizing: 'border-box'}} />
      <Child x={200} y={750} size={280} lookX={3} />
      <FlowerHead x={420} y={870} size={130} />
      {/* jealous green puff peeking from the right */}
      <div style={{position: 'absolute', left: puffX, top: 840, opacity: puffFade, transform: `scale(${f < bounceAt + 10 ? 1 : puffShrink})`}}>
        <div style={{position: 'relative', width: 280, height: 250}}>
          <Puff x={0} y={0} size={280} color="#5E9E6E" />
          {/* little steam puff */}
          <svg width={60} height={40} viewBox="0 0 40 26" style={{position: 'absolute', left: 200, top: -20}}>
            <circle cx="12" cy="16" r="8" fill="#fff" opacity={0.5 + 0.4 * Math.sin(f / 6)} />
            <circle cx="26" cy="10" r="10" fill="#fff" opacity={0.4 + 0.4 * Math.sin(f / 6 + 2)} />
          </svg>
        </div>
      </div>
      {/* jealous squiggles bounce off the ring */}
      {f > bounceAt && (
        <>
          <Squiggle x={600} y={760} delay={bounceAt} flip color="#3E8A5A" />
          <Squiggle x={620} y={950} delay={bounceAt + 14} flip color="#3E8A5A" />
        </>
      )}
      <Big top={1240} size={76} color="#14503F" style={{opacity: txt}}>
        …and from jealousy
      </Big>
      <Caption text="…and from the evil of the jealous when they envy." at={en} />
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

const scenes: [number, number, React.FC][] = [
  [0, 1.95, S1],
  [1.95, 8.0, S2],
  [8.0, 18.0, S3],
  [18.0, 24.15, S4],
  [24.15, 29.6, S5],
  [29.6, 37.71, S6],
  [37.71, 41.4, Outro],
];

export const FalaqVertical: React.FC = () => {
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
      <Audio src={staticFile('falaq/voice.mp3')} />
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
