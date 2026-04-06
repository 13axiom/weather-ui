'use client';

interface BaseProps {
  cities: string[];
  selected: string;
  onChange: (city: string) => void;
}

/* ── Search input only ───────────────────────────────────────────── */
interface SearchProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function CitySelectorSearch({ query, onQueryChange }: SearchProps) {
  return (
    <div style={{ position: 'relative', width: '220px' }}>
      {/* magnifier icon */}
      <span style={{
        position:       'absolute',
        left:           '12px',
        top:            '50%',
        transform:      'translateY(-50%)',
        fontSize:       '0.85rem',
        pointerEvents:  'none',
        color:          'var(--text-muted)',
      }}>
        🔍
      </span>
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Search city…"
        style={{
          width:        '100%',
          boxSizing:    'border-box',
          paddingLeft:  '36px',
          paddingRight: '14px',
          paddingTop:   '8px',
          paddingBottom:'8px',
          borderRadius: '999px',
          border:       '1px solid var(--border-color)',
          background:   'var(--surface)',
          color:        'var(--text)',
          fontSize:     '0.82rem',
          outline:      'none',
          backdropFilter: 'blur(8px)',
          transition:   'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow   = '0 0 0 2px var(--color-primary-glow)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow   = 'none';
        }}
      />
    </div>
  );
}

/* ── City pills only ─────────────────────────────────────────────── */
interface PillsProps extends BaseProps {
  query?: string;
}

export function CitySelectorPills({ cities, selected, onChange, query = '' }: PillsProps) {
  const filtered = query.trim()
    ? cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : cities;

  if (cities.length === 0) {
    return (
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        No cities — is the Go backend running?
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
      {filtered.length === 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          No cities match "{query}"
        </p>
      )}
      {filtered.map((city) => {
        const active = selected === city;
        return (
          <button
            key={city}
            onClick={() => onChange(city)}
            style={{
              padding:       '6px 16px',
              borderRadius:  '999px',
              fontSize:      '0.8rem',
              fontWeight:    600,
              border:        active
                ? '1px solid var(--color-primary)'
                : '1px solid var(--border-color)',
              background:    active
                ? 'linear-gradient(135deg, var(--color-primary-glow), transparent)'
                : 'var(--surface)',
              color:         active ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow:     active ? '0 0 10px var(--color-primary-glow)' : 'none',
              cursor:        'pointer',
              transition:    'all 0.18s ease',
              backdropFilter:'blur(6px)',
              letterSpacing: '0.01em',
              whiteSpace:    'nowrap',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.transform = 'scale(1.04)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {city}
          </button>
        );
      })}
    </div>
  );
}

/* ── Combined (legacy default export — for backward compat) ──────── */
interface Props extends BaseProps {}

export default function CitySelector({ cities, selected, onChange }: Props) {
  return (
    <CitySelectorPills cities={cities} selected={selected} onChange={onChange} />
  );
}
