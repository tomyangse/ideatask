'use client';

import { useState, useRef } from 'react';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import { ExoNode } from '@/lib/types';
import {
  IconFolder, IconLightbulb, IconSparkles,
  IconBot, IconBookOpen, IconBox, IconBrain, IconPrinter, IconLayers
} from '@/components/ui/icons';

const STATUS_DOT: Record<string, string> = {
  active: '#10B981', planning: '#3B82F6', paused: '#9CA3AF',
  blocked: '#EF4444', in_progress: '#10B981', doing: '#10B981', spark: '#7C3AED',
};

const IDEA_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  spark: { bg: '#EDE9FE', text: '#7C3AED', label: '新想法' },
  active: { bg: '#FFEDD5', text: '#EA580C', label: '待整理' },
  in_progress: { bg: '#FEF9C3', text: '#CA8A04', label: '待评估' },
};

function projectIcon(title: string) {
  const t = title.toLowerCase(); const c = '#7C3AED'; const s = 18;
  if (t.includes('myr2d2')) return <IconBot width={s} height={s} color={c} />;
  if (t.includes('howtouse')) return <IconBookOpen width={s} height={s} color={c} />;
  if (t.includes('skokartongen')) return <IconBox width={s} height={s} color={c} />;
  if (t.includes('glantan')) return <IconBrain width={s} height={s} color={c} />;
  if (t.includes('printer') || t.includes('3d')) return <IconPrinter width={s} height={s} color={c} />;
  if (t.includes('nordloop')) return <IconLayers width={s} height={s} color={c} />;
  return <IconFolder width={s} height={s} color={c} />;
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr); if (isNaN(d.getTime())) return null;
  const now = new Date(); now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

export default function DashboardView() {
  const nodes = useCosmosStore((s) => s.nodes);
  const updateNode = useCosmosStore((s) => s.updateNode);
  const enterProject = useUIStore((s) => s.enterProject);
  const enterIdea = useUIStore((s) => s.enterIdea);
  const [dragOverZone, setDragOverZone] = useState<'project' | 'idea' | null>(null);
  const dragNodeRef = useRef<string | null>(null);

  const activeProjects = nodes.filter(
    n => n.type === 'project' && !['archived', 'done'].includes(n.status)
  );

  const ideaLibrary = nodes.filter(
    n => n.type === 'idea' && ['spark', 'active', 'in_progress'].includes(n.status)
  );

  const getMetrics = (pid: string) => {
    const ch = nodes.filter(n => n.parent_id === pid);
    const total = ch.length;
    const done = ch.filter(n => n.status === 'done').length;
    const overdue = ch.filter(n => {
      if (n.status === 'done') return false;
      const d = daysUntil(n.target_date) ?? daysUntil(n.ai_deadline);
      return d !== null && d < 0;
    }).length;
    return { total, done, overdue };
  };

  /* ── Drag & Drop ── */
  const handleDragStart = (nodeId: string) => {
    dragNodeRef.current = nodeId;
  };

  const handleDragOver = (e: React.DragEvent, zone: 'project' | 'idea') => {
    e.preventDefault();
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const handleDrop = (zone: 'project' | 'idea') => {
    const nodeId = dragNodeRef.current;
    if (!nodeId) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (zone === 'project' && node.type === 'idea') {
      updateNode(nodeId, { type: 'project' as any, status: 'active' as any });
    } else if (zone === 'idea' && node.type === 'project') {
      updateNode(nodeId, { type: 'idea' as any, status: 'spark' as any, parent_id: null });
    }

    dragNodeRef.current = null;
    setDragOverZone(null);
  };

  const handleDragEnd = () => {
    dragNodeRef.current = null;
    setDragOverZone(null);
  };

  /* ── Shared styles ── */
  const columnStyle: React.CSSProperties = {
    flex: 1, background: '#FFFFFF', borderRadius: 0, border: 'none',
    borderRight: '1px solid #E5E7EB',
    padding: '24px 28px 80px', display: 'flex', flexDirection: 'column', minHeight: 0,
    transition: 'background 0.2s',
  };

  const dropActiveProject: React.CSSProperties = dragOverZone === 'project' ? {
    background: '#FDFCFF',
  } : {};

  const dropActiveIdea: React.CSSProperties = dragOverZone === 'idea' ? {
    background: '#FFFDF7',
  } : {};

  return (
    <div style={{
      position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
      background: '#F8FAFC', fontFamily: "'Inter', sans-serif",
      display: 'flex', overflow: 'hidden',
    }}>
      {/* Two-column layout — 50/50 split */}
      <div style={{
        flex: 1, display: 'flex', gap: '0', padding: '0',
        width: '100%', minHeight: 0,
      }}>

        {/* ═══ LEFT: PROJECTS ═══ */}
        <div
          style={{ ...columnStyle, ...dropActiveProject }}
          onDragOver={e => handleDragOver(e, 'project')}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop('project')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexShrink: 0 }}>
            <IconFolder width={18} height={18} color="#7C3AED" />
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>项目</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '4px' }}>{activeProjects.length}</span>
          </div>

          {/* Drop hint */}
          {dragOverZone === 'project' && (
            <div style={{
              padding: '10px', marginBottom: '8px', borderRadius: '10px',
              border: '2px dashed #C4B5FD', background: '#F5F3FF',
              textAlign: 'center', fontSize: '12px', color: '#7C3AED', fontWeight: 500,
            }}>
              拖到这里转为项目
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {activeProjects.map(p => {
              const m = getMetrics(p.id);
              const sc = STATUS_DOT[p.status] || '#9CA3AF';
              return (
                <div key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(p.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => enterProject(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    transition: 'all 0.15s', userSelect: 'none',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F8FAFC'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {projectIcon(p.title)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, display: 'inline-block' }} />
                      <span>{m.total} 任务</span>
                      {m.overdue > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}>{m.overdue} 逾期</span>}
                      {m.done > 0 && <span style={{ color: '#10B981' }}>{m.done} 完成</span>}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              );
            })}
            {activeProjects.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#C4B5FD', fontSize: '13px' }}>
                拖入想法即可创建项目
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT: IDEAS ═══ */}
        <div
          style={{ ...columnStyle, ...dropActiveIdea }}
          onDragOver={e => handleDragOver(e, 'idea')}
          onDragLeave={handleDragLeave}
          onDrop={() => handleDrop('idea')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexShrink: 0 }}>
            <IconLightbulb width={18} height={18} color="#F59E0B" />
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>点子</span>
            <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '4px' }}>{ideaLibrary.length}</span>
          </div>

          {/* Drop hint */}
          {dragOverZone === 'idea' && (
            <div style={{
              padding: '10px', marginBottom: '8px', borderRadius: '10px',
              border: '2px dashed #FCD34D', background: '#FFFBEB',
              textAlign: 'center', fontSize: '12px', color: '#D97706', fontWeight: 500,
            }}>
              拖到这里转为点子
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {ideaLibrary.map(idea => {
              const badge = IDEA_BADGE[idea.status] || IDEA_BADGE.spark;
              return (
                <div key={idea.id}
                  draggable
                  onDragStart={() => handleDragStart(idea.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => enterIdea(idea.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                    transition: 'background 0.15s', userSelect: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <IconLightbulb width={14} height={14} color="#E0C97A" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {idea.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                    {idea.ai_category && (
                      <span style={{ padding: '2px 6px', background: '#F3F4F6', color: '#6B7280', fontSize: '10px', borderRadius: '4px', fontWeight: 500 }}>{idea.ai_category}</span>
                    )}
                    <span style={{ padding: '2px 6px', background: badge.bg, color: badge.text, fontSize: '10px', borderRadius: '4px', fontWeight: 600 }}>{badge.label}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              );
            })}
            {ideaLibrary.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#FCD34D', fontSize: '13px' }}>
                暂无点子
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
