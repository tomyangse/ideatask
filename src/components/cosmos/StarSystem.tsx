'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { ExoNode, STAR_CONFIG } from '@/lib/types';
import { useCosmosStore } from '@/stores/cosmosStore';
import StarNode from './StarNode';
import { useUIStore } from '@/stores/uiStore';

// Recursive component for Mind-Map layout
function MindMapBranch({ 
  node, 
  expandedSet, 
  orbitColor,
  layoutMap
}: { 
  node: ExoNode; 
  expandedSet: Set<string>; 
  orbitColor: string;
  layoutMap: Map<string, { x: number, y: number }>;
}) {
  const nodes = useCosmosStore((s) => s.nodes);
  const children = useMemo(() => nodes.filter(n => n.parent_id === node.id), [nodes, node.id]);

  if (!expandedSet.has(node.id) || children.length === 0) return null;

  const parentPos = layoutMap.get(node.id) || { x: 0, y: 0 };

  return (
    <>
      {children.map((child) => {
        const childPos = layoutMap.get(child.id) || { x: 0, y: 0 };
        const relX = childPos.x - parentPos.x;
        const relY = childPos.y - parentPos.y;
        
        // Elbow point at 40% of the horizontal distance
        const midX = relX * 0.4;

        return (
          <group key={child.id}>
            {/* L-shaped connector */}
            <Line points={[[0, 0, 0], [midX, 0, 0]]} color="#D8D4E8" lineWidth={1.5} transparent opacity={0.6} />
            <Line points={[[midX, 0, 0], [midX, relY, 0]]} color="#D8D4E8" lineWidth={1.5} transparent opacity={0.6} />
            <Line points={[[midX, relY, 0], [relX, relY, 0]]} color="#D8D4E8" lineWidth={1.5} transparent opacity={0.6} />

            {/* Child Node Container */}
            <group position={[relX, relY, 0]}>
              <StarNode node={child} isOrbital={true} isMicroMode={true} />
              
              {/* Recursively render its children if expanded */}
              <MindMapBranch 
                node={child} 
                expandedSet={expandedSet} 
                orbitColor={orbitColor}
                layoutMap={layoutMap}
              />
            </group>
          </group>
        );
      })}
    </>
  );
}

interface StarSystemProps {
  rootNode: ExoNode;
  isFocused: boolean;
}

export default function StarSystem({ rootNode, isFocused }: StarSystemProps) {
  const nodes = useCosmosStore((s) => s.nodes);
  const selectedNodeId = useUIStore((s) => s.selectedNodeId);
  const config = STAR_CONFIG[rootNode.type];
  const orbitColor = rootNode.color || config.glowColor;

  // Find all direct children for Macro mode
  const directChildren = useMemo(() => {
    return nodes.filter(n => n.parent_id === rootNode.id);
  }, [nodes, rootNode.id]);

  // ── MIND MAP EXPANDED STATE ──
  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const isProjectPage = activeProjectId === rootNode.id;

  const expandedSet = useMemo(() => {
    const set = new Set<string>();
    set.add(rootNode.id);

    // When inside project page, expand ALL descendants for full visibility
    if (isProjectPage) {
      const addAll = (parentId: string) => {
        set.add(parentId);
        nodes.filter(n => n.parent_id === parentId).forEach(n => addAll(n.id));
      };
      addAll(rootNode.id);
    } else if (selectedNodeId) {
      set.add(selectedNodeId);
      let current = nodes.find(n => n.id === selectedNodeId);
      while (current && current.parent_id) {
        const parentId = current.parent_id;
        set.add(parentId);
        current = nodes.find(n => n.id === parentId);
      }
    }
    return set;
  }, [rootNode.id, selectedNodeId, nodes, isProjectPage]);

  // ── LAYOUT ENGINE (Recursive Tree) ──
  const layoutMap = useMemo(() => {
    const map = new Map<string, { x: number, y: number }>();
    if (!isFocused) return map;

    // Build adjacency list for descendants
    const childrenMap = new Map<string, ExoNode[]>();
    nodes.forEach(n => {
      if (n.parent_id) {
        if (!childrenMap.has(n.parent_id)) childrenMap.set(n.parent_id, []);
        childrenMap.get(n.parent_id)!.push(n);
      }
    });

    const ROW_HEIGHT = 28; // Compact vertical spacing
    const COL_WIDTH = 85;  // Compact horizontal spacing

    // First pass: compute height of each subtree
    const heightMap = new Map<string, number>();
    const computeHeight = (nodeId: string): number => {
      // Only include children if this node is expanded
      if (!expandedSet.has(nodeId)) {
        heightMap.set(nodeId, ROW_HEIGHT);
        return ROW_HEIGHT;
      }
      
      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) {
        heightMap.set(nodeId, ROW_HEIGHT);
        return ROW_HEIGHT;
      }

      let totalHeight = 0;
      for (const child of children) {
        totalHeight += computeHeight(child.id);
      }
      heightMap.set(nodeId, totalHeight);
      return totalHeight;
    };

    computeHeight(rootNode.id);

    // Second pass: assign coordinates
    const assignCoords = (nodeId: string, x: number, yCenter: number) => {
      map.set(nodeId, { x, y: yCenter });
      
      if (!expandedSet.has(nodeId)) return;
      const children = childrenMap.get(nodeId) || [];
      if (children.length === 0) return;

      const totalHeight = heightMap.get(nodeId) || ROW_HEIGHT;
      let currentY = yCenter - totalHeight / 2;

      for (const child of children) {
        const childHeight = heightMap.get(child.id) || ROW_HEIGHT;
        const childCenter = currentY + childHeight / 2;
        assignCoords(child.id, x + COL_WIDTH, childCenter);
        currentY += childHeight;
      }
    };

    // Root is at (0, 0) relative to its wrapping group
    assignCoords(rootNode.id, 0, 0);

    return map;
  }, [isFocused, nodes, rootNode.id, expandedSet]);

  return (
    <group position={[rootNode.pos_x, rootNode.pos_y, 0]}>
      <StarNode node={rootNode} isCenter={true} isMicroMode={isFocused} />
      
      {isFocused ? (
        /* ── MIND-MAP LAYOUT (Recursive) ── */
        <MindMapBranch 
          node={rootNode} 
          expandedSet={expandedSet} 
          orbitColor={orbitColor}
          layoutMap={layoutMap}
        />
      ) : (
        /* ── MACRO (SCATTERED) LAYOUT ── */
        <>
          {directChildren.map((child, i) => {
            // Pseudo-random but stable scatter based on child id
            const hash = child.id.charCodeAt(0) + child.id.charCodeAt(1) * 7 + child.id.charCodeAt(2) * 13 + i * 17;
            const angle = (hash % 360) * (Math.PI / 180);
            const dist = 15 + (hash % 10) * 2; // 15–35 units from center for new UI scale
            const relX = Math.cos(angle) * dist;
            const relY = Math.sin(angle) * dist;
            
            // Connect scattered nodes to project in Macro view with subtle line
            return (
              <group key={child.id}>
                <Line points={[[0, 0, 0], [relX, relY, 0]]} color="#D8D4E8" lineWidth={1} transparent opacity={0.4} />
                <group position={[relX, relY, 0]}>
                  <StarNode node={child} isOrbital={true} isMicroMode={false} />
                </group>
              </group>
            );
          })}
        </>
      )}
    </group>
  );
}
