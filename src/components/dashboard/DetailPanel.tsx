'use client';

import { useState } from 'react';
import { ExoNode } from '@/lib/types';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import { 
  IconFolder, IconLightbulb, IconTrash2, IconArrowLeft, IconSparkles, IconNetwork,
  IconBot, IconBookOpen, IconBox, IconBrain, IconPrinter, IconLayers
} from '@/components/ui/icons';

const STATUS_OPTIONS_IDEA = [
  { value: 'spark', label: '新想法', bg: '#EDE9FE', text: '#7C3AED' },
  { value: 'todo', label: '待整理', bg: '#FFEDD5', text: '#EA580C' },
  { value: 'open', label: '待评估', bg: '#FEF9C3', text: '#CA8A04' },
];

const STATUS_OPTIONS_PROJECT = [
  { value: 'active', label: 'Active', bg: '#D1FAE5', text: '#059669' },
  { value: 'planning', label: 'Planning', bg: '#DBEAFE', text: '#2563EB' },
  { value: 'paused', label: 'Paused', bg: '#F3F4F6', text: '#6B7280' },
  { value: 'blocked', label: 'Blocked', bg: '#FEE2E2', text: '#DC2626' },
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

  const isIdea = node.type === 'idea';
  const isProject = node.type === 'project';
  const statusOptions = isIdea ? STATUS_OPTIONS_IDEA : STATUS_OPTIONS_PROJECT;
  const children = nodes.filter(n => n.parent_id === node.id);
  const createdDate = new Date(node.created_at).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeNode(node.id);
    onClose();
  };

  const handleConvertToProject = () => {
    updateNode(node.id, { type: 'project', status: 'planning' });
    onClose();
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== node.title) {
      updateNode(node.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleEnterMindmap = () => {
    onClose();
    toggleFocusedSystem(node.id);
    setActiveView('Mindmap');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.2)',
          zIndex: 100,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        background: '#FFFFFF',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.08)',
        fontFamily: "'Inter', sans-serif",
        animation: 'slideIn 0.2s ease-out',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <IconArrowLeft width={14} height={14} /> 返回
          </button>
          <span style={{
            padding: '3px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: isIdea ? '#7C3AED' : '#2563EB',
            background: isIdea ? '#EDE9FE' : '#DBEAFE',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            {node.type}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Icon + Title */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#F5F3FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isIdea
                ? <IconLightbulb width={28} height={28} color="#7C3AED" />
                : getProjectIcon(node.title)
              }
            </div>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditing(false); }}
                  style={{
                    width: '100%',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    border: '1px solid #C4B5FD',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
              ) : (
                <h2
                  onClick={() => { setEditTitle(node.title); setIsEditing(true); }}
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0,
                    cursor: 'text',
                    lineHeight: 1.4,
                  }}
                  title="点击编辑标题"
                >
                  {node.title}
                </h2>
              )}
              <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
                创建于 {createdDate}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              状态
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateNode(node.id, { status: opt.value as any })}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: node.status === opt.value ? `2px solid ${opt.text}` : '2px solid transparent',
                    background: opt.bg,
                    color: opt.text,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {node.ai_category && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                分类
              </div>
              <span style={{
                padding: '5px 12px',
                background: '#F3F4F6',
                color: '#4B5563',
                fontSize: '13px',
                borderRadius: '6px',
                fontWeight: 500,
              }}>
                {node.ai_category}
              </span>
            </div>
          )}

          {/* Content / Description */}
          {node.content && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                描述
              </div>
              <div style={{
                fontSize: '13px',
                color: '#374151',
                lineHeight: 1.6,
                padding: '12px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #F3F4F6',
              }}>
                {node.content}
              </div>
            </div>
          )}

          {/* Tags */}
          {node.ai_tags && node.ai_tags.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                标签
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {node.ai_tags.map(tag => (
                  <span key={tag} style={{
                    padding: '3px 10px',
                    background: '#EDE9FE',
                    color: '#7C3AED',
                    fontSize: '11px',
                    borderRadius: '4px',
                    fontWeight: 500,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Children (for projects) */}
          {isProject && children.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                子项目 ({children.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {children.map(child => (
                  <div key={child.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#374151',
                    background: '#F9FAFB',
                    borderRadius: '6px',
                  }}>
                    <span style={{ color: '#9CA3AF' }}>↳</span>
                    {child.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0,
        }}>
          {/* Convert to project (only for ideas) */}
          {isIdea && (
            <button
              onClick={handleConvertToProject}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#7C3AED',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#6D28D9'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#7C3AED'}
            >
              <IconSparkles width={16} height={16} />
              转为项目
            </button>
          )}

          {/* Enter Mindmap */}
          <button
            onClick={handleEnterMindmap}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#7C3AED',
              background: '#F5F3FF',
              border: '1px solid #E9D5FF',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EDE9FE'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5F3FF'}
          >
            <IconNetwork width={16} height={16} />
            进入脑图
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: confirmDelete ? '#FFFFFF' : '#EF4444',
              background: confirmDelete ? '#EF4444' : 'rgba(239, 68, 68, 0.08)',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s',
            }}
          >
            <IconTrash2 width={16} height={16} />
            {confirmDelete ? '确认删除' : '删除'}
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
