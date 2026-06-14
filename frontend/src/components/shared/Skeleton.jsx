import React from 'react';

// Lightweight shimmer skeleton placeholder - zero dependency
const shimmerKeyframes = `
@keyframes sk-shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
`;

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('sk-shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'sk-shimmer-style';
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

const shimmerBg = 'linear-gradient(90deg, var(--shimmer-base, rgba(15,118,110,0.06)) 25%, var(--shimmer-highlight, rgba(15,118,110,0.12)) 50%, var(--shimmer-base, rgba(15,118,110,0.06)) 75%)';

function SkeletonBlock({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: shimmerBg,
        backgroundSize: '200px 100%',
        animation: 'sk-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

// Top-level loading placeholder for main content area
function ContentSkeleton({ lines = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <SkeletonBlock width="40%" height="28px" borderRadius="8px" />
      <SkeletonBlock width="70%" height="16px" />
      <SkeletonBlock width="60%" height="16px" />
      <SkeletonBlock width="80%" height="16px" />
      {lines > 3 && <SkeletonBlock width="45%" height="16px" />}
      <div style={{ marginTop: '8px' }}>
        <SkeletonBlock width="100%" height="120px" borderRadius="12px" />
      </div>
    </div>
  );
}

// Compact card skeleton for sidebar panels
function CardSkeleton() {
  return (
    <div className="cyber-card" style={{ padding: '16px' }}>
      <SkeletonBlock width="50%" height="18px" borderRadius="6px" style={{ marginBottom: '12px' }} />
      <SkeletonBlock width="90%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="75%" height="14px" style={{ marginBottom: '8px' }} />
      <SkeletonBlock width="60%" height="14px" />
    </div>
  );
}

export default SkeletonBlock;
export { ContentSkeleton, CardSkeleton };
