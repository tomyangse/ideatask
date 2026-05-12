'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import {
  IconArrowLeft, IconNetwork, IconTrash2, IconLightbulb
} from '@/components/ui/icons';

const CosmosCanvas = dynamic(
  () => import('@/components/cosmos/CosmosCanvas'),
  { ssr: false }
);

const IDEA_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  spark: { bg: '#EDE9FE', text: '#7C3AED', label: '新想法' },
  active: { bg: '#FFEDD5', text: '#EA580C', label: '待整理' },
  in_progress: { bg: '#FEF9C3', text: '#CA8A04', label: '待评估' },
};

interface IdeaPageProps {
  ideaId: string;
}

export default function IdeaPage({ ideaId }: IdeaPageProps) {
  const idea = useCosmosStore((s) => s.getNodeById(ideaId));
  const nodes = useCosmosStore((s) => s.nodes);
  const removeNode = useCosmosStore((s) => s.removeNode);
  const exitIdea = useUIStore((s) => s.exitIdea);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);

  // Ensure mindmap is focused on this idea
  const ensureFocused = () => {
    if (focusedSystemId !== ideaId) toggleFocusedSystem(ideaId);
  };

  const handleBack = () => {
    if (focusedSystemId) toggleFocusedSystem(focusedSystemId);
    exitIdea();
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    removeNode(ideaId);
    exitIdea();
  };

  if (!idea) return null;

  const children = nodes.filter(n => n.parent_id === ideaId);
  const badge = IDEA_BADGE[idea.status] || IDEA_BADGE.spark;

  return (
    <>
      {/* Idea top bar */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, right: 0, height: '64px', zIndex: 39,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Left: back + idea info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={handleBack} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            fontSize: '13px', fontWeight: 500, color: '#475569', background: '#F8FAFC',
            border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#FCD34D'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            <IconArrowLeft width={14} height={14} /> 返回
          </button>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconLightbulb width={20} height={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>{idea.title}</span>
                <span style={{
                  padding: '2px 8px', fontSize: '10px', fontWeight: 600,
                  background: badge.bg, color: badge.text, borderRadius: '4px',
                }}>{badge.label}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>
                {children.length} 子节点
                {idea.ai_category && <span style={{ marginLeft: '8px', padding: '1px 6px', background: '#F3F4F6', borderRadius: '3px', fontSize: '10px' }}>{idea.ai_category}</span>}
              </div>
            </div>
          </div>

          {/* Delete button */}
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="删除点子" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
            padding: confirmDelete ? '4px 12px' : '4px',
            height: '32px', borderRadius: '8px', border: 'none',
            background: confirmDelete ? '#EF4444' : 'transparent',
            cursor: 'pointer', color: confirmDelete ? '#FFFFFF' : '#D1D5DB',
            transition: 'all 0.15s', flexShrink: 0,
            fontSize: '12px', fontWeight: confirmDelete ? 600 : 400,
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => { if (!confirmDelete) { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}}
          onMouseLeave={e => { if (!confirmDelete) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D1D5DB'; }}}
          >
            <IconTrash2 width={14} height={14} />
            {confirmDelete && '确认删除'}
          </button>
        </div>

        {/* Right: view indicator */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '3px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 14px', borderRadius: '8px', border: 'none',
            fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500,
            background: '#FFFFFF', color: '#F59E0B',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <IconNetwork width={15} height={15} /> 导图
          </div>
        </div>
      </div>

      {/* Mindmap content */}
      <CosmosCanvas />
    </>
  );
}
