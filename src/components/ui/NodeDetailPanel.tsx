'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';
import { ExoNode, NodeStatus } from '@/lib/types';
import styles from './NodeDetailPanel.module.css';

const TYPE_ICONS: Record<string, string> = {
  idea: '💡',
  project: '🚀',
  task: '⚡',
  subtask: '🔧',
};

const STATUS_LABELS: Record<NodeStatus, string> = {
  spark: '✨ Spark',
  active: '🟢 Active',
  in_progress: '🔵 In Progress',
  done: '✅ Done',
  archived: '🌑 Archived',
  planning: '📋 Planning',
  paused: '⏸️ Paused',
  blocked: '🔴 Blocked',
  open: '📂 Open',
  todo: '📝 Todo',
  doing: '🔧 Doing',
};

export default function NodeDetailPanel() {
  const isOpen = useUIStore((s) => s.isDetailPanelOpen);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  const getChildNodes = useCosmosStore((s) => s.getChildNodes);
  const updateNode = useCosmosStore((s) => s.updateNode);
  const removeNode = useCosmosStore((s) => s.removeNode);
  const selectNode = useUIStore((s) => s.selectNode);

  const node = selectedNodeId ? getNodeById(selectedNodeId) : undefined;
  const childNodes = selectedNodeId ? getChildNodes(selectedNodeId) : [];

  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editStatus, setEditStatus] = useState<NodeStatus>('spark');
  const [editGoal, setEditGoal] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');

  useEffect(() => {
    if (node) {
      setEditTitle(node.title);
      setEditContent(node.content || '');
      setEditStatus(node.status);
      setEditGoal(node.goal || '');
      setEditTargetDate(node.target_date || '');
    }
  }, [node]);

  const handleSave = useCallback(() => {
    if (!selectedNodeId) return;
    updateNode(selectedNodeId, {
      title: editTitle,
      content: editContent,
      status: editStatus,
      updated_at: new Date().toISOString(),
    });
  }, [selectedNodeId, editTitle, editContent, editStatus, updateNode]);

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const handleDelete = useCallback(() => {
    if (!selectedNodeId) return;
    if (confirm('Delete this node?')) {
      removeNode(selectedNodeId);
      deselectNode();
    }
  }, [selectedNodeId, removeNode, deselectNode]);

  const handleStartTask = useCallback(() => {
    if (!node) return;
    updateNode(node.id, {
      type: 'task' as any,
      status: 'in_progress',
      goal: editGoal || node.title,
      target_date: editTargetDate || null,
      updated_at: new Date().toISOString(),
    });
  }, [node, editGoal, editTargetDate, updateNode]);

  const handleRevertToIdea = useCallback(() => {
    if (!node) return;
    updateNode(node.id, {
      type: 'idea' as any,
      status: 'spark',
      updated_at: new Date().toISOString(),
    });
  }, [node, updateNode]);

  return (
    <AnimatePresence>
      {isOpen && node && (
        <motion.div
          className={styles.overlay}
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.typeIcon}>
                {TYPE_ICONS[node.type] || '⭐'}
              </span>
              <span className={styles.title}>
                {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
              </span>
            </div>
            <button
              className={styles.closeButton}
              onClick={deselectNode}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Title */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Title</span>
              <input
                className={styles.titleInput}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleBlur}
                placeholder="Untitled idea..."
              />
            </div>

            {/* Status */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Status</span>
              <select
                className={styles.statusSelect}
                value={editStatus}
                onChange={(e) => {
                  setEditStatus(e.target.value as NodeStatus);
                  updateNode(node.id, {
                    status: e.target.value as NodeStatus,
                    updated_at: new Date().toISOString(),
                  });
                }}
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Notes</span>
              <textarea
                className={styles.editArea}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleBlur}
                placeholder="Add details, notes, context..."
              />
            </div>

            {/* Tags */}
            {node.ai_tags && node.ai_tags.length > 0 && (
              <div className={styles.section}>
                <span className={styles.sectionLabel}>Tags</span>
                <div className={styles.tags}>
                  {node.ai_tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Child nodes list (read-only, click to drill in) */}
            {childNodes.length > 0 && (
              <div className={styles.section}>
                <span className={styles.sectionLabel}>
                  Sub-ideas <span className={styles.childCount}>{childNodes.length}</span>
                </span>
                <div className={styles.childList}>
                  {childNodes.map((child) => (
                    <button
                      key={child.id}
                      className={styles.childItem}
                      onClick={() => selectNode(child.id)}
                    >
                      <span className={styles.childIcon}>
                        {TYPE_ICONS[child.type] || '📝'}
                      </span>
                      <span className={styles.childTitle}>{child.title}</span>
                      <span className={styles.childStatus} style={{
                        background: child.status === 'done' ? '#22C55E'
                          : child.status === 'active' || child.status === 'in_progress' ? '#3B82F6'
                          : '#F59E0B',
                      }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Goal & Target Date (task-only fields) */}
            {node.type === 'task' && (
              <>
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>🎯 Goal</span>
                  <input
                    className={styles.titleInput}
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    onBlur={() => {
                      if (node && editGoal !== (node.goal || '')) {
                        updateNode(node.id, { goal: editGoal || null, updated_at: new Date().toISOString() });
                      }
                    }}
                    placeholder="What does 'done' look like?"
                  />
                </div>
                <div className={styles.section}>
                  <span className={styles.sectionLabel}>📅 Target Date</span>
                  <input
                    type="date"
                    className={styles.titleInput}
                    value={editTargetDate}
                    onChange={(e) => {
                      setEditTargetDate(e.target.value);
                      updateNode(node.id, { target_date: e.target.value || null, updated_at: new Date().toISOString() });
                    }}
                  />
                </div>
              </>
            )}

            {/* Meta info */}
            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category</span>
                <span className={styles.metaValue}>
                  {node.ai_category || 'Unclassified'}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Priority</span>
                <span className={styles.metaValue}>
                  {'⭐'.repeat(node.ai_priority || 3)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            {node.type === 'project' && (
              <button 
                className={styles.evolveButton} 
                onClick={() => toggleFocusedSystem(node.id)}
              >
                {focusedSystemId === node.id ? '🌌 Exit Mindmap' : '🗺️ Enter Mindmap'}
              </button>
            )}
            {node.type === 'idea' && (
              <button className={styles.startTaskButton} onClick={handleStartTask}>
                ▶ 开始做
              </button>
            )}
            {node.type === 'task' && (
              <button className={styles.revertButton} onClick={handleRevertToIdea}>
                💡 退回点子
              </button>
            )}
            <button
              className={styles.deleteButton}
              onClick={handleDelete}
              aria-label="Delete node"
            >
              🗑️
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
