'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';
import { ExoNode } from '@/lib/types';

export default function NodePopover() {
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const isDetailPanelOpen = useUIStore((s) => s.isDetailPanelOpen);
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  const addNode = useCosmosStore((s) => s.addNode);
  const addSpawningNode = useUIStore((s) => s.addSpawningNode);

  const [value, setValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [justAdded, setJustAdded] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const node = selectedNodeId ? getNodeById(selectedNodeId) : undefined;

  // Auto-focus when panel opens
  useEffect(() => {
    if (isDetailPanelOpen && node) {
      setValue('');
      setJustAdded([]);
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [isDetailPanelOpen, selectedNodeId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (!text || isProcessing || !node) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/ai/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text, parentTitle: node.title }),
      });

      let ideas: any[] = [];
      if (response.ok) {
        const data = await response.json();
        ideas = data.ideas || [];
      }

      if (ideas.length === 0) {
        // Fallback: create one node
        ideas = [{
          id: crypto.randomUUID(),
          title: text.slice(0, 60),
          summary: null,
          tags: [],
          category: 'other',
          priority: 3,
          color: node.color || '#7C3AED',
        }];
      }

      const existingSiblings = useCosmosStore.getState().nodes.filter(
        n => n.parent_id === node.id
      ).length;

      const newTitles: string[] = [];

      ideas.forEach((idea: any, i: number) => {
        const siblingIndex = existingSiblings + i;
        const totalSiblings = existingSiblings + ideas.length;
        const totalHeight = (totalSiblings - 1) * 14;
        const startY = totalHeight / 2;

        const newNode: ExoNode = {
          id: idea.id || crypto.randomUUID(),
          user_id: '',
          type: 'task',
          status: 'spark',
          title: idea.title || text.slice(0, 60),
          content: text,
          summary: idea.summary || null,
          parent_id: node.id,
          ai_tags: idea.tags || [],
          ai_category: idea.category || node.ai_category || 'other',
          ai_priority: idea.priority || 3,
          ai_deadline: null,
          pos_x: node.pos_x + 35,
          pos_y: node.pos_y + startY - siblingIndex * 14,
          pos_z: 0,
          color: idea.color || node.color || '#7C3AED',
          size: 0.8,
          brightness: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          evolved_from: null,
          evolved_at: null,
          goal: null,
          target_date: null,
        };

        addNode(newNode);
        addSpawningNode(newNode.id);
        newTitles.push(newNode.title);
      });

      setJustAdded(prev => [...prev, ...newTitles]);
      setValue('');
      setTimeout(() => textareaRef.current?.focus(), 50);

      // Clear "just added" feedback after a few seconds
      setTimeout(() => setJustAdded([]), 4000);
    } catch (error) {
      console.error('Failed to expand ideas:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [value, isProcessing, node, addNode, addSpawningNode]);

  if (!isDetailPanelOpen || !node) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '440px',
      transform: 'translateY(-50%)',
      zIndex: 95,
      width: '320px',
      animation: 'popoverIn 250ms cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Minimal popover card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
      }}>
        {/* Context hint */}
        <div style={{
          padding: '10px 16px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ fontSize: '12px' }}>💡</span>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: '0.03em',
          }}>
            Brainstorm for
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#1E293B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px',
          }}>
            {node.title}
          </span>
        </div>

        {/* Textarea */}
        <div style={{ padding: '4px 12px 12px' }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type ideas... (multiple ideas will auto-split)"
            disabled={isProcessing}
            style={{
              width: '100%',
              minHeight: '60px',
              maxHeight: '200px',
              padding: '10px 12px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1E293B',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 200ms',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#A78BFA';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E2E8F0';
            }}
          />
        </div>

        {/* Footer: submit hint + button */}
        <div style={{
          padding: '0 12px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '10px',
            color: '#94A3B8',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {isProcessing ? '✨ AI is thinking...' : '⌘+Enter to add'}
          </span>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || !value.trim()}
            style={{
              padding: '5px 14px',
              fontSize: '12px',
              fontWeight: 600,
              color: isProcessing || !value.trim() ? '#94A3B8' : '#fff',
              background: isProcessing || !value.trim()
                ? 'rgba(0,0,0,0.04)'
                : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              border: 'none',
              borderRadius: '8px',
              cursor: isProcessing || !value.trim() ? 'default' : 'pointer',
              transition: 'all 200ms',
            }}
          >
            {isProcessing ? '...' : 'Add'}
          </button>
        </div>

        {/* Just-added feedback */}
        {justAdded.length > 0 && (
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            {justAdded.map((title, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#10B981',
                fontWeight: 500,
                animation: 'fadeIn 300ms ease-out',
              }}>
                <span>✓</span>
                <span style={{ color: '#475569' }}>{title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arrow pointing right toward the detail panel */}
      <div style={{
        position: 'absolute',
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
        width: '12px',
        height: '12px',
        background: 'rgba(255, 255, 255, 0.97)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderLeft: 'none',
        borderBottom: 'none',
      }} />

      <style>{`
        @keyframes popoverIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
