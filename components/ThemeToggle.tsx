'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * Animated pill slider — moon on the left, sun on the right.
 * The circle slides between them with a spring transition.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 60, height: 32 }} />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position:        'relative',
        display:         'inline-flex',
        alignItems:      'center',
        width:           '60px',
        height:          '32px',
        borderRadius:    '16px',
        border:          `1px solid ${isDark ? 'var(--color-primary)' : '#94a3b8'}`,
        background:      isDark ? 'var(--color-primary-glow)' : '#e2e8f0',
        cursor:          'pointer',
        flexShrink:      0,
        transition:      'background 0.35s ease, border-color 0.35s ease',
        padding:         0,
      }}
    >
      {/* 🌙 left icon */}
      <span style={{
        position:   'absolute',
        left:       '7px',
        fontSize:   '13px',
        lineHeight: 1,
        opacity:    isDark ? 1 : 0.3,
        transition: 'opacity 0.3s ease',
        userSelect: 'none',
      }}>
        🌙
      </span>

      {/* ☀️ right icon */}
      <span style={{
        position:   'absolute',
        right:      '7px',
        fontSize:   '13px',
        lineHeight: 1,
        opacity:    isDark ? 0.3 : 1,
        transition: 'opacity 0.3s ease',
        userSelect: 'none',
      }}>
        ☀️
      </span>

      {/* Sliding circle */}
      <span style={{
        position:     'absolute',
        width:        '24px',
        height:       '24px',
        borderRadius: '50%',
        background:   isDark ? 'var(--color-primary)' : '#ffffff',
        boxShadow:    isDark
          ? '0 0 10px var(--color-primary), 0 0 4px var(--color-primary)'
          : '0 1px 4px rgba(0,0,0,0.25)',
        transform:    isDark ? 'translateX(32px)' : 'translateX(3px)',
        transition:   'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.35s ease, box-shadow 0.35s ease',
      }} />
    </button>
  );
}
