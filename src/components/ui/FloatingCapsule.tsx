'use client';

import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';
import { IconSparkles } from '@/components/ui/icons';

export default function FloatingCapsule() {
  const openOmniBar = useUIStore((s) => s.openOmniBar);
  const nodeCount = useCosmosStore((s) => s.nodes.length);

  return (
    <button
      onClick={openOmniBar}
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 28px',
        fontFamily: "'Inter', sans-serif",
        fontSize: '15px',
        fontWeight: 600,
        color: '#FFFFFF',
        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        boxShadow: '0 8px 24px -6px rgba(124, 58, 237, 0.4)',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(124, 58, 237, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(-50%)';
        e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(124, 58, 237, 0.4)';
      }}
      aria-label="Open command bar"
    >
      <IconSparkles width={18} height={18} />
      <span>Capture a thought</span>
      <span
        style={{
          padding: '2px 8px',
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#E9D5FF',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '4px',
        }}
      >
        ⌘K
      </span>
      {nodeCount > 0 && (
        <span
          style={{
            marginLeft: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#FFFFFF',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
          }}
        >
          {nodeCount} nodes
        </span>
      )}
    </button>
  );
}
