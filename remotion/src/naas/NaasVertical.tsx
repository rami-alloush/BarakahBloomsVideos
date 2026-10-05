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
export const TOTAL_V_NAAS = s(41.2);
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

const Stars: React.FC<{count?: number; color?: string}> = ({count = 40, color = '#fff'}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
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
        <mask id="mv">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="64" cy="40" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="48" cy="50" r="38" fill="#FFE27A" mask="url(#mv)" />
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
const Child: React.FC<{x: number; y: number; size?: number; lookX?: number}> = ({x, y, size = 300, lookX = 0}) => {
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
      {/* eyes (lookX shifts pupils) */}
      <circle cx={41 + lookX} cy="36" r="3.6" fill="#2E2A33" />
      <circle cx={59 + lookX} cy="36" r="3.6" fill="#2E2A33" />
      {/* cheeks + smile */}
      <circle cx="34" cy="44" r="4" fill="#FFB0A0" opacity="0.7" />
      <circle cx="66" cy="44" r="4" fill="#FFB0A0" opacity="0.7" />
      <path d="M43 47 Q50 53 57 47" stroke="#B0654A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// The sneaky whisperer: a cute grey-purple puff with sly eyes. Not scary.
const Puff: React.FC<{x: number; y: number; size?: number; wiggle?: boolean}> = ({x, y, size = 200, wiggle = true}) => {
  const f = useCurrentFrame();
  const wig = wiggle ? Math.sin(f / 6) * 6 : 0;
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" style={{position: 'absolute', left: x, top: y + Math.sin(f / 10) * 12, transform: `rotate(${wig}deg)`}}>
      {/* fluffy body = cluster of circles */}
      <g fill="#8D7BB8">
        <circle cx="30" cy="50" r="22" />
        <circle cx="55" cy="38" r="26" />
        <circle cx="76" cy="55" r="18" />
        <circle cx="48" cy="62" r="24" />
      </g>
      <g fill="#6E5A9E">
        <circle cx="50" cy="66" r="18" opacity="0.5" />
      </g>
      {/* sly half-lidded eyes */}
      <ellipse cx="42" cy="48" rx="8" ry="6" fill="#fff" />
      <ellipse cx="64" cy="48" rx="8" ry="6" fill="#fff" />
      <rect x="33" y="42" width="18" height="5" rx="2.5" fill="#8D7BB8" transform="rotate(-6 42 44)" />
      <rect x="55" y="42" width="18" height="5" rx="2.5" fill="#8D7BB8" transform="rotate(6 64 44)" />
      <circle cx="46" cy="50" r="2.6" fill="#2E2A33" />
      <circle cx="68" cy="50" r="2.6" fill="#2E2A33" />
      {/* smirk */}
      <path d="M48 62 Q56 66 62 61" stroke="#4A3A6E" strokeWidth="3" fill="none" strokeLinecap="round" />
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

// ---------- scenes ----------
// S1 [0, 2.32] Title — night sky
const S1: React.FC = () => {
  const p = usePop(4, 9);
  const sub = usePop(30, 12);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #5B3BA8 70%, #8E6BD6)'}}>
      <Stars />
      <Moon x={760} y={230} />
      <Hills c1="#3C2A8A" c2="#2A1E66" y={1560} />
      <div dir="rtl" style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 120, color: '#FFE27A', opacity: p, transform: `scale(${p})`, lineHeight: 1.6}}>
        سُورَةُ النَّاس
      </div>
      <Big top={840} size={120} color="#fff" style={{transform: `translateY(${(1 - usePop(14, 10)) * 600}px)`, textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
        Surah
        <br />
        An-Naas
      </Big>
      <Big top={1140} size={64} color="#E9D9FF" style={{opacity: sub}}>
        The People
      </Big>
      <Sparkle x={120} y={420} size={70} delay={0} />
      <Sparkle x={880} y={720} size={60} delay={20} />
      <Sparkle x={150} y={1100} size={50} delay={35} />
    </AbsoluteFill>
  );
};

// S2 [2.32, 6.72] Protection — warm sky, golden dome over child
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const dome = usePop(6, 9);
  const pulse = 1 + Math.sin(f / 14) * 0.02;
  const en = s(3.4 - 1.95);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#FFD98E, #FFB35C 60%, #FF9A76)'}}>
      <Sun x={800} y={40} />
      <Cloud x={40} y={90} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <Arabic text="قُلْ أَعُوذُ بِرَبِّ النَّاسِ" size={96} top={300} color="#7A3B10" />
      {/* glowing shield bubble over the child */}
      <div style={{position: 'absolute', left: 540 - 260, top: 700, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,122,0.35), rgba(255,190,80,0.55) 65%, rgba(255,226,122,0.15) 78%, transparent 80%)', border: '8px solid rgba(255,226,122,0.8)', boxShadow: '0 0 80px rgba(255,210,90,0.65), inset 0 0 60px rgba(255,240,180,0.5)', transform: `scale(${dome * pulse})`, boxSizing: 'border-box'}} />
      <Child x={390} y={800} size={300} />
      <Big top={1245} size={70} color="#7A3B10" style={{opacity: usePop(en), textShadow: '0 4px 0 rgba(255,255,255,0.4)'}}>
        I seek protection
        <br />
        with Allah
      </Big>
      <Caption text="Say: I seek protection with Allah, Subhanahu wa Ta'ala." at={en} />
    </AbsoluteFill>
  );
};

// S3 [6.72, 13.28] Three names — three stacked cards
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

const S3: React.FC = () => {
  const f = useCurrentFrame();
  const card2 = s(7.7 - 6.5);
  const card3 = s(10.1 - 6.5);
  const cap2 = s(9.2 - 6.5);
  const cap3 = s(11.5 - 6.5);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #C7B8FF, #9E8BE8 60%, #7A66C8)'}}>
      <Stars count={26} color="#ffffff" />
      <NameCard top={250} delay={s(6.6 - 6.5)} arabic="رَبِّ النَّاسِ" title="Lord of the people" icon={IconHandsHeart} />
      <NameCard top={640} delay={card2} arabic="مَلِكِ النَّاسِ" title="King of the people" icon={IconCrown} />
      <NameCard top={1030} delay={card3} arabic="إِلَٰهِ النَّاسِ" title="God of the people" icon={IconGlowStar} />
      <div style={{opacity: f < cap2 ? 1 : 0, visibility: f < cap2 ? 'visible' : 'hidden'}}>
        <Caption text="The Lord of the people," at={s(6.6 - 6.5)} />
      </div>
      <div style={{opacity: f >= cap2 && f < cap3 ? 1 : 0, visibility: f >= cap2 && f < cap3 ? 'visible' : 'hidden'}}>
        <Caption text="the King of the people," at={cap2} />
      </div>
      <div style={{opacity: f >= cap3 ? 1 : 0, visibility: f >= cap3 ? 'visible' : 'hidden'}}>
        <Caption text="the God of the people," at={cap3} />
      </div>
    </AbsoluteFill>
  );
};

// S4 [13.28, 19.28] The whisperer
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const en = s(15.1 - 13.8);
  const exitAt = s(18.4 - 13.8);
  // puff floats in from the left, wiggles, then zips off-screen right
  const px = interpolate(f, [0, 25], [-260, 360], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4))});
  const exit = interpolate(f, [exitAt, exitAt + 18], [0, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const shrink = interpolate(f, [exitAt - 8, exitAt + 10], [1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const puffX = f < exitAt ? px : 360 + exit;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#2A1E4E, #4A3678 60%, #6B4FA0)'}}>
      <Stars count={34} />
      <Hills c1="#33245E" c2="#241845" y={1560} />
      <Arabic text="مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ" size={92} top={300} color="#E9D9FF" />
      <Big top={560} size={80} color="#fff" style={{opacity: usePop(en)}}>
        The sneaky
        <br />
        whisperer
      </Big>
      <div style={{position: 'absolute', left: puffX, top: 880, transform: `scale(${shrink})`}}>
        <div style={{position: 'relative', width: 360, height: 330}}>
          <Puff x={0} y={0} size={360} />
        </div>
      </div>
      {f > 20 && f < exitAt + 6 && (
        <>
          <Squiggle x={700} y={930} delay={26} />
          <Squiggle x={720} y={1010} delay={40} />
          <Squiggle x={690} y={1080} delay={54} />
        </>
      )}
      <Big top={1240} size={56} color="#C9B8EA" style={{opacity: usePop(24), fontWeight: 600}}>
        psst… psst…
      </Big>
      <Caption text="…from the evil of the one who whispers and goes away." at={en} />
    </AbsoluteFill>
  );
};

// S5 [19.28, 25.26] Unmindful — puff sneaks up on distracted child
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const sneak = interpolate(f, [10, 70], [-300, 620], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#8FD8FF, #DDF4FF)'}}>
      <Sun x={800} y={40} size={190} />
      <Cloud x={40} y={90} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <Big top={300} size={80} color="#3B2A63" style={{opacity: usePop(s(19.5 - 19.3))}}>
        Ibn Abbas said…
      </Big>
      {/* distracted child looking up at a balloon */}
      <Balloon x={700} y={520} />
      <Child x={330} y={860} size={320} lookX={3} />
      {/* puff sneaks in from behind */}
      <Puff x={sneak} y={980} size={230} />
      {sneak > 400 && <Squiggle x={640} y={920} delay={0} flip />}
      {sneak > 400 && <Squiggle x={620} y={1000} delay={14} flip />}
      <Caption text="Ibn Abbas said: Shaytan whispers when a person forgets Allah." at={s(19.5 - 19.3)} />
    </AbsoluteFill>
  );
};

// S6 [25.26, 28.04] Remember Allah — bright burst, puff POOFS
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const poofAt = s(27.35 - 25.2);
  const puffScale = interpolate(f, [poofAt, poofAt + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const allah = usePop(4, 8);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFF3B0, #FFC857 55%, #FF9A5C)'}}>
      <svg width={W} height={1920} style={{position: 'absolute', opacity: 0.3}}>
        <g transform={`translate(540 860) rotate(${f * 0.5})`}>
          {Array.from({length: 18}).map((_, i) => (
            <path key={i} d="M0 0 L-70 -1500 L70 -1500Z" fill="#fff" transform={`rotate(${i * 20})`} />
          ))}
        </g>
      </svg>
      {/* puff poofs away */}
      {f <= poofAt + 8 && (
        <div style={{position: 'absolute', left: 390, top: 1180, transform: `scale(${f < poofAt ? 1 : puffScale})`}}>
          <div style={{position: 'relative', width: 300, height: 270}}>
            <Puff x={0} y={0} size={300} />
          </div>
        </div>
      )}
      {f >= poofAt && f < poofAt + 20 &&
        Array.from({length: 8}).map((_, i) => {
          const ang = (i / 8) * Math.PI * 2;
          const d = interpolate(f - poofAt, [0, 18], [30, 260], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          const o = interpolate(f - poofAt, [10, 18], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * d, top: 1310 + Math.sin(ang) * d, width: 26, height: 26, borderRadius: '50%', background: i % 2 ? '#C9B8EA' : '#FFE27A', opacity: o}} />;
        })}
      <Big top={300} size={84} color="#7A3B10" style={{opacity: usePop(8)}}>
        Remember Allah!
      </Big>
      <div dir="rtl" style={{position: 'absolute', top: 520, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 260, color: '#B8860B', opacity: allah, transform: `scale(${allah})`, textShadow: '0 0 70px rgba(255,240,180,0.9), 0 12px 0 rgba(160,100,20,0.4)', lineHeight: 1.4}}>
        الله
      </div>
      <Caption text="When he remembers Allah, Shaytan disappears!" at={s(25.3 - 25.2)} />
    </AbsoluteFill>
  );
};

// S7 [28.04, 37.48] Hearts protected — phase 2 switches to jinn & people
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const phase2 = s(33.3 - 28.1);
  const cap2At = s(35.0 - 28.1);
  const ring = usePop(6, 10);
  const beat = 1 + Math.sin(f / 8) * 0.04;
  const heart = usePop(14, 9);
  const p1 = usePop(s(30.3 - 28.1));
  const p2 = usePop(phase2, 12);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#151040, #2E2068 55%, #4A3590)'}}>
      <Stars count={50} />
      <Arabic text={f < phase2 ? 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ' : 'مِنَ الْجِنَّةِ وَالنَّاسِ'} size={f < phase2 ? 78 : 100} top={300} color="#FFE27A" />
      {/* golden protective ring around the heart */}
      <div style={{position: 'absolute', left: 540 - 250, top: 640, width: 500, height: 500, borderRadius: '50%', border: '10px solid rgba(255,210,90,0.85)', boxShadow: '0 0 90px rgba(255,210,90,0.6), inset 0 0 70px rgba(255,210,90,0.35)', transform: `scale(${ring * beat})`, boxSizing: 'border-box'}} />
      <svg width={340} height={320} viewBox="0 0 100 95" style={{position: 'absolute', left: 370, top: 730, transform: `scale(${heart * beat})`}}>
        <path d="M50 88 C 20 66 6 48 6 32 C 6 16 20 6 32 6 C 41 6 48 11 50 18 C 52 11 59 6 68 6 C 80 6 94 16 94 32 C 94 48 80 66 50 88Z" fill="#FF7AA2" />
        <ellipse cx="32" cy="28" rx="10" ry="7" fill="#fff" opacity="0.55" transform="rotate(-25 32 28)" />
      </svg>
      {/* whisper squiggles bounce off the ring */}
      {f > 30 && (
        <>
          <Squiggle x={120 + Math.sin(f / 9) * 18} y={780} delay={34} color="#9E8BE8" />
          <Squiggle x={880 - Math.sin(f / 8) * 18} y={900} delay={44} flip color="#9E8BE8" />
          <Squiggle x={140 + Math.sin(f / 7) * 16} y={1050} delay={54} color="#9E8BE8" />
        </>
      )}
      <Big top={1220} size={72} color="#fff" style={{opacity: f < phase2 ? p1 : p2}}>
        {f < phase2 ? 'Allah protects our hearts' : 'From jinn and people'}
      </Big>
      <div style={{opacity: f < phase2 ? 1 : 0, visibility: f < phase2 ? 'visible' : 'hidden'}}>
        <Caption text="He whispers into the hearts of people…" at={s(30.3 - 28.1)} />
      </div>
      <div style={{opacity: f >= phase2 ? 1 : 0, visibility: f >= phase2 ? 'visible' : 'hidden'}}>
        <Caption text="…from the jinn and the people." at={cap2At} />
      </div>
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
  [1.95, 6.5, S2],
  [6.5, 13.8, S3],
  [13.8, 19.3, S4],
  [19.3, 25.2, S5],
  [25.2, 28.1, S6],
  [28.1, 37.48, S7],
  [37.48, 41.2, Outro],
];

export const NaasVertical: React.FC = () => {
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
      <Audio src={staticFile('naas/voice.mp3')} />
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
