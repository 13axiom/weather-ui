'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────
   SVG Weather Icons  (viewBox centred at 0,0  —  fits ~90×90 px)
   ───────────────────────────────────────────────────────────────────────── */

function SunIcon() {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <circle r="20" />
      {rays.map(angle => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={Math.cos(rad) * 28} y1={Math.sin(rad) * 28}
            x2={Math.cos(rad) * 37} y2={Math.sin(rad) * 37}
          />
        );
      })}
    </g>
  );
}

function RainIcon() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-26,2 Q-26,-13 -13,-13 Q-11,-27 6,-27 Q23,-27 23,-13 Q33,-13 33,2 Z" />
      <line x1="-18" y1="12" x2="-23" y2="25" />
      <line x1="-6"  y1="12" x2="-11" y2="25" />
      <line x1="6"   y1="12" x2="1"   y2="25" />
      <line x1="18"  y1="12" x2="13"  y2="25" />
    </g>
  );
}

function FogIcon() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round">
      <line x1="-34" y1="-16" x2="34" y2="-16" />
      <line x1="-26" y1="-4"  x2="30" y2="-4"  />
      <line x1="-34" y1="8"   x2="22" y2="8"   />
      <line x1="-22" y1="20"  x2="34" y2="20"  />
    </g>
  );
}

function SnowIcon() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-22,-8 Q-22,-21 -10,-21 Q-8,-33 6,-33 Q21,-33 21,-21 Q30,-21 30,-8 Z" />
      {[-14, 0, 14].map(x => (
        <g key={x} transform={`translate(${x}, 8)`}>
          <line x1="0"  y1="-9" x2="0"  y2="9"  />
          <line x1="-8" y1="-5" x2="8"  y2="5"  />
          <line x1="-8" y1="5"  x2="8"  y2="-5" />
          {/* tiny tips */}
          <line x1="-3" y1="-12" x2="0" y2="-9" />
          <line x1="3"  y1="-12" x2="0" y2="-9" />
          <line x1="-3" y1="12"  x2="0" y2="9"  />
          <line x1="3"  y1="12"  x2="0" y2="9"  />
        </g>
      ))}
    </g>
  );
}

function CloudIcon() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-38,12 Q-38,-11 -20,-11 Q-17,-31 5,-31 Q28,-31 28,-11 Q42,-11 42,12 Z" />
    </g>
  );
}

function StormIcon() {
  return (
    <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-26,2 Q-26,-13 -13,-13 Q-11,-27 6,-27 Q23,-27 23,-13 Q33,-13 33,2 Z" />
      <polyline points="4,10 -6,26 4,26 -8,42" />
    </g>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Globe — wireframe sphere SVG
   ───────────────────────────────────────────────────────────────────────── */
function Globe() {
  const latLines = [
    { cy: -90, rx: 52,  ry: 10 },
    { cy: -60, rx: 90,  ry: 17 },
    { cy: -30, rx: 114, ry: 22 },
    { cy:   0, rx: 124, ry: 25 },
    { cy:  30, rx: 114, ry: 22 },
    { cy:  60, rx: 90,  ry: 17 },
    { cy:  90, rx: 52,  ry: 10 },
  ];

  return (
    <svg
      width="280" height="280"
      viewBox="-140 -140 280 280"
      aria-hidden
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id="gc">
          <circle r="124" />
        </clipPath>
        <filter id="gg" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Radial gradient for subtle sphere feel */}
        <radialGradient id="sphere-grad" cx="38%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="var(--color-primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft sphere fill */}
      <circle r="124" fill="url(#sphere-grad)" />

      <g
        stroke="var(--color-primary)"
        fill="none"
        strokeWidth="1.2"
        opacity="0.55"
        filter="url(#gg)"
        clipPath="url(#gc)"
      >
        {/* Latitude lines */}
        {latLines.map(({ cy, rx, ry }) => (
          <ellipse key={cy} cx="0" cy={cy} rx={rx} ry={ry} />
        ))}
        {/* Longitude lines */}
        <ellipse rx="36"  ry="124" />
        <ellipse rx="76"  ry="124" />
        <ellipse rx="112" ry="124" />
      </g>

      {/* Globe outline — brighter */}
      <circle r="124" stroke="var(--color-primary)" strokeWidth="2" fill="none"
              opacity="0.85" filter="url(#gg)" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Icon registry
   ───────────────────────────────────────────────────────────────────────── */
const ICONS: React.FC[] = [SunIcon, RainIcon, FogIcon, SnowIcon, CloudIcon, StormIcon];
const NAMES  = ['Clear sky', 'Rain', 'Fog', 'Snow', 'Overcast', 'Thunderstorm'];
// Neon palette per weather condition
const COLORS = [
  'var(--color-accent)',       // sun — warm accent
  'var(--color-secondary)',    // rain — cool blue
  'var(--text-muted)',         // fog — muted
  'var(--color-secondary)',    // snow — icy blue
  'var(--text)',               // cloud — neutral
  'var(--color-primary)',      // storm — primary neon
];

/* ─────────────────────────────────────────────────────────────────────────
   Landing page
   ───────────────────────────────────────────────────────────────────────── */
const TOTAL_MS  = 6500;  // total animation duration
const ICON_MS   = 920;   // how long each icon is shown
const SKIP_MS   = 1400;  // when "skip" hint appears

export default function LandingPage() {
  const [done, setDone]         = useState(false);
  const [skippable, setSkippable] = useState(false);
  const [iconIdx, setIconIdx]   = useState(0);

  const finish = useCallback(() => setDone(true), []);

  useEffect(() => {
    // Shuffle order so icons appear in random sequence
    const order = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    let step = 0;

    const iconTimer  = setInterval(() => {
      step += 1;
      setIconIdx(order[step % order.length]);
    }, ICON_MS);

    const doneTimer  = setTimeout(finish,                  TOTAL_MS);
    const skipTimer  = setTimeout(() => setSkippable(true), SKIP_MS);

    const onKey      = () => finish();
    window.addEventListener('keydown', onKey);

    return () => {
      clearInterval(iconTimer);
      clearTimeout(doneTimer);
      clearTimeout(skipTimer);
      window.removeEventListener('keydown', onKey);
    };
  }, [finish]);

  const Icon = ICONS[iconIdx];

  return (
    <>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div
        style={{
          position:       'relative',
          zIndex:         10,
          minHeight:      '100vh',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '32px',
          padding:        '0 20px',
          userSelect:     'none',
        }}
        onClick={() => { if (!done) finish(); }}
      >

        {/* ── Globe + animated icon ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ position: 'relative', width: '280px', height: '280px', flexShrink: 0 }}
        >
          {/* Spinning globe */}
          <div className="globe-spin-wrapper" style={{ position: 'absolute', top: 0, left: 0 }}>
            <Globe />
          </div>

          {/* Weather icon — overlaid at centre, not spinning */}
          <div style={{
            position:       'absolute',
            top:            0, left: 0, right: 0, bottom: 0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            pointerEvents:  'none',
          }}>
            <AnimatePresence mode="wait">
              <motion.svg
                key={iconIdx}
                width="96" height="96"
                viewBox="-48 -48 96 96"
                initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.8, rotate: 15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{ color: COLORS[iconIdx] }}
                aria-label={NAMES[iconIdx]}
              >
                <Icon />
              </motion.svg>
            </AnimatePresence>
          </div>

          {/* Subtle neon glow ring */}
          <div
            style={{
              position:     'absolute',
              top: 0, left: 0,
              width:        '280px',
              height:       '280px',
              borderRadius: '50%',
              boxShadow:    '0 0 60px var(--color-primary-glow), 0 0 120px var(--color-primary-glow)',
              opacity:      0.25,
              pointerEvents:'none',
            }}
          />
        </motion.div>

        {/* ── Title ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          className="text-center"
        >
          <h1 className="theme-heading text-4xl sm:text-5xl mb-2">
            Running Portal
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
            Weather · Air Quality · Race Calendar · St. Petersburg &amp; Cyprus
          </p>
        </motion.div>

        {/* ── Buttons — appear when animation ends ────────────────────── */}
        <AnimatePresence>
          {done && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Primary row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                  href="/city"
                  className="btn-neon text-base px-10 py-3 text-center"
                  style={{ minWidth: '160px' }}
                >
                  City View
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-neon btn-neon-outline text-base px-10 py-3 text-center"
                  style={{ minWidth: '160px' }}
                >
                  All Cities
                </Link>
              </div>
              {/* Secondary row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                  href="/air"
                  className="btn-neon btn-neon-outline text-base px-10 py-3 text-center"
                  style={{ minWidth: '160px' }}
                >
                  Air Quality
                </Link>
                <Link
                  href="/races"
                  className="btn-neon btn-neon-outline text-base px-10 py-3 text-center"
                  style={{ minWidth: '160px' }}
                >
                  Running Calendar
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skip hint ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {!done && skippable && (
            <motion.p
              key="skip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="text-xs cursor-pointer underline underline-offset-2 mt-2"
              style={{ color: 'var(--text-muted)' }}
            >
              tap or press any key to skip
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
