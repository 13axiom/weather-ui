import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export default function Breadcrumb({ items }: Props) {
  return (
    <nav
      aria-label="breadcrumb"
      style={{
        display:     'flex',
        alignItems:  'center',
        flexWrap:    'wrap',
        marginBottom: '16px',
        fontSize:    '0.8rem',
        gap:         0,
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            {/* separator before every item except the first */}
            {i > 0 && (
              <span style={{
                color:   'var(--text-muted)',
                margin:  '0 8px',
                fontSize: '0.9rem',
              }}>
                ›
              </span>
            )}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                style={{
                  color:          'var(--text-muted)',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{
                color:      isLast ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: isLast ? 600 : 400,
              }}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
