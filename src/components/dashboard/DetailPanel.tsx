'use client';

import { useState } from 'react';
import { ExoNode } from '@/lib/types';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import { 
  IconFolder, IconLightbulb, IconTrash2, IconArrowLeft, IconSparkles, IconNetwork,
  IconBot, IconBookOpen, IconBox, IconBrain, IconPrinter, IconLayers,
  IconCircle, IconCircleCheck, IconClock, IconCalendar, IconCheckSquare
} from '@/components/ui/icons';

const STATUS_OPTIONS_IDEA = [
  { value: 'spark', label: '新想法', bg: '#EDE9FE', text: '#7C3AED' },
  { value: 'active', label: '待整理', bg: '#FFEDD5', text: '#EA580C' },
  { value: 'in_progress', label: '待评估', bg: '#FEF9C3', text: '#CA8A04' },
];

const STATUS_OPTIONS_PROJECT = [
  { value: 'active', label: 'Active', bg: '#D1FAE5', text: '#059669' },
  { value: 'in_progress', label: 'In Progress', bg: '#DBEAFE', text: '#2563EB' },
  { value: 'done', label: 'Done', bg: '#F3F4F6', text: '#6B7280' },
  { value: 'archived', label: 'Archived', bg: '#FEE2E2', text: '#DC2626' },
];

const CHILD_STATUS = [
  { value: 'todo', label: '待办', color: '#9CA3AF' },
  { value: 'doing', label: '进行中', color: '#3B82F6' },
  { value: 'in_progress', label: '进行中', color: '#3B82F6' },
  { value: 'done', label: '完成', color: '#10B981' },
  { value: 'spark', label: '想法', color: '#7C3AED' },
  { value: 'active', label: '活跃', color: '#F59E0B' },
];

function getProjectIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('myr2d2')) return <IconBot width={28} height={28} color="#7C3AED" />;
  if (t.includes('howtouse')) return <IconBookOpen width={28} height={28} color="#7C3AED" />;
  if (t.includes('skokartongen')) return <IconBox width={28} height={28} color="#7C3AED" />;
  if (t.includes('glantan')) return <IconBrain width={28} height={28} color="#7C3AED" />;
  if (t.includes('printer') || t.includes('3d')) return <IconPrinter width={28} height={28} color="#7C3AED" />;
  if (t.includes('nordloop')) return <IconLayers width={28} height={28} color="#7C3AED" />;
  return <IconFolder width={28} height={28} color="#7C3AED" />;
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date(); now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}

function daysLabel(days: number): { text: string; color: string } {
  if (days < 0) return { text: `逾期${Math.abs(days)}天`, color: '#EF4444' };
  if (days === 0) return { text: '今天', color: '#F59E0B' };
  if (days === 1) return { text: '明天', color: '#F59E0B' };
  if (days <= 7) return { text: `${days}天后`, color: '#3B82F6' };
  return { text: `${days}天后`, color: '#6B7280' };
}

function timelineGroup(days: number | null): string {
  if (days === null) return '📌 未设定日期';
  if (days < 0) return '🔴 已逾期';
  if (days === 0) return '⚡ 今天';
  if (days <= 2) return '🔜 近两天';
  if (days <= 7) return '📅 本周';
  if (days <= 14) return '🗓️ 下周';
  return '📆 更晚';
}

// Sort order for timeline groups
const GROUP_ORDER = ['🔴 已逾期', '⚡ 今天', '🔜 近两天', '📅 本周', '🗓️ 下周', '📆 更晚', '📌 未设定日期'];

interface DetailPanelProps {
  node: ExoNode;
  onClose: () => void;
}

export default function DetailPanel({ node, onClose }: DetailPanelProps) {
  const updateNode = useCosmosStore((s) => s.updateNode);
  const removeNode = useCosmosStore((s) => s.removeNode);
  const nodes = useCosmosStore((s) => s.nodes);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);

  const isIdea = node.type === 'idea';
  const isProject = node.type === 'project';
  const statusOptions = isIdea ? STATUS_OPTIONS_IDEA : STATUS_OPTIONS_PROJECT;
  const children = nodes.filter(n => n.parent_id === node.id);
  const createdDate = new Date(node.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Project timeline data
  const doneCount = children.filter(c => c.status === 'done').length;
  const totalCount = children.length;
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  // Group children by timeline
  const childrenWithDays = children.map(c => ({
    node: c,
    days: daysUntil(c.target_date) ?? daysUntil(c.ai_deadline),
  }));

  const timelineGroups = childrenWithDays.reduce<Record<string, typeof childrenWithDays>>((acc, item) => {
    const g = timelineGroup(item.days);
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  // Sort groups
  const sortedGroups = GROUP_ORDER
    .filter(g => timelineGroups[g]?.length)
    .map(g => ({ label: g, items: timelineGroups[g].sort((a, b) => (a.days ?? 999) - (b.days ?? 999)) }));

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    removeNode(node.id); onClose();
  };

  const handleConvertToProject = () => {
    updateNode(node.id, { type: 'project', status: 'active' }); onClose();
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== node.title) updateNode(node.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  const handleEnterMindmap = () => {
    onClose(); toggleFocusedSystem(node.id); setActiveView('Mindmap');
  };

  const toggleChildDone = (child: ExoNode) => {
    updateNode(child.id, { status: child.status === 'done' ? 'todo' as any : 'done' as any });
  };

  const panelWidth = isProject ? '560px' : '420px';

  const sLabel: React.CSSProperties = {
    fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 100 }} />

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: panelWidth,
        background: '#FFFFFF', zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', fontFamily: "'Inter', sans-serif",
        animation: 'slideIn 0.2s ease-out',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px', fontWeight: 500, color: '#475569', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
            <IconArrowLeft width={14} height={14} /> 返回
          </button>
          <span style={{ padding: '3px 10px', fontSize: '11px', fontWeight: 600, color: isIdea ? '#7C3AED' : '#2563EB', background: isIdea ? '#EDE9FE' : '#DBEAFE', borderRadius: '4px', textTransform: 'uppercase' }}>
            {node.type}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Icon + Title */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isIdea ? <IconLightbulb width={24} height={24} color="#7C3AED" /> : getProjectIcon(node.title)}
            </div>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={handleSaveTitle}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditing(false); }}
                  style={{ width: '100%', fontSize: '17px', fontWeight: 600, color: '#111827', border: '1px solid #C4B5FD', borderRadius: '8px', padding: '4px 8px', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                />
              ) : (
                <h2 onClick={() => { setEditTitle(node.title); setIsEditing(true); }} style={{ fontSize: '17px', fontWeight: 600, color: '#111827', margin: 0, cursor: 'text', lineHeight: 1.3 }} title="点击编辑">
                  {node.title}
                </h2>
              )}
              <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '3px' }}>创建于 {createdDate}</div>
            </div>
          </div>

          {/* Status + Priority row */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={sLabel}>状态</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {statusOptions.map(opt => (
                  <button key={opt.value} onClick={() => updateNode(node.id, { status: opt.value as any })} style={{
                    padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                    border: node.status === opt.value ? `2px solid ${opt.text}` : '2px solid transparent',
                    background: opt.bg, color: opt.text,
                  }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={sLabel}>优先级</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(p => (
                  <button key={p} onClick={() => updateNode(node.id, { ai_priority: p })} style={{
                    width: '32px', height: '32px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
                    border: node.ai_priority === p ? '2px solid #7C3AED' : '2px solid transparent',
                    background: node.ai_priority === p ? '#EDE9FE' : '#F3F4F6',
                    color: node.ai_priority === p ? '#7C3AED' : '#9CA3AF',
                  }}>
                    P{p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Date */}
          <div style={{ marginBottom: '20px' }}>
            <div style={sLabel}>目标日期</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="date" value={node.target_date ? new Date(node.target_date).toISOString().split('T')[0] : ''}
                onChange={e => updateNode(node.id, { target_date: e.target.value || null } as any)}
                style={{ padding: '5px 10px', fontSize: '12px', fontFamily: "'Inter', sans-serif", border: '1px solid #E5E7EB', borderRadius: '6px', color: '#374151', outline: 'none', background: '#F9FAFB' }}
              />
              {node.target_date && (() => {
                const d = daysUntil(node.target_date);
                if (d === null) return null;
                const dl = daysLabel(d);
                return <span style={{ fontSize: '12px', fontWeight: 500, color: dl.color }}>{dl.text}</span>;
              })()}
            </div>
          </div>

          {/* Category & Tags compact row */}
          {(node.ai_category || (node.ai_tags && node.ai_tags.length > 0)) && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {node.ai_category && (
                <div>
                  <div style={sLabel}>分类</div>
                  <span style={{ padding: '4px 10px', background: '#F3F4F6', color: '#4B5563', fontSize: '12px', borderRadius: '6px', fontWeight: 500 }}>{node.ai_category}</span>
                </div>
              )}
              {node.ai_tags && node.ai_tags.length > 0 && (
                <div>
                  <div style={sLabel}>标签</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {node.ai_tags.map(tag => (
                      <span key={tag} style={{ padding: '3px 8px', background: '#EDE9FE', color: '#7C3AED', fontSize: '10px', borderRadius: '4px', fontWeight: 500 }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {node.content && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sLabel}>描述</div>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.6, padding: '10px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                {node.content}
              </div>
            </div>
          )}

          {/* ═══════ PROJECT TIMELINE ═══════ */}
          {isProject && children.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {/* Progress header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IconClock width={16} height={16} color="#F59E0B" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>任务时间线</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{doneCount}/{totalCount} 完成</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#7C3AED' }}>{pct}%</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '3px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>

              {/* Timeline groups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedGroups.map(({ label, items }) => (
                  <div key={label}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px', letterSpacing: '0.3px' }}>
                      {label}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: '2px solid #E5E7EB', marginLeft: '6px', paddingLeft: '12px' }}>
                      {items.map(({ node: child, days }) => {
                        const isDone = child.status === 'done';
                        const statusInfo = CHILD_STATUS.find(s => s.value === child.status);
                        const dl = days !== null ? daysLabel(days) : null;
                        const isEditingDate = editingDateId === child.id;

                        return (
                          <div key={child.id} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '7px 10px', borderRadius: '8px', transition: 'background 0.15s',
                            opacity: isDone ? 0.55 : 1,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            {/* Toggle done */}
                            <button onClick={() => toggleChildDone(child)} title={isDone ? '标记未完成' : '标记完成'} style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                              color: isDone ? '#10B981' : '#D1D5DB', transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => { if (!isDone) e.currentTarget.style.color = '#10B981'; }}
                            onMouseLeave={e => { if (!isDone) e.currentTarget.style.color = '#D1D5DB'; }}
                            >
                              {isDone ? <IconCircleCheck width={16} height={16} /> : <IconCircle width={16} height={16} />}
                            </button>

                            {/* Title + type badge */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '13px', fontWeight: 500, color: isDone ? '#9CA3AF' : '#111827',
                                textDecoration: isDone ? 'line-through' : 'none',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {child.title}
                              </div>
                            </div>

                            {/* Status pill */}
                            {statusInfo && (
                              <span style={{
                                fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                                color: statusInfo.color, background: `${statusInfo.color}15`,
                              }}>
                                {statusInfo.label}
                              </span>
                            )}

                            {/* Date badge or date picker */}
                            {isEditingDate ? (
                              <input type="date" autoFocus
                                value={child.target_date ? new Date(child.target_date).toISOString().split('T')[0] : ''}
                                onChange={e => { updateNode(child.id, { target_date: e.target.value || null } as any); }}
                                onBlur={() => setEditingDateId(null)}
                                style={{ width: '130px', padding: '3px 6px', fontSize: '11px', border: '1px solid #C4B5FD', borderRadius: '4px', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                              />
                            ) : (
                              <button onClick={() => setEditingDateId(child.id)} title="设置日期" style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                                fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.15s',
                                color: dl ? dl.color : '#D1D5DB',
                                ...(dl && days !== null && days < 0 ? { background: '#FEF2F2' } : {}),
                              }}
                              onMouseEnter={e => { if (!dl) e.currentTarget.style.color = '#7C3AED'; }}
                              onMouseLeave={e => { if (!dl) e.currentTarget.style.color = '#D1D5DB'; }}
                              >
                                <IconCalendar width={11} height={11} />
                                {dl ? dl.text : '设日期'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty project state */}
          {isProject && children.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
              暂无子任务 — 在脑图中添加
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {isIdea && (
            <button onClick={handleConvertToProject} style={{ width: '100%', padding: '9px', fontSize: '13px', fontWeight: 600, color: '#FFFFFF', background: '#7C3AED', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#6D28D9'} onMouseLeave={e => e.currentTarget.style.background = '#7C3AED'}>
              <IconSparkles width={16} height={16} /> 转为项目
            </button>
          )}
          <button onClick={handleEnterMindmap} style={{ width: '100%', padding: '9px', fontSize: '13px', fontWeight: 600, color: '#7C3AED', background: '#F5F3FF', border: '1px solid #E9D5FF', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDE9FE'} onMouseLeave={e => e.currentTarget.style.background = '#F5F3FF'}>
            <IconNetwork width={16} height={16} /> 进入脑图
          </button>
          <button onClick={handleDelete} style={{ width: '100%', padding: '9px', fontSize: '13px', fontWeight: 600, color: confirmDelete ? '#FFFFFF' : '#EF4444', background: confirmDelete ? '#EF4444' : 'rgba(239,68,68,0.08)', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}>
            <IconTrash2 width={16} height={16} /> {confirmDelete ? '确认删除' : '删除'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
