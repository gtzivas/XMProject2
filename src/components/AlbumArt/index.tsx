import React from 'react';

export function AlbumArt({ src, size = 48, style }: { src: string | null; size?: number; style?: React.CSSProperties }) {
  const base: React.CSSProperties = { width: size, height: size, borderRadius: 6, flexShrink: 0, objectFit: 'cover', ...style };
  if (!src) return (
    <div style={{ ...base, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.38 }}>🎵</span>
    </div>
  );
  return <img src={src} alt="" style={base} />;
}
