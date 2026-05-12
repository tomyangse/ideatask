'use client';

import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ExoNode, STAR_CONFIG, STATUS_BRIGHTNESS } from '@/lib/types';
import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';
import { IconFolder, IconLightbulb, IconCheckSquare, IconAlertTriangle, IconFileText } from '@/components/ui/icons';

interface StarNodeProps {
  node: ExoNode;
  isCenter?: boolean;
  isOrbital?: boolean;
  isMicroMode?: boolean;
  onHoverStatus?: (isHovered: boolean) => void;
}

export default function StarNode({ node, isCenter, isOrbital, isMicroMode = false, onHoverStatus }: StarNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const spawningNodeIds = useUIStore((s) => s.spawningNodeIds);
  const removeSpawningNode = useUIStore((s) => s.removeSpawningNode);
  const selectNode = useUIStore((s) => s.selectNode);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const editingNodeId = useUIStore((s) => s.editingNodeId);
  const setEditingNode = useUIStore((s) => s.setEditingNode);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const getChildNodes = useCosmosStore((s) => s.getChildNodes);
  const addNode = useCosmosStore((s) => s.addNode);
  const updateNode = useCosmosStore((s) => s.updateNode);
  const updateNodeLocal = useCosmosStore((s) => s.updateNodeLocal);
  const addSpawningNode = useUIStore((s) => s.addSpawningNode);
  const childCount = getChildNodes(node.id).length;
  const cameraZoom = useUIStore((s) => s.cameraZoom);

  const config = STAR_CONFIG[node.type];
  const isSelected = selectedNodeId === node.id;
  const isEditing = editingNodeId === node.id;
  const isSpawning = spawningNodeIds.includes(node.id);
  const isInMindMap = !!focusedSystemId; // Are we inside a mind-map view?

  const inputRef = useRef<HTMLInputElement>(null);

  // Idea → Task transition state
  const handleStartTask = useCallback(() => {
    if (!node) return;
    updateNode(node.id, {
      type: 'task' as any,
      status: 'in_progress',
      goal: node.title,
      target_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    });
  }, [node, updateNode]);

  const handleRevertToIdea = useCallback(() => {
    if (!node) return;
    updateNode(node.id, {
      type: 'idea' as any,
      status: 'spark',
      updated_at: new Date().toISOString(),
    });
  }, [node, updateNode]);

  // Handle Focus
  useEffect(() => {
    if (isEditing) {
      // The <Html> component from @react-three/drei might take a frame to mount
      // the actual DOM elements, so we use a short timeout to ensure the input is ready.
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.selectionStart = inputRef.current.value.length;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const scaleRef = useRef(isSpawning ? 0 : 1);

  useEffect(() => {
    if (isSpawning) {
      scaleRef.current = 0;
      const timeout = setTimeout(() => removeSpawningNode(node.id), 1200);
      return () => clearTimeout(timeout);
    }
  }, [isSpawning, node.id, removeSpawningNode]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (isSpawning) {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.04);
    } else {
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.1);
    }
  });

  // ── DRAG LOGIC ──
  const [isDragging, setIsDragging] = useState(false);
  const pointerRef = useRef<{x: number, y: number} | null>(null);
  const dragDistance = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    pointerRef.current = { x: e.clientX, y: e.clientY };
    dragDistance.current = 0;
    document.body.style.cursor = 'grabbing';
  };

  const { camera, gl } = useThree();

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !pointerRef.current) return;
    e.stopPropagation();
    
    const screenDx = e.clientX - pointerRef.current.x;
    const screenDy = e.clientY - pointerRef.current.y;
    dragDistance.current += Math.sqrt(screenDx * screenDx + screenDy * screenDy);

    // Use same pixel-to-world conversion as CameraController
    const orthoCamera = camera as THREE.OrthographicCamera;
    const viewWidth = orthoCamera.right - orthoCamera.left;
    const canvasWidth = gl.domElement.clientWidth;
    const pixelToWorld = viewWidth / canvasWidth;

    const dx = screenDx * pixelToWorld;
    const dy = -screenDy * pixelToWorld; // Y is inverted in Three.js coordinates
    
    pointerRef.current = { x: e.clientX, y: e.clientY };
    
    // Read latest position directly from store to avoid stale closure
    const current = useCosmosStore.getState().nodes.find(n => n.id === node.id);
    if (!current) return;
    
    updateNodeLocal(node.id, {
      pos_x: current.pos_x + dx,
      pos_y: current.pos_y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.stopPropagation();
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    pointerRef.current = null;
    document.body.style.cursor = hovered ? 'pointer' : 'default';
    
    if (dragDistance.current > 5) {
      // Read latest position from store for the DB sync
      const current = useCosmosStore.getState().nodes.find(n => n.id === node.id);
      if (current) {
        updateNode(node.id, { pos_x: current.pos_x, pos_y: current.pos_y });
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragDistance.current > 5) {
      dragDistance.current = 0;
      return;
    }

    if (!isInMindMap) {
      toggleFocusedSystem(node.id);
      selectNode(node.id);
    } else {
      selectNode(node.id);
    }
  };

  const handlePointerEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHovered(true);
    if (onHoverStatus) onHoverStatus(true);
    if (!isDragging) document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHovered(false);
    if (onHoverStatus) onHoverStatus(false);
    if (!isDragging) document.body.style.cursor = 'default';
  };

  // ── KEYBOARD SHORTCUTS ──
  useEffect(() => {
    if (!isSelected || isEditing || !isInMindMap) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in another input globally
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const createNode = (parentId: string | null) => {
        // Determine default type based on context:
        // Under a project → task/todo, under an idea → idea/spark
        const parentNode = parentId ? useCosmosStore.getState().nodes.find(n => n.id === parentId) : null;
        const rootIsProject = useUIStore.getState().activeProjectId != null;
        const defaultType = rootIsProject ? 'task' : 'idea';
        const defaultStatus = rootIsProject ? 'todo' : 'spark';

        const newNode: ExoNode = {
          id: crypto.randomUUID(),
          user_id: '',
          type: defaultType,
          status: defaultStatus,
          title: '',
          content: '',
          summary: null,
          parent_id: parentId,
          ai_tags: [],
          ai_category: 'other',
          ai_priority: 3,
          ai_deadline: null,
          pos_x: 0, pos_y: 0, pos_z: 0, // Handled dynamically by layout engine
          color: node.color || '#7C3AED',
          size: 0.8,
          brightness: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          evolved_from: null, evolved_at: null, goal: null, target_date: null,
        };
        addNode(newNode);
        addSpawningNode(newNode.id);
        selectNode(newNode.id);
        setEditingNode(newNode.id);
      };

      if (e.key === 'Tab') {
        e.preventDefault();
        createNode(node.id); // Create child
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (node.parent_id) {
          createNode(node.parent_id); // Create sibling
        } else {
          createNode(node.id); // If root, just create child
        }
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setEditingNode(node.id);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (confirm('Delete node?')) {
          useCosmosStore.getState().removeNode(node.id);
          deselectNode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isEditing, isInMindMap, node, addNode, addSpawningNode, selectNode, setEditingNode, deselectNode]);

  const position: [number, number, number] = (isOrbital || isCenter)
    ? [0, 0, 0]
    : [node.pos_x, node.pos_y, node.pos_z];

  const typeIcons: Record<string, React.ReactNode> = {
    project: <IconFolder width={16} height={16} color={config.iconColor} />,
    idea: <IconLightbulb width={16} height={16} color={config.iconColor} />,
    task: <IconCheckSquare width={16} height={16} color={config.iconColor} />,
    issue: <IconAlertTriangle width={16} height={16} color={config.iconColor} />,
    note: <IconFileText width={16} height={16} color={config.iconColor} />,
  };

  const BASE_ZOOM = 80;
  const cssScale = Math.min(BASE_ZOOM / Math.max(cameraZoom, 1), 1.8);

  const activeIdeaId = useUIStore((s) => s.activeIdeaId);
  const isProject = node.type === 'project' || (isCenter && !isOrbital && activeIdeaId === node.id);

  return (
    <group ref={groupRef} position={position}>
      <Html center zIndexRange={[100, 0]}>
        <div
          onClick={handleClick}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (isInMindMap) setEditingNode(node.id);
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          style={{
            position: 'relative',
            background: '#FFFFFF',
            border: `1px solid ${isSelected ? '#8B5CF6' : (hovered ? '#C4B5FD' : config.borderColor || '#E5E7EB')}`,
            borderRadius: isProject ? '20px' : '12px',
            padding: isProject ? '16px 20px' : '8px 12px',
            color: '#111827',
            boxShadow: isSelected
              ? `0 0 0 2px rgba(139, 92, 246, 0.2), 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
              : hovered 
                ? `0 10px 15px -3px rgba(0, 0, 0, 0.08)` 
                : (isProject ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)'),
            transform: `scale(${scaleRef.current * cssScale})`,
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: isProject ? 'column' : 'row',
            alignItems: isProject ? 'flex-start' : 'center',
            gap: isProject ? '12px' : '8px',
            pointerEvents: 'auto',
            userSelect: 'none',
            minWidth: isProject ? '220px' : 'auto',
          }}
        >
          {isProject ? (
            <>
              {/* Root Card Layout (Project or Idea) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: node.type === 'idea' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(124, 58, 237, 0.1)',
                  color: node.type === 'idea' ? '#F59E0B' : '#7C3AED'
                }}>
                  {node.type === 'idea' ? <IconLightbulb width={20} height={20} /> : <IconFolder width={20} height={20} />}
                </div>
                
                {isEditing ? (
                  <input
                    ref={inputRef}
                    defaultValue={node.title}
                    placeholder={node.type === 'idea' ? 'Idea Name' : 'Project Name'}
                    onBlur={(e) => {
                      const val = e.currentTarget.value.trim();
                      if (val) updateNode(node.id, { title: val, content: val });
                      setEditingNode(null);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
                    }}
                    style={{
                      flex: 1, padding: '4px 8px', fontSize: '15px', fontWeight: 600,
                      color: '#0F172A', border: '1px solid #3B82F6', borderRadius: '6px', outline: 'none'
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '15px', fontWeight: 600, color: '#111827',
                    flex: 1, whiteSpace: 'nowrap'
                  }}>
                    {node.title || (node.type === 'idea' ? 'New Idea' : 'New Project')}
                  </span>
                )}
                
                {!isInMindMap && hovered && (
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (confirm('Delete?')) useCosmosStore.getState().removeNode(node.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8',
                      padding: '4px', borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                  </button>
                )}
              </div>
              
              {/* Metadata */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                <span>{useCosmosStore.getState().nodes.filter(n => n.parent_id === node.id && n.type === 'idea').length} ideas</span>
                <span>·</span>
                <span>{useCosmosStore.getState().nodes.filter(n => n.parent_id === node.id && n.type === 'task').length} tasks</span>
                <span>·</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                  {node.status}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Child Node Layout (Idea, Task, Issue, Note) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {typeIcons[node.type] || <IconLightbulb width={16} height={16} color={config.iconColor} />}
                
                {isEditing ? (
                  <input
                    ref={inputRef}
                    defaultValue={node.title}
                    placeholder="New Node"
                    onBlur={(e) => {
                      const val = e.currentTarget.value.trim();
                      if (val) updateNode(node.id, { title: val, content: val });
                      else if (!node.title) { useCosmosStore.getState().removeNode(node.id); deselectNode(); }
                      setEditingNode(null);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
                      else if (e.key === 'Escape') {
                        e.preventDefault();
                        if (!e.currentTarget.value.trim() && !node.title) { useCosmosStore.getState().removeNode(node.id); deselectNode(); }
                        setEditingNode(null);
                      }
                    }}
                    style={{
                      width: `${Math.max(node.title.length * 8, 80)}px`, minWidth: '80px',
                      padding: '2px 6px', fontSize: '13px', fontWeight: 500, color: '#111827',
                      border: '1px solid #3B82F6', borderRadius: '4px', outline: 'none'
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: '13px', fontWeight: 500, color: '#374151',
                    whiteSpace: 'nowrap'
                  }}>
                    {node.title || 'New Node'}
                  </span>
                )}
              </div>
              
              {/* Action buttons on select for mind map */}
              {isSelected && isInMindMap && (() => {
                // Idea → start as task
                if (node.type === 'idea') return (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartTask(); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#3B82F6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >▶ 开始</button>
                );
                // Task: todo → start
                if (node.type === 'task' && (node.status === 'todo' || node.status === 'spark')) return (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateNode(node.id, { status: 'in_progress' as any, updated_at: new Date().toISOString() }); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#3B82F6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >▶ 开始</button>
                );
                // Task: in_progress → done
                if (node.type === 'task' && node.status === 'in_progress') return (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateNode(node.id, { status: 'done' as any, updated_at: new Date().toISOString() }); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#10B981', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >✓ 完成</button>
                );
                // Task: done → reopen
                if (node.type === 'task' && node.status === 'done') return (
                  <button
                    onClick={(e) => { e.stopPropagation(); updateNode(node.id, { status: 'todo' as any, updated_at: new Date().toISOString() }); }}
                    onPointerDown={(e) => e.stopPropagation()}
                    style={{ marginLeft: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#fff', background: '#9CA3AF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >↩ 重开</button>
                );
                return null;
              })()}
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
