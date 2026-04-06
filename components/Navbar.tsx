'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const links = [
  { href: '/',          label: 'Home'       },
  { href: '/city',      label: 'City View'  },
  { href: '/dashboard', label: 'All Cities' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position:        'sticky',
      top:             0,
      zIndex:          50,
      width:           '100%',
      backdropFilter:  'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      background:      'var(--surface)',
      borderBottom:    '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth:       '1280px',
        margin:         '0 auto',
        padding:        '0 100px',
        height:         '72px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            '24px',
      }}>

        {/* Logo — big, links back to landing */}
        <Link href="/" style={{
          fontSize:       '2rem',
          fontWeight:     700,
          letterSpacing:  '-0.03em',
          color:          'var(--heading-color)',
          textDecoration: 'none',
          whiteSpace:     'nowrap',
          flexShrink:     0,
          lineHeight:     1,
        }}>
          ⛈ Weather
        </Link>

        {/* Nav links — single label, no duplication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display:        'inline-block',
                  padding:        '8px 20px',
                  borderRadius:   '9999px',
                  fontSize:       '0.9rem',
                  fontWeight:     600,
                  whiteSpace:     'nowrap',
                  textDecoration: 'none',
                  transition:     'all 0.2s ease',
                  background:     active ? 'var(--color-primary-glow)' : 'var(--surface)',
                  color:          active ? 'var(--color-primary)'      : 'var(--text-muted)',
                  border:         active
                    ? '1px solid var(--color-primary)'
                    : '1px solid var(--border-color)',
                  boxShadow:      active ? '0 0 12px var(--color-primary-glow)' : 'none',
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle — top-right corner, always visible */}
        <div style={{ flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
