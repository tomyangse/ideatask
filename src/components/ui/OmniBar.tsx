'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';
import { ExoNode, CATEGORY_COLORS } from '@/lib/types';
import styles from './OmniBar.module.css';

interface CapturedItem {
  id: string;
  title: string;
  icon: string;
}

export default function OmniBar() {
  const isOpen = useUIStore((s) => s.isOmniBarOpen);
  const closeOmniBar = useUIStore((s) => s.closeOmniBar);
  const toggleOmniBar = useUIStore((s) => s.toggleOmniBar);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const addNode = useCosmosStore((s) => s.addNode);
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  const addSpawningNode = useUIStore((s) => s.addSpawningNode);
  const setFocusTarget = useUIStore((s) => s.setFocusTarget);

  const [value, setValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [capturedItems, setCapturedItems] = useState<CapturedItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine parent context: if a node is selected, new nodes become its children
  const parentNode = selectedNodeId ? getNodeById(selectedNodeId) : undefined;

  // Global shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleOmniBar();
      }
      if (e.key === 'Escape' && isOpen) {
        closeOmniBar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleOmniBar, closeOmniBar]);

  // Auto-focus on open, clear captured items on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setValue('');
      setCapturedItems([]);
    }
  }, [isOpen]);

  const createNode = useCallback((text: string, structured: any) => {
    // Calculate position relative to parent or in a spiral
    const nodes = useCosmosStore.getState().nodes;
    let pos_x: number, pos_y: number;

    if (parentNode) {
      // Mind-map nodes use dynamic recursive layout engine, 
      // absolute DB positions are irrelevant and ignored.
      pos_x = 0;
      pos_y = 0;
    } else {
      // Top-level: spread in a spiral
      const rootCount = nodes.filter(n => !n.parent_id).length;
      const angle = rootCount * 1.2;
      const radius = 40 + rootCount * 25;
      pos_x = Math.cos(angle) * radius;
      pos_y = Math.sin(angle) * radius;
    }

    const newNode: ExoNode = {
      id: structured.id || crypto.randomUUID(),
      user_id: '',
      type: parentNode ? 'task' : 'idea',
      status: 'spark',
      title: structured.title || text.slice(0, 60),
      content: text,
      summary: structured.summary || null,
      parent_id: parentNode?.id || null,
      ai_tags: structured.tags || [],
      ai_category: structured.category || 'other',
      ai_priority: structured.priority || 3,
      ai_deadline: structured.suggested_deadline || null,
      pos_x,
      pos_y,
      pos_z: 0,
      color: structured.color || '#7C3AED',
      size: 1.0,
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
    if (!parentNode) {
      setFocusTarget([newNode.pos_x, newNode.pos_y, newNode.pos_z]);
    }

    return newNode;
  }, [parentNode, addNode, addSpawningNode, setFocusTarget]);

  const handleSubmit = useCallback(async () => {
    const text = value.trim();
    if (!text || isProcessing) return;

    setIsProcessing(true);

    try {
      if (useAI) {
        const response = await fetch('/api/ai/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: text }),
        });

        if (!response.ok) throw new Error('AI structuring failed');

        const structured = await response.json();
        const newNode = createNode(text, structured);

        // Add to captured items list (continuous mode)
        setCapturedItems(prev => [...prev, {
          id: newNode.id,
          title: newNode.title,
          icon: parentNode ? '↳' : '💡',
        }]);
      } else {
        const fallbackNode = createNode(text, {
          id: crypto.randomUUID(),
          title: text.slice(0, 60),
        });

        setCapturedItems(prev => [...prev, {
          id: fallbackNode.id,
          title: fallbackNode.title,
          icon: parentNode ? '↳' : '💡',
        }]);
      }

      setValue('');
      // Keep OmniBar open for continuous capture!
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error('Failed to create node:', error);
      // Fallback without AI
      const fallbackNode = createNode(text, {
        id: crypto.randomUUID(),
        title: text.slice(0, 60),
      });

      setCapturedItems(prev => [...prev, {
        id: fallbackNode.id,
        title: fallbackNode.title,
        icon: parentNode ? '↳' : '💡',
      }]);

      setValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setIsProcessing(false);
    }
  }, [value, isProcessing, useAI, createNode, parentNode]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeOmniBar();
      }}
    >
      <div className={styles.container}>
        {/* Parent context indicator */}
        {parentNode && (
          <div className={styles.contextBar}>
            <span className={styles.contextIcon}>↳</span>
            <span className={styles.contextLabel}>Adding under:</span>
            <span className={styles.contextTitle}>{parentNode.title}</span>
          </div>
        )}

        <div className={styles.inputWrapper}>
          <span className={styles.icon}>✦</span>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            placeholder={parentNode
              ? `Add a sub-idea to "${parentNode.title.slice(0, 30)}..."`
              : 'Capture a thought, idea, or task...'
            }
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <div className={styles.loading}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          ) : (
            <>
              <button
                className={`${styles.aiToggle} ${useAI ? styles.aiToggleActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setUseAI(!useAI);
                }}
                title={useAI ? "Disable AI Understanding" : "Enable AI Understanding"}
              >
                ✨ AI
              </button>
              <span className={styles.shortcut}>ESC</span>
            </>
          )}
        </div>

        {/* Captured items list (continuous mode feedback) */}
        {capturedItems.length > 0 && (
          <div className={styles.capturedList}>
            {capturedItems.map((item) => (
              <div key={item.id} className={styles.capturedItem}>
                <span className={styles.capturedIcon}>{item.icon}</span>
                <span className={styles.capturedTitle}>{item.title}</span>
                <span className={styles.capturedCheck}>✓</span>
              </div>
            ))}
          </div>
        )}

        <p className={styles.hint}>
          {capturedItems.length > 0
            ? `${capturedItems.length} captured — keep going or press ESC to finish`
            : parentNode
              ? 'Press Enter to add, keep typing for more sub-ideas'
              : 'AI will auto-structure your thought ✨'
          }
        </p>
      </div>
    </div>
  );
}
