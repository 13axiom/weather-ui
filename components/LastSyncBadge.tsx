'use client';

interface Props {
  syncedAt: string | null | undefined;
}

export default function LastSyncBadge({ syncedAt }: Props) {
  if (!syncedAt) return null;

  const date = new Date(syncedAt);
  const now  = new Date();
  const diffMin = Math.round((now.getTime() - date.getTime()) / 60000);

  let ago: string;
  if (diffMin < 1)        ago = 'just now';
  else if (diffMin < 60)  ago = `${diffMin}m ago`;
  else if (diffMin < 1440) ago = `${Math.round(diffMin / 60)}h ago`;
  else                    ago = `${Math.round(diffMin / 1440)}d ago`;

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      gap:           '6px',
      padding:       '5px 12px',
      borderRadius:  '999px',
      border:        '1px solid var(--border-color)',
      background:    'var(--surface)',
      backdropFilter:'blur(8px)',
      fontSize:      '0.75rem',
      color:         'var(--text-muted)',
      whiteSpace:    'nowrap',
    }}>
      {/* Pulse dot */}
      <span style={{
        display:      'inline-block',
        width:        '7px',
        height:       '7px',
        borderRadius: '50%',
        background:   diffMin < 90 ? 'var(--color-success, #22c55e)' : 'var(--text-muted)',
        flexShrink:   0,
        boxShadow:    diffMin < 90 ? '0 0 6px var(--color-success, #22c55e)' : 'none',
      }} />
      <span>Data as of <strong style={{ color: 'var(--text)' }}>{dateStr}, {timeStr}</strong> · {ago}</span>
    </div>
  );
}
