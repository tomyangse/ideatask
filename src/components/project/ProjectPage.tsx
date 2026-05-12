'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import GanttView from './GanttView';
import {
  IconArrowLeft, IconNetwork, IconClock, IconTrash2,
  IconBot, IconBookOpen, IconBox, IconBrain, IconPrinter, IconLayers, IconFolder
} from '@/components/ui/icons';

const CosmosCanvas = dynamic(
  () => import('@/components/cosmos/CosmosCanvas'),
  { ssr: false }
);

function projectIcon(title: string) {
  const t = title.toLowerCase(); const c = '#7C3AED'; const s = 22;
  if (t.includes('myr2d2')) return <IconBot width={s} height={s} color={c} />;
  if (t.includes('howtouse')) return <IconBookOpen width={s} height={s} color={c} />;
  if (t.includes('skokartongen')) return <IconBox width={s} height={s} color={c} />;
  if (t.includes('glantan')) return <IconBrain width={s} height={s} color={c} />;
  if (t.includes('printer') || t.includes('3d')) return <IconPrinter width={s} height={s} color={c} />;
  if (t.includes('nordloop')) return <IconLayers width={s} height={s} color={c} />;
  return <IconFolder width={s} height={s} color={c} />;
}

interface ProjectPageProps {
  projectId: string;
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
  const project = useCosmosStore((s) => s.getNodeById(projectId));
  const nodes = useCosmosStore((s) => s.nodes);
  const removeNode = useCosmosStore((s) => s.removeNode);
  const exitProject = useUIStore((s) => s.exitProject);
  const projectView = useUIStore((s) => s.projectView);
  const setProjectView = useUIStore((s) => s.setProjectView);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);

  // Ensure mindmap is focused on this project when in mindmap view
  const handleMindmap = () => {
    if (focusedSystemId !== projectId) toggleFocusedSystem(projectId);
    setProjectView('mindmap');
  };

  const handleTimeline = () => {
    setProjectView('timeline');
  };

  const handleBack = () => {
    if (focusedSystemId) toggleFocusedSystem(focusedSystemId);
    exitProject();
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto-reset after 3s
      return;
    }
    removeNode(projectId);
    exitProject();
  };

  if (!project) return null;

  const children = nodes.filter(n => n.parent_id === projectId);
  const done = children.filter(n => n.status === 'done').length;
  const total = children.length;

  const views = [
    { id: 'mindmap' as const, label: '导图', icon: <IconNetwork width={15} height={15} />, handler: handleMindmap },
    { id: 'timeline' as const, label: '时间线', icon: <IconClock width={15} height={15} />, handler: handleTimeline },
  ];

  return (
    <>
      {/* Project top bar */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, right: 0, height: '64px', zIndex: 39,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Left: back + project info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={handleBack} style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
            fontSize: '13px', fontWeight: 500, color: '#475569', background: '#F8FAFC',
            border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#C4B5FD'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            <IconArrowLeft width={14} height={14} /> 返回
          </button>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {projectIcon(project.title)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px' }}>{project.title}</div>
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>{done}/{total} 任务完成</div>
            </div>
          </div>

          {/* Delete button */}
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="删除项目" style={{
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

        {/* Right: view toggle */}
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: '10px', padding: '3px' }}>
          {views.map(v => (
            <button key={v.id} onClick={v.handler} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, transition: 'all 0.2s',
              background: projectView === v.id ? '#FFFFFF' : 'transparent',
              color: projectView === v.id ? '#7C3AED' : '#6B7280',
              boxShadow: projectView === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      {projectView === 'mindmap' && <CosmosCanvas />}
      {projectView === 'timeline' && <GanttView projectId={projectId} />}
    </>
  );
}
