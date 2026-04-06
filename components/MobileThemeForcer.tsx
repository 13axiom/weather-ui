'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Forces dark theme on mobile (≤ 430 px — iPhone 15/17 Pro and smaller).
 * On desktop, the user's toggle preference is respected.
 */
export default function MobileThemeForcer() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 430px)');

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setTheme('dark');
    };

    // Check immediately on mount
    handler(mq);

    // Listen to resize/orientation changes
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setTheme]);

  return null; // renders nothing
}
