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
export const TOTAL_V_FR = s(44.5);
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
        <mask id="mvfr">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="64" cy="40" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="48" cy="50" r="38" fill="#FFE27A" mask="url(#mvfr)" />
    </svg>
  );
};

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

const Fish: React.FC<{delay: number; bottom: number}> = ({delay, bottom}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  const x = interpolate(t, [0, 140], [1100, 450], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={160} height={90} viewBox="0 0 80 45" style={{position: 'absolute', left: x, bottom: bottom + Math.sin(t / 8) * 10}}>
      <ellipse cx="35" cy="22" rx="24" ry="14" fill="#FF8C61" />
      <path d={`M57 22 L76 ${10 + Math.sin(t / 3) * 3} L76 ${34 - Math.sin(t / 3) * 3}Z`} fill="#FF6B3D" />
      <circle cx="22" cy="18" r="3" fill="#222" />
    </svg>
  );
};

// ---------- scenes ----------
const S1: React.FC = () => {
  const p = usePop(6, 9);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #5B3BA8 70%, #8E6BD6)'}}>
      <Stars />
      <Moon x={760} y={230} />
      <Hills c1="#3C2A8A" c2="#2A1E66" y={1560} />
      <div dir="rtl" style={{position: 'absolute', top: 500, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 120, color: '#FFE27A', opacity: p, transform: `scale(${p})`}}>
        سُورَةُ الإِخْلَاص
      </div>
      <Big top={760} size={120} color="#fff" style={{transform: `translateY(${(1 - usePop(16, 10)) * 600}px)`, textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
        Sourate
        <br />
        Al-Ikhlas
      </Big>
      <Arabic text="قُلْ هُوَ اللَّهُ أَحَدٌ" size={84} top={1100} at={70} color="#fff" />
      <Sparkle x={120} y={420} size={70} delay={0} />
      <Sparkle x={880} y={720} size={60} delay={20} />
      <Sparkle x={150} y={1000} size={50} delay={35} />
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const p = usePop(4, 8);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFB35C, #FF7A59 55%, #E2557A)'}}>
      <svg width={W} height={1920} style={{position: 'absolute', opacity: 0.25}}>
        <g transform={`translate(540 860) rotate(${f * 0.4})`}>
          {Array.from({length: 18}).map((_, i) => (
            <path key={i} d="M0 0 L-70 -1500 L70 -1500Z" fill="#fff" transform={`rotate(${i * 20})`} />
          ))}
        </g>
      </svg>
      <Arabic text="أَحَدٌ" size={130} top={300} />
      <Big top={540} size={520} color="#FFF4C2" style={{lineHeight: 1, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, textShadow: '0 20px 0 #C9463D'}}>
        1
      </Big>
      <Big top={1130} size={96} color="#fff" style={{opacity: usePop(30)}}>
        Allah est l'UNIQUE
      </Big>
      <Sparkle x={200} y={700} size={80} delay={5} color="#fff" />
      <Sparkle x={800} y={820} size={70} delay={25} color="#fff" />
      <Caption text="Dis : Il est Allah, l'Unique." at={6} />
    </AbsoluteFill>
  );
};

const QBubble: React.FC<{x: number; y: number; delay: number; size: number; color: string}> = ({x, y, delay, size, color}) => {
  const f = useCurrentFrame();
  const p = usePop(delay, 8);
  return (
    <div style={{position: 'absolute', left: x, top: y + Math.sin((f + delay) / 12) * 14, width: size, height: size, borderRadius: '50%', background: color, transform: `scale(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: EN, fontWeight: 700, fontSize: size * 0.6, color: '#fff', boxShadow: '0 8px 0 rgba(0,0,0,0.15)'}}>
      ?
    </div>
  );
};

const S3: React.FC = () => {
  const p = usePop(60, 12);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#7FD1F7, #B8E8FF)'}}>
      <Cloud x={40} y={230} />
      <Cloud x={720} y={290} />
      <Hills c1="#8BD17C" c2="#5DB75A" y={1560} />
      <QBubble x={90} y={460} delay={0} size={150} color="#FF7A90" />
      <QBubble x={820} y={500} delay={10} size={160} color="#9B6BF2" />
      <QBubble x={130} y={1150} delay={20} size={120} color="#FFB627" />
      <QBubble x={820} y={1150} delay={30} size={130} color="#3DBE8B" />
      <div style={{position: 'absolute', left: 90, top: 700, width: 900, padding: '50px 40px', background: '#fff', borderRadius: 60, transform: `scale(${p})`, boxShadow: '0 14px 0 rgba(0,0,0,0.12)', textAlign: 'center', boxSizing: 'border-box'}}>
        <div style={{fontFamily: EN, fontSize: 48, color: '#7A6A9A', fontWeight: 500}}>Des gens ont demandé…</div>
        <div style={{fontFamily: EN, fontSize: 76, color: '#3B2A63', fontWeight: 700, marginTop: 14, lineHeight: 1.15}}>« Qui est la famille de ton Seigneur ? »</div>
        <svg width="80" height="60" style={{position: 'absolute', bottom: -50, left: 410}}>
          <path d="M0 0 L80 0 L30 55Z" fill="#fff" />
        </svg>
      </div>
      <Caption text="Ils ont demandé quelle est la lignée (la famille) d'Allah." at={10} />
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const p = usePop(2, 7);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle, #FFF3B0, #FFC857 70%)'}}>
      {Array.from({length: 44}).map((_, i) => {
        const ang = (i / 44) * Math.PI * 2;
        const d = interpolate(f, [0, 40], [0, 600 + (i % 5) * 120], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        const colors = ['#FF6B6B', '#4ECDC4', '#9B6BF2', '#3DBE8B', '#FF8C42'];
        return <div key={i} style={{position: 'absolute', left: 540 + Math.cos(ang) * d, top: 900 + Math.sin(ang) * d * 1.5 + f * 2, width: 24, height: 15, background: colors[i % 5], transform: `rotate(${f * 8 + i * 30}deg)`, borderRadius: 4}} />;
      })}
      <Big top={560} size={68} color="#8A4B00" style={{fontWeight: 600, opacity: p}}>
        Allah dit : dis-leur…
      </Big>
      <Big top={700} size={230} color="#5B3BA8" style={{transform: `scale(${p})`, textShadow: '0 14px 0 #FFFFFF'}}>
        Il est
        <br />
        UN !
      </Big>
      <Caption text="Dis-leur : Il est Un !" at={2} />
    </AbsoluteFill>
  );
};

const S5: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#8FD8FF, #DDF4FF)'}}>
    <Sun x={790} y={220} />
    <Cloud x={60} y={830} rain delay={30} />
    <Hills c1="#8BD17C" c2="#5DB75A" y={1330} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 300, background: '#4FA8E0'}} />
    <Arabic text="اللَّهُ الصَّمَدُ" size={130} top={360} color="#3B2A63" />
    <Big top={640} size={62} color="#3B2A63" style={{opacity: usePop(40)}}>
      Tous ont besoin d'Allah.
      <br />
      Allah n'a besoin de personne.
    </Big>
    <Flower x={420} color="#FF7AA2" delay={45} bottom={560} />
    <Flower x={600} color="#B07CFF" delay={60} bottom={540} />
    <Flower x={790} color="#FF9F43" delay={75} bottom={560} />
    <Flower x={260} color="#FF6B6B" delay={90} bottom={530} />
    <Bird delay={80} y={860} />
    <Fish delay={110} bottom={120} />
    <Caption text="Allahus-Samad : Il donne à toute la création ce dont elle a besoin." at={10} />
  </AbsoluteFill>
);

const Card: React.FC<{top: number; delay: number; arabic: string; title: string; kind: 'down' | 'up'}> = ({top, delay, arabic, title, kind}) => {
  const p = usePop(delay, 10);
  const f = useCurrentFrame();
  const cross = interpolate(f - delay, [25, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dir = kind === 'down' ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: 110, top, width: 860, height: 520, background: '#fff', borderRadius: 50, transform: `scale(${p}) rotate(${(1 - p) * (kind === 'down' ? -6 : 6)}deg)`, boxShadow: '0 16px 0 rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', padding: '0 40px', boxSizing: 'border-box'}}>
      <svg width={300} height={300} viewBox="-90 -90 180 180" style={{flexShrink: 0}}>
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
        <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 104, color: '#5B3BA8', lineHeight: 1.5}}>{arabic}</div>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 62, color: '#3B2A63', lineHeight: 1.1}}>{title}</div>
      </div>
    </div>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const second = s(30.38 - 26.1);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(160deg, #C7B8FF, #FFC6E0)'}}>
      <Stars count={26} color="#ffffff" />
      <Card top={260} delay={4} arabic="لَمْ يَلِدْ" title="Il n'a pas d'enfants" kind="down" />
      <Card top={850} delay={second} arabic="وَلَمْ يُولَدْ" title="Il n'a pas de parents" kind="up" />
      <Caption text={f < second ? "Lam yalid : Il n'a pas d'enfants." : "Wa lam yulad : Il n'a pas été engendré, Il n'a pas de parents."} at={f < second ? 4 : second} />
    </AbsoluteFill>
  );
};

const S7: React.FC = () => {
  const f = useCurrentFrame();
  const big = s(37.27 - 34.03);
  const shrink = interpolate(f, [big - 5, big + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = usePop(big + 5, 9);
  const items = [
    <Sun key="sun" x={0} y={0} size={200} />,
    <svg key="moon" width={200} height={200} viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#F2F0E6" /><circle cx="38" cy="40" r="7" fill="#D9D5C5" /><circle cx="62" cy="62" r="9" fill="#D9D5C5" /></svg>,
    <svg key="mtn" width={200} height={200} viewBox="0 0 110 100"><path d="M5 95 L45 20 L85 95Z" fill="#7E8CA8" /><path d="M45 20 L35 40 L55 40Z" fill="#fff" /><path d="M50 95 L78 45 L105 95Z" fill="#5E6C88" /></svg>,
    <svg key="sea" width={200} height={200} viewBox="0 0 110 100"><path d="M5 50 Q 20 35 35 50 T 65 50 T 95 50 T 110 50 V95 H5Z" fill="#3FA7E8" /><path d="M5 70 Q 20 58 35 70 T 65 70 T 95 70 T 110 70" stroke="#BDE6FF" strokeWidth="5" fill="none" /></svg>,
    <svg key="star" width={200} height={200} viewBox="-50 -50 100 100"><path d="M0 -42 L12 -12 L42 -10 L18 10 L26 40 L0 23 L-26 40 L-18 10 L-42 -10 L-12 -12Z" fill="#FFD23F" /></svg>,
  ];
  const pops = items.map((_, i) => usePop(10 + i * 10, 9));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #3A2A8C 60%, #6D4BC3)'}}>
      <Stars count={50} />
      <Arabic text="وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ" size={84} top={300} color="#FFE27A" />
      <Big top={560} size={76} color="#fff" style={{opacity: usePop(20) * shrink}}>
        Rien ne Lui ressemble !
      </Big>
      <div style={{position: 'absolute', top: 720, left: 100, width: 880, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 40, opacity: shrink, transform: `scale(${0.6 + 0.4 * shrink})`}}>
        {items.map((it, i) => (
          <div key={i} style={{position: 'relative', width: 240, height: 240, background: 'rgba(255,255,255,0.12)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pops[i]})`}}>
            <div style={{position: 'relative', width: 200, height: 200}}>{it}</div>
          </div>
        ))}
      </div>
      <Big top={690} size={180} color="#FFE27A" style={{transform: `scale(${p})`, textShadow: '0 0 60px rgba(255,226,122,0.7), 0 12px 0 #2A1E66'}}>
        Un et
        <br />
        Unique
      </Big>
      {f > big && [[120, 600], [860, 620], [160, 1150], [840, 1180], [500, 1250], [60, 900], [960, 920]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} size={70} delay={i * 7} />)}
      <Caption text={f < big ? 'Wa lam yakun lahu kufuwan ahad' : "Personne ne Lui ressemble. Il est Un et Unique !"} at={f < big ? 4 : big} />
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
      <Big top={1110} size={54} color={PLUM} style={{opacity: t, transform: `translateY(${(1 - t) * 40}px)`}}>
        Suivez-nous pour plus
        <br />
        <span style={{color: '#D4609A'}}>d'histoires pour petits cœurs</span>
      </Big>
    </AbsoluteFill>
  );
};

const scenes: [number, number, React.FC][] = [
  [0, 4.15, S1],
  [4.15, 8.93, S2],
  [8.93, 18.1, S3],
  [18.1, 20.75, S4],
  [20.75, 26.1, S5],
  [26.1, 34.03, S6],
  [34.03, 40.85, S7],
  [40.85, 44.5, Outro],
];

export const IkhlasVerticalFr: React.FC = () => {
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
      <Audio src={staticFile('ikhlas/voice_fr.mp3')} />
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
