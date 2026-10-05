import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  Audio,
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

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const TOTAL = s(43.5);

const EN = 'Fredoka, sans-serif';
const AR = 'Amiri, serif';

// ---------- helpers ----------
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
        const x = (i * 397) % 1920;
        const y = (i * 211) % 760;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 18 + i));
        const r = 3 + (i % 4) * 1.6;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: tw, boxShadow: `0 0 ${r * 4}px ${color}`}} />
        );
      })}
    </AbsoluteFill>
  );
};

const Hills: React.FC<{c1: string; c2: string}> = ({c1, c2}) => (
  <svg width={1920} height={1080} style={{position: 'absolute'}}>
    <path d="M0 900 Q 400 780 800 880 T 1920 850 V1080 H0 Z" fill={c1} />
    <path d="M0 960 Q 500 870 1000 950 T 1920 930 V1080 H0 Z" fill={c2} />
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
    <div style={{position: 'absolute', bottom: 54, width: '100%', display: 'flex', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.94)', color: '#3B2A63', fontFamily: EN, fontWeight: 600, fontSize: 50, padding: '18px 44px', borderRadius: 60, boxShadow: '0 10px 0 rgba(0,0,0,0.12)', maxWidth: 1600, textAlign: 'center'}}>{text}</div>
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

// ---------- little drawings ----------
const Moon: React.FC<{x: number; y: number}> = ({x, y}) => {
  const f = useCurrentFrame();
  return (
    <svg width={260} height={260} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y + Math.sin(f / 20) * 8}}>
      <defs>
        <mask id="m">
          <rect width="100" height="100" fill="#fff" />
          <circle cx="64" cy="40" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="48" cy="50" r="38" fill="#FFE27A" mask="url(#m)" />
    </svg>
  );
};

const Flower: React.FC<{x: number; color: string; delay: number}> = ({x, color, delay}) => {
  const f = useCurrentFrame();
  const g = interpolate(f - delay, [0, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  const sway = Math.sin((f + delay) / 14) * 4;
  return (
    <svg width={160} height={320} viewBox="0 0 80 160" style={{position: 'absolute', left: x, bottom: 150, transformOrigin: 'bottom center', transform: `scaleY(${g}) rotate(${sway}deg)`}}>
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

const Bird: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  const x = interpolate(t, [0, 120], [-200, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flap = Math.sin(t / 3) * 25;
  return (
    <svg width={140} height={100} viewBox="0 0 70 50" style={{position: 'absolute', left: x, top: 430 + Math.sin(t / 10) * 20}}>
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
          const t = ((f - delay) * 6 + i * 37) % 260;
          return f > delay ? (
            <div key={i} style={{position: 'absolute', left: 50 + i * 30, top: 130 + t, width: 10, height: 22, borderRadius: 10, background: '#7FC8F8', opacity: 1 - t / 260}} />
          ) : null;
        })}
    </div>
  );
};

const Fish: React.FC<{delay: number}> = ({delay}) => {
  const f = useCurrentFrame();
  const t = f - delay;
  const x = interpolate(t, [0, 140], [1950, 900], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <svg width={160} height={90} viewBox="0 0 80 45" style={{position: 'absolute', left: x, bottom: 40 + Math.sin(t / 8) * 10}}>
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
      <Moon x={1540} y={70} />
      <Hills c1="#3C2A8A" c2="#2A1E66" />
      <div dir="rtl" style={{position: 'absolute', top: 210, width: '100%', textAlign: 'center', fontFamily: AR, fontWeight: 700, fontSize: 120, color: '#FFE27A', opacity: p, transform: `scale(${p})`}}>
        سُورَةُ الإِخْلَاص
      </div>
      <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 130, color: '#fff', transform: `translateY(${(1 - usePop(16, 10)) * 400}px)`, textShadow: '0 10px 0 rgba(0,0,0,0.25)'}}>
        Surah Al-Ikhlas
      </div>
      <Arabic text="قُلْ هُوَ اللَّهُ أَحَدٌ" size={80} top={680} at={70} color="#fff" />
      <Sparkle x={300} y={300} size={70} delay={0} />
      <Sparkle x={1500} y={480} size={60} delay={20} />
      <Sparkle x={420} y={620} size={50} delay={35} />
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const f = useCurrentFrame();
  const p = usePop(4, 8);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #FFB35C, #FF7A59 55%, #E2557A)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.25}}>
        <g transform={`translate(960 470) rotate(${f * 0.4})`}>
          {Array.from({length: 18}).map((_, i) => (
            <path key={i} d="M0 0 L-60 -1200 L60 -1200Z" fill="#fff" transform={`rotate(${i * 20})`} />
          ))}
        </g>
      </svg>
      <Arabic text="أَحَدٌ" size={110} top={70} />
      <div style={{position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: EN, fontWeight: 700, fontSize: 420, lineHeight: 1, color: '#FFF4C2', transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, textShadow: '0 18px 0 #C9463D'}}>
        1
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 90, color: '#fff', opacity: usePop(30)}}>
        Allah is the ONE
      </div>
      <Sparkle x={560} y={300} size={80} delay={5} color="#fff" />
      <Sparkle x={1300} y={380} size={70} delay={25} color="#fff" />
      <Caption text="Say: He is Allah, the One." at={6} />
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
      <Cloud x={120} y={80} />
      <Cloud x={1480} y={140} />
      <Hills c1="#8BD17C" c2="#5DB75A" />
      <QBubble x={220} y={380} delay={0} size={150} color="#FF7A90" />
      <QBubble x={1560} y={360} delay={10} size={170} color="#9B6BF2" />
      <QBubble x={430} y={640} delay={20} size={110} color="#FFB627" />
      <QBubble x={1380} y={630} delay={30} size={120} color="#3DBE8B" />
      <div style={{position: 'absolute', left: 560, top: 250, width: 800, padding: '50px 40px', background: '#fff', borderRadius: 60, transform: `scale(${p})`, boxShadow: '0 14px 0 rgba(0,0,0,0.12)', textAlign: 'center'}}>
        <div style={{fontFamily: EN, fontSize: 46, color: '#7A6A9A', fontWeight: 500}}>Some people asked…</div>
        <div style={{fontFamily: EN, fontSize: 70, color: '#3B2A63', fontWeight: 700, marginTop: 14, lineHeight: 1.15}}>“Who is the family of your Lord?”</div>
        <svg width="80" height="60" style={{position: 'absolute', bottom: -50, left: 360}}>
          <path d="M0 0 L80 0 L30 55Z" fill="#fff" />
        </svg>
      </div>
      <Caption text="People asked about the lineage (family) of Allah." at={10} />
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const f = useCurrentFrame();
  const p = usePop(2, 7);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle, #FFF3B0, #FFC857 70%)'}}>
      {Array.from({length: 40}).map((_, i) => {
        const ang = (i / 40) * Math.PI * 2;
        const d = interpolate(f, [0, 40], [0, 700 + (i % 5) * 80], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        const colors = ['#FF6B6B', '#4ECDC4', '#9B6BF2', '#3DBE8B', '#FF8C42'];
        return <div key={i} style={{position: 'absolute', left: 960 + Math.cos(ang) * d, top: 460 + Math.sin(ang) * d + f * 2, width: 22, height: 14, background: colors[i % 5], transform: `rotate(${f * 8 + i * 30}deg)`, borderRadius: 4}} />;
      })}
      <div style={{position: 'absolute', top: 230, width: '100%', textAlign: 'center', fontFamily: EN, fontSize: 70, color: '#8A4B00', fontWeight: 600, opacity: p}}>Allah says, tell them…</div>
      <div style={{position: 'absolute', top: 340, width: '100%', textAlign: 'center', fontFamily: EN, fontSize: 230, fontWeight: 700, color: '#5B3BA8', transform: `scale(${p})`, textShadow: '0 14px 0 #FFFFFF'}}>He is ONE!</div>
      <Caption text="Tell them: He is One!" at={2} />
    </AbsoluteFill>
  );
};

const S5: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#8FD8FF, #DDF4FF)'}}>
    <Sun x={1620} y={50} />
    <Cloud x={160} y={150} rain delay={30} />
    <Hills c1="#8BD17C" c2="#5DB75A" />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: '#4FA8E0'}} />
    <Arabic text="اللَّهُ الصَّمَدُ" size={120} top={40} color="#3B2A63" />
    <div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 72, color: '#3B2A63', opacity: usePop(40)}}>
      Everyone needs Allah. Allah needs no one.
    </div>
    <Flower x={240} color="#FF7AA2" delay={45} />
    <Flower x={420} color="#B07CFF" delay={60} />
    <Flower x={1250} color="#FF9F43" delay={75} />
    <Flower x={1450} color="#FF6B6B" delay={90} />
    <Bird delay={80} />
    <Fish delay={110} />
    <Caption text="Allah-us-Samad: He gives all creation what it needs." at={10} />
  </AbsoluteFill>
);

const Card: React.FC<{x: number; delay: number; arabic: string; title: string; kind: 'down' | 'up'}> = ({x, delay, arabic, title, kind}) => {
  const p = usePop(delay, 10);
  const f = useCurrentFrame();
  const cross = interpolate(f - delay, [25, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // tiny family-tree icon: a centre dot with branches going down (children) or up (parents)
  const dir = kind === 'down' ? 1 : -1;
  return (
    <div style={{position: 'absolute', left: x, top: 170, width: 720, height: 640, background: '#fff', borderRadius: 50, transform: `scale(${p}) rotate(${(1 - p) * (kind === 'down' ? -8 : 8)}deg)`, boxShadow: '0 16px 0 rgba(0,0,0,0.12)', textAlign: 'center'}}>
      <div dir="rtl" style={{fontFamily: AR, fontWeight: 700, fontSize: 100, color: '#5B3BA8', marginTop: 20}}>{arabic}</div>
      <svg width={360} height={240} viewBox="-90 -60 180 120" style={{marginTop: 0}}>
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
      <div style={{fontFamily: EN, fontWeight: 700, fontSize: 70, color: '#3B2A63', marginTop: 10}}>{title}</div>
    </div>
  );
};

const S6: React.FC = () => {
  const f = useCurrentFrame();
  const second = s(30.9 - 26.2);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(135deg, #C7B8FF, #FFC6E0)'}}>
      <Stars count={22} color="#ffffff" />
      <Card x={170} delay={4} arabic="لَمْ يَلِدْ" title="He has no children" kind="down" />
      <Card x={1030} delay={second} arabic="وَلَمْ يُولَدْ" title="He has no parents" kind="up" />
      <Caption text={f < second ? 'Lam yalid: He has no children.' : 'Wa lam yulad: He was not born, He has no parents.'} at={f < second ? 4 : second} />
    </AbsoluteFill>
  );
};

const S7: React.FC = () => {
  const f = useCurrentFrame();
  const big = s(36.77 - 33.67);
  const shrink = interpolate(f, [big - 5, big + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const p = usePop(big + 5, 9);
  const items = [
    <Sun key="sun" x={0} y={0} size={200} />,
    <svg key="moon" width={200} height={200} viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#F2F0E6" /><circle cx="38" cy="40" r="7" fill="#D9D5C5" /><circle cx="62" cy="62" r="9" fill="#D9D5C5" /></svg>,
    <svg key="mtn" width={220} height={200} viewBox="0 0 110 100"><path d="M5 95 L45 20 L85 95Z" fill="#7E8CA8" /><path d="M45 20 L35 40 L55 40Z" fill="#fff" /><path d="M50 95 L78 45 L105 95Z" fill="#5E6C88" /></svg>,
    <svg key="sea" width={220} height={200} viewBox="0 0 110 100"><path d="M5 50 Q 20 35 35 50 T 65 50 T 95 50 T 110 50 V95 H5Z" fill="#3FA7E8" /><path d="M5 70 Q 20 58 35 70 T 65 70 T 95 70 T 110 70" stroke="#BDE6FF" strokeWidth="5" fill="none" /></svg>,
    <svg key="star" width={200} height={200} viewBox="-50 -50 100 100"><path d="M0 -42 L12 -12 L42 -10 L18 10 L26 40 L0 23 L-26 40 L-18 10 L-42 -10 L-12 -12Z" fill="#FFD23F" /></svg>,
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#1B1464, #3A2A8C 60%, #6D4BC3)'}}>
      <Stars count={50} />
      <Arabic text="وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ" size={100} top={60} color="#FFE27A" />
      <div style={{position: 'absolute', top: 430, width: '100%', display: 'flex', justifyContent: 'center', gap: 50, opacity: shrink, transform: `scale(${0.6 + 0.4 * shrink})`}}>
        {items.map((it, i) => {
          const ip = usePop(10 + i * 10, 9);
          return (
            <div key={i} style={{position: 'relative', width: 220, height: 220, background: 'rgba(255,255,255,0.12)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${ip})`}}>
              <div style={{position: 'relative', width: 200, height: 200}}>{it}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 290, width: '100%', textAlign: 'center', fontFamily: EN, fontWeight: 700, fontSize: 70, color: '#fff', opacity: usePop(20) * shrink}}>
        Nothing is like Him!
      </div>
      <div style={{position: 'absolute', top: 340, width: '100%', textAlign: 'center', transform: `scale(${p})`}}>
        <div style={{fontFamily: EN, fontWeight: 700, fontSize: 170, color: '#FFE27A', textShadow: '0 0 60px rgba(255,226,122,0.7), 0 12px 0 #2A1E66'}}>One &amp; Unique</div>
      </div>
      {f > big &&
        [[300, 250], [1500, 280], [420, 640], [1440, 650], [900, 760], [180, 480], [1700, 520]].map(([x, y], i) => <Sparkle key={i} x={x} y={y} size={70} delay={i * 7} />)}
      <Caption text={f < big ? 'Wa lam yakun lahu kufuwan ahad' : 'There is nothing like Him. He is One and Unique!'} at={f < big ? 4 : big} />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const p = usePop(0, 9);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#FFE5EC, #FFC2D4)', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={260} height={260} viewBox="-50 -50 100 100" style={{transform: `scale(${p}) rotate(${(1 - p) * 180}deg)`}}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <ellipse key={a} cx="0" cy="-26" rx="13" ry="22" fill={i % 2 ? '#FF7AA2' : '#FF9EBB'} transform={`rotate(${a})`} />
        ))}
        <circle r="15" fill="#FFD23F" />
      </svg>
      <div style={{fontFamily: EN, fontWeight: 700, fontSize: 110, color: '#B0305C', marginTop: 20, opacity: usePop(8)}}>Barakah Blooms</div>
    </AbsoluteFill>
  );
};

// ---------- timeline (seconds, synced to the narration) ----------
const scenes: [number, number, React.FC][] = [
  [0, 4.7, S1],
  [4.7, 9.3, S2],
  [9.3, 17.07, S3],
  [17.07, 19.3, S4],
  [19.3, 26.2, S5],
  [26.2, 33.67, S6],
  [33.67, 40.8, S7],
  [40.8, 43.5, Outro],
];

export const Ikhlas: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('700 100px Amiri', 'الله'),
      document.fonts.load('700 100px Fredoka'),
      document.fonts.load('500 100px Fredoka'),
    ]).then(() => continueRender(handle));
  }, [handle]);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Audio src={staticFile('ikhlas/voice.mp3')} />
      {scenes.map(([a, b, C], i) => {
        const from = s(a);
        const dur = s(b) - from + (i < scenes.length - 1 ? 6 : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneFade dur={dur}>
              <C />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
