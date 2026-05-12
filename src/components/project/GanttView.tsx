'use client';

import { useState, useMemo } from 'react';
import { useCosmosStore } from '@/stores/cosmosStore';
import { ExoNode } from '@/lib/types';
import { IconCircle, IconCircleCheck, IconCalendar } from '@/components/ui/icons';

/* ── helpers ── */

function toDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : toDay(d);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function formatDate(d: Date): string {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${m}/${day}`;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/* Status colors */
const STATUS_COLOR: Record<string, string> = {
  done: '#10B981', doing: '#3B82F6', in_progress: '#3B82F6',
  todo: '#9CA3AF', spark: '#7C3AED', active: '#F59E0B',
  blocked: '#EF4444', paused: '#9CA3AF',
};

const STATUS_LABEL: Record<string, string> = {
  done: '完成', doing: '进行中', in_progress: '进行中',
  todo: '待办', spark: '想法', active: '活跃', blocked: '阻塞', paused: '暂停',
};

/* ══════════════════════════════════════════ */

interface GanttViewProps {
  projectId: string;
}

export default function GanttView({ projectId }: GanttViewProps) {
  const nodes = useCosmosStore((s) => s.nodes);
  const updateNode = useCosmosStore((s) => s.updateNode);
  const [editingId, setEditingId] = useState<string | null>(null);

  const children = nodes.filter(n => n.parent_id === projectId);

  // Build task data
  const tasks = useMemo(() => children.map(c => {
    const start = parseDate(c.created_at) ?? toDay(new Date());
    const end = parseDate(c.target_date) ?? parseDate(c.ai_deadline);
    return { node: c, start, end };
  }), [children]);

  // Calculate timeline range
  const today = toDay(new Date());
  const { rangeStart, rangeEnd, totalDays } = useMemo(() => {
    let earliest = today;
    let latest = addDays(today, 14); // minimum 2 weeks

    for (const t of tasks) {
      if (t.start < earliest) earliest = t.start;
      if (t.end && t.end > latest) latest = t.end;
      if (t.end && t.end < earliest) earliest = t.end;
    }

    // Add padding
    const rs = addDays(earliest, -2);
    const re = addDays(latest, 5);
    return { rangeStart: rs, rangeEnd: re, totalDays: Math.max(diffDays(rs, re), 14) };
  }, [tasks, today]);

  // Generate date markers
  const dateMarkers = useMemo(() => {
    const markers: { date: Date; label: string; isToday: boolean; isMonday: boolean }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = addDays(rangeStart, i);
      const isToday = d.getTime() === today.getTime();
      const isMonday = d.getDay() === 1;
      // Show every monday, today, and first/last
      if (isMonday || isToday || i === 0 || i === totalDays) {
        markers.push({ date: d, label: formatDate(d), isToday, isMonday });
      }
    }
    return markers;
  }, [rangeStart, totalDays, today]);

  const dayToPercent = (d: Date): number => {
    const diff = diffDays(rangeStart, d);
    return (diff / totalDays) * 100;
  };

  const todayPct = dayToPercent(today);

  const toggleDone = (n: ExoNode) => {
    updateNode(n.id, { status: (n.status === 'done' ? 'todo' : 'done') as any });
  };

  return (
    <div style={{
      position: 'fixed', top: '128px', left: 0, right: 0, bottom: 0,
      background: '#FFFFFF', fontFamily: "'Inter', sans-serif",
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        {/* Task name column header */}
        <div style={{ width: '360px', flexShrink: 0, padding: '10px 20px', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', borderRight: '1px solid #F3F4F6' }}>
          任务
        </div>
        {/* Timeline header */}
        <div style={{ flex: 1, position: 'relative', height: '36px', overflow: 'hidden' }}>
          {dateMarkers.map((m, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${dayToPercent(m.date)}%`, top: 0, bottom: 0,
              display: 'flex', alignItems: 'center', transform: 'translateX(-50%)',
            }}>
              <span style={{
                fontSize: '10px', fontWeight: m.isToday ? 700 : 500,
                color: m.isToday ? '#7C3AED' : '#9CA3AF',
                whiteSpace: 'nowrap',
              }}>
                {m.isToday ? '今天' : m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task rows */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tasks.length === 0 && (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            暂无子任务 — 在导图中添加
          </div>
        )}

        {tasks.map(({ node: t, start, end }) => {
          const isDone = t.status === 'done';
          const sc = STATUS_COLOR[t.status] || '#9CA3AF';
          const sl = STATUS_LABEL[t.status] || t.status;
          const isOverdue = end && !isDone && end < today;

          // Bar position
          const barStart = end ? Math.min(dayToPercent(start), dayToPercent(end)) : dayToPercent(start);
          const barEnd = end ? dayToPercent(end) : dayToPercent(start);
          const barWidth = Math.max(barEnd - barStart, 0.5); // min width for visibility
          const barColor = isOverdue ? '#EF4444' : isDone ? '#10B981' : sc;

          return (
            <div key={t.id} style={{
              display: 'flex', borderBottom: '1px solid #F3F4F6',
              opacity: isDone ? 0.5 : 1, transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Task info column */}
              <div style={{ width: '360px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRight: '1px solid #F3F4F6' }}>
                <button onClick={() => toggleDone(t)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                  color: isDone ? '#10B981' : '#D1D5DB', transition: 'color 0.15s',
                }}
                onMouseEnter={e => { if (!isDone) e.currentTarget.style.color = '#10B981'; }}
                onMouseLeave={e => { if (!isDone) e.currentTarget.style.color = isDone ? '#10B981' : '#D1D5DB'; }}
                >
                  {isDone ? <IconCircleCheck width={16} height={16} /> : <IconCircle width={16} height={16} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px', fontWeight: 500, color: isDone ? '#9CA3AF' : '#111827',
                    textDecoration: isDone ? 'line-through' : 'none',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4',
                  }}>
                    {t.title}
                  </div>
                </div>

                <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', color: sc, background: `${sc}15`, flexShrink: 0 }}>
                  {sl}
                </span>

                {/* Idea → Task conversion */}
                {(t.type === 'idea' || t.status === 'spark') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateNode(t.id, {
                        type: 'task' as any,
                        status: 'in_progress',
                        goal: t.title,
                        target_date: new Date().toISOString().slice(0, 10),
                        updated_at: new Date().toISOString(),
                      });
                    }}
                    title="将想法转为任务并开始实施"
                    style={{
                      background: '#3B82F6', border: 'none', cursor: 'pointer',
                      padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
                      fontSize: '10px', fontWeight: 600, color: '#fff',
                      transition: 'background 0.15s', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2563EB'}
                    onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
                  >
                    ▶ 开始
                  </button>
                )}

                {/* Date edit */}
                {editingId === t.id ? (
                  <input type="date" autoFocus
                    value={t.target_date ? new Date(t.target_date).toISOString().split('T')[0] : ''}
                    onChange={e => updateNode(t.id, { target_date: e.target.value || null } as any)}
                    onBlur={() => setEditingId(null)}
                    style={{ width: '120px', padding: '2px 4px', fontSize: '10px', border: '1px solid #C4B5FD', borderRadius: '4px', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                  />
                ) : (
                  <button onClick={() => setEditingId(t.id)} title="设置截止日期" style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0,
                    color: isOverdue ? '#EF4444' : end ? '#6B7280' : '#D1D5DB', fontSize: '10px',
                    display: 'flex', alignItems: 'center', gap: '2px', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'}
                  onMouseLeave={e => e.currentTarget.style.color = isOverdue ? '#EF4444' : end ? '#6B7280' : '#D1D5DB'}
                  >
                    <IconCalendar width={11} height={11} />
                    {end ? formatDate(end) : '设日期'}
                  </button>
                )}
              </div>

              {/* Timeline bar column */}
              <div style={{ flex: 1, position: 'relative', height: '44px' }}>
                {/* Today line */}
                <div style={{
                  position: 'absolute', left: `${todayPct}%`, top: 0, bottom: 0,
                  width: '1px', background: '#E9D5FF', zIndex: 1,
                }} />

                {/* Task bar */}
                {end ? (
                  <div style={{
                    position: 'absolute', left: `${barStart}%`, width: `${barWidth}%`,
                    top: '14px', height: '16px', borderRadius: '4px',
                    background: barColor, opacity: 0.8,
                    minWidth: '6px', transition: 'all 0.2s',
                  }}
                  title={`${formatDate(start)} → ${formatDate(end)}`}
                  />
                ) : (
                  /* No end date: show diamond marker at start */
                  <div style={{
                    position: 'absolute', left: `${dayToPercent(start)}%`, top: '16px',
                    width: '10px', height: '10px', borderRadius: '2px',
                    background: sc, opacity: 0.6,
                    transform: 'translateX(-50%) rotate(45deg)',
                  }}
                  title={`创建于 ${formatDate(start)} — 未设截止日期`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
