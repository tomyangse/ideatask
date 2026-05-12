'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/uiStore';
import { useCosmosStore } from '@/stores/cosmosStore';

export default function CameraController() {
  const { camera, gl } = useThree();
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);
  const focusTarget = useUIStore((s) => s.focusTarget);
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Initial orthographic zoom level (higher = more zoomed out)
  const zoomRef = useRef(80);
  const targetZoomRef = useRef(80);

  const activeProjectId = useUIStore((s) => s.activeProjectId);
  const activeIdeaId = useUIStore((s) => s.activeIdeaId);
  const nodes = useCosmosStore((s) => s.nodes);

  // When a system is focused, auto-fit the tree into view
  const prevFocusedRef = useRef<string | null>(null);
  useEffect(() => {
    if (focusedSystemId) {
      const rootNode = getNodeById(focusedSystemId);
      if (rootNode) {
        // Compute bounding box of all descendants for auto-fit
        const descendants = nodes.filter(n => {
          let cur = n;
          while (cur.parent_id) {
            if (cur.parent_id === focusedSystemId) return true;
            const parent = nodes.find(p => p.id === cur.parent_id);
            if (!parent) break;
            cur = parent;
          }
          return false;
        });

        // For non-root nodes rendered with overrideOrigin, use (0,0) as origin
        const isNonRoot = !!rootNode.parent_id;
        const originX = isNonRoot ? 0 : rootNode.pos_x;
        const originY = isNonRoot ? 0 : rootNode.pos_y;

        if ((activeProjectId || activeIdeaId) && descendants.length > 0) {
          // Auto-fit all nodes into view
          // Compute actual tree depth
          let maxDepth = 0;
          const getDepth = (id: string, depth: number) => {
            if (depth > maxDepth) maxDepth = depth;
            nodes.filter(n => n.parent_id === id).forEach(n => getDepth(n.id, depth + 1));
          };
          getDepth(focusedSystemId, 0);

          const count = descendants.length;
          const COL_WIDTH = 85;
          const ROW_HEIGHT = 28;
          const treeWidth = maxDepth * COL_WIDTH;
          const treeHeight = count * ROW_HEIGHT;

          // Center on middle of the tree
          targetRef.current.set(
            originX + treeWidth / 2 + 20,
            originY,
            0
          );
          // Zoom to fit the larger dimension with some padding
          const fitZoom = Math.max(treeWidth / 1.4, treeHeight / 1.4, 25);
          targetZoomRef.current = fitZoom;
        } else {
          targetRef.current.set(originX + 12, originY, 0);
          targetZoomRef.current = 40;
        }
      }
    } else if (prevFocusedRef.current) {
      targetRef.current.set(0, 0, 0);
      targetZoomRef.current = 80;
    } else if (focusTarget) {
      targetRef.current.set(focusTarget[0], focusTarget[1], 0);
      targetZoomRef.current = 20;
    }
    prevFocusedRef.current = focusedSystemId;
  }, [focusedSystemId, focusTarget, getNodeById, activeProjectId, activeIdeaId, nodes]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    if (e.deltaY > 0) {
      targetZoomRef.current = Math.min(targetZoomRef.current * zoomFactor, 120);
    } else {
      targetZoomRef.current = Math.max(targetZoomRef.current / zoomFactor, 3);
    }
  }, []);

  // Pan via left-click drag
  const handlePointerDown = useCallback((e: PointerEvent) => {
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    // Convert pixel movement to world units based on current zoom
    const orthoCamera = camera as THREE.OrthographicCamera;
    const viewWidth = orthoCamera.right - orthoCamera.left;
    const canvasWidth = gl.domElement.clientWidth;
    const pixelToWorld = viewWidth / canvasWidth;

    targetRef.current.x -= dx * pixelToWorld;
    targetRef.current.y += dy * pixelToWorld; // Y is inverted in screen space
  }, [camera, gl]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch support
  const touchStartRef = useRef<{ x: number; y: number; dist: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: Math.sqrt(dx * dx + dy * dy),
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastPointer.current.x;
      const dy = e.touches[0].clientY - lastPointer.current.y;
      lastPointer.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const orthoCamera = camera as THREE.OrthographicCamera;
      const viewWidth = orthoCamera.right - orthoCamera.left;
      const canvasWidth = gl.domElement.clientWidth;
      const pixelToWorld = viewWidth / canvasWidth;
      targetRef.current.x -= dx * pixelToWorld;
      targetRef.current.y += dy * pixelToWorld;
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = touchStartRef.current.dist / dist;
      targetZoomRef.current = Math.min(Math.max(targetZoomRef.current * scale, 3), 120);
      touchStartRef.current.dist = dist;
    }
  }, [camera, gl]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    const domElement = gl.domElement;
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('pointerleave', handlePointerUp);
    domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    domElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('pointerleave', handlePointerUp);
      domElement.removeEventListener('touchstart', handleTouchStart);
      domElement.removeEventListener('touchmove', handleTouchMove);
      domElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl, handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Smooth camera animation each frame
  const lastZoomUpdate = useRef(0);
  useFrame(({ clock }) => {
    const orthoCamera = camera as THREE.OrthographicCamera;
    
    // Smoothly interpolate zoom
    zoomRef.current = THREE.MathUtils.lerp(zoomRef.current, targetZoomRef.current, 0.1);
    
    // Smoothly interpolate camera position (pan)
    orthoCamera.position.x = THREE.MathUtils.lerp(orthoCamera.position.x, targetRef.current.x, 0.1);
    orthoCamera.position.y = THREE.MathUtils.lerp(orthoCamera.position.y, targetRef.current.y, 0.1);
    
    // Update ortho frustum based on zoom and aspect ratio
    const aspect = gl.domElement.clientWidth / gl.domElement.clientHeight;
    orthoCamera.left = -zoomRef.current * aspect;
    orthoCamera.right = zoomRef.current * aspect;
    orthoCamera.top = zoomRef.current;
    orthoCamera.bottom = -zoomRef.current;
    orthoCamera.updateProjectionMatrix();

    // Sync zoom to store (~15fps throttle to avoid excessive re-renders)
    const now = clock.elapsedTime;
    if (now - lastZoomUpdate.current > 0.066) {
      lastZoomUpdate.current = now;
      useUIStore.getState().setCameraZoom(zoomRef.current);
    }
  });

  return null;
}
