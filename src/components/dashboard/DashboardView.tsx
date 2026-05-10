'use client';

import { useState } from 'react';
import { useCosmosStore } from '@/stores/cosmosStore';
import { ExoNode } from '@/lib/types';
import DetailPanel from './DetailPanel';
import { 
  IconFolder, IconLightbulb, IconBot, IconBookOpen, IconBox, 
  IconBrain, IconPrinter, IconLayers 
} from '@/components/ui/icons';

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  planning: '#3B82F6',
  paused: '#9CA3AF',
  blocked: '#EF4444',
  in_progress: '#10B981',
  doing: '#10B981',
  spark: '#7C3AED',
};

const IDEA_STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  spark: { bg: '#EDE9FE', text: '#7C3AED', label: '新想法' },
  todo: { bg: '#FFEDD5', text: '#EA580C', label: '待整理' },
  open: { bg: '#FEF9C3', text: '#CA8A04', label: '待评估' },
};

function getProjectIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('myr2d2')) return <IconBot width={22} height={22} color="#7C3AED" />;
  if (t.includes('howtouse')) return <IconBookOpen width={22} height={22} color="#7C3AED" />;
  if (t.includes('skokartongen')) return <IconBox width={22} height={22} color="#7C3AED" />;
  if (t.includes('glantan')) return <IconBrain width={22} height={22} color="#7C3AED" />;
  if (t.includes('printer') || t.includes('3d')) return <IconPrinter width={22} height={22} color="#7C3AED" />;
  if (t.includes('nordloop')) return <IconLayers width={22} height={22} color="#7C3AED" />;
  return <IconFolder width={22} height={22} color="#7C3AED" />;
}

export default function DashboardView() {
  const nodes = useCosmosStore((s) => s.nodes);
  const [selectedNode, setSelectedNode] = useState<ExoNode | null>(null);
  
  // Active Projects: type=project, not archived/done
  const activeProjects = nodes.filter(
    (n) => n.type === 'project' && !['archived', 'done'].includes(n.status)
  );

  // Idea Library: type=idea, only unstarted statuses
  const ideaLibrary = nodes.filter(
    (n) => n.type === 'idea' && ['spark', 'todo', 'open'].includes(n.status)
  );

  // Derived metrics for a project
  const getProjectMetrics = (projectId: string) => {
    const children = nodes.filter(n => n.parent_id === projectId);
    const ideas = children.filter(n => n.type === 'idea').length;
    const tasks = children.filter(n => n.type === 'task').length;
    const nextTask = children.find(n => n.type === 'task' && !['done', 'archived'].includes(n.status));
    return {
      ideasCount: ideas,
      tasksCount: tasks,
      nextStep: nextTask ? nextTask.title : '—'
    };
  };

  return (
    <div style={{
      position: 'fixed',
      top: '64px',
      left: 0,
      right: 0,
      bottom: 0,
      background: '#F8FAFC',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Spacer for filter bar */}
      <div style={{ height: '56px', flexShrink: 0 }} />

      {/* Main content area - fills remaining space, no scroll */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0 32px',
        gap: '16px',
        overflow: 'hidden',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
      }}>

        {/* ========== ACTIVE PROJECTS SECTION ========== */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '20px 24px',
          flexShrink: 0,
        }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconFolder width={18} height={18} color="#6B7280" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>正在执行的项目</span>
            <span style={{ fontSize: '13px', color: '#9CA3AF', marginLeft: '4px' }}>{activeProjects.length} 个项目</span>
          </div>

          {/* Project cards grid - always 3 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
            {activeProjects.slice(0, 6).map(project => {
              const metrics = getProjectMetrics(project.id);
              const statusColor = STATUS_COLORS[project.status] || '#9CA3AF';
              const statusLabel = project.status === 'in_progress' ? 'Active' : project.status.charAt(0).toUpperCase() + project.status.slice(1);
              
              return (
                <div key={project.id} style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C4B5FD';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedNode(project)}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#F5F3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {getProjectIcon(project.title)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                      {statusLabel}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '2px' }}>
                      {metrics.ideasCount} ideas · {metrics.tasksCount} tasks
                    </div>
                    <div style={{ fontSize: '12px', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ color: '#9CA3AF' }}>Next: </span>
                      <span style={{ fontWeight: 500 }}>{metrics.nextStep}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========== IDEA LIBRARY SECTION ========== */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '16px 24px',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexShrink: 0 }}>
            <IconLightbulb width={18} height={18} color="#7C3AED" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>想法库</span>
            <span style={{ fontSize: '13px', color: '#9CA3AF', marginLeft: '4px' }}>{ideaLibrary.length} 个想法</span>
          </div>

          {/* Idea rows - 2 columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '4px',
            flex: 1,
            alignContent: 'start',
            overflow: 'hidden',
          }}>
            {ideaLibrary.map(idea => {
              const badge = IDEA_STATUS_BADGE[idea.status] || IDEA_STATUS_BADGE['spark'];
              
              return (
                <div key={idea.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => setSelectedNode(idea)}
                >
                  <IconLightbulb width={16} height={16} color="#7C3AED" style={{ flexShrink: 0 }} />
                  
                  <div style={{ flex: 1, fontSize: '13px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {idea.title}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {idea.ai_category && (
                      <span style={{
                        padding: '3px 8px',
                        background: '#F3F4F6',
                        color: '#6B7280',
                        fontSize: '11px',
                        borderRadius: '4px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <IconFolder width={12} height={12} />
                        {idea.ai_category}
                      </span>
                    )}
                    
                    <span style={{
                      padding: '3px 8px',
                      background: badge.bg,
                      color: badge.text,
                      fontSize: '11px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom spacer for Capture button */}
      <div style={{ height: '64px', flexShrink: 0 }} />

      {/* Detail Panel */}
      {selectedNode && (
        <DetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}
