import { create } from 'zustand';

interface UIState {
  /* Omni-Bar */
  isOmniBarOpen: boolean;
  openOmniBar: () => void;
  closeOmniBar: () => void;
  toggleOmniBar: () => void;

  /* Detail Panel & Editing */
  selectedNodeId: string | null;
  editingNodeId: string | null;
  isDetailPanelOpen: boolean;
  selectNode: (id: string) => void;
  deselectNode: () => void;
  setEditingNode: (id: string | null) => void;

  /* Inline Prompt */
  inlinePromptNodeId: string | null;
  openInlinePrompt: (nodeId: string) => void;
  closeInlinePrompt: () => void;

  /* Camera */
  focusTarget: [number, number, number] | null;
  setFocusTarget: (target: [number, number, number] | null) => void;

  /* Dual-View Mode */
  focusedSystemId: string | null;
  toggleFocusedSystem: (systemId: string) => void;

  /* Spawning animation queue */
  spawningNodeIds: string[];
  addSpawningNode: (id: string) => void;
  removeSpawningNode: (id: string) => void;

  /* Camera zoom level (ortho frustum half-height) */
  cameraZoom: number;
  setCameraZoom: (zoom: number) => void;

  /* Active View */
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  /* Omni-Bar */
  isOmniBarOpen: false,
  openOmniBar: () => set({ isOmniBarOpen: true }),
  closeOmniBar: () => set({ isOmniBarOpen: false }),
  toggleOmniBar: () => set((s) => ({ isOmniBarOpen: !s.isOmniBarOpen })),

  /* Detail Panel & Editing */
  selectedNodeId: null,
  editingNodeId: null,
  isDetailPanelOpen: false,
  selectNode: (id) => set({ selectedNodeId: id, isDetailPanelOpen: true }),
  deselectNode: () => set({ selectedNodeId: null, editingNodeId: null, isDetailPanelOpen: false }),
  setEditingNode: (id) => set({ editingNodeId: id }),

  /* Inline Prompt */
  inlinePromptNodeId: null,
  openInlinePrompt: (nodeId) => set({ inlinePromptNodeId: nodeId }),
  closeInlinePrompt: () => set({ inlinePromptNodeId: null }),

  /* Camera */
  focusTarget: null,
  setFocusTarget: (target) => set({ focusTarget: target }),

  /* Dual-View Mode */
  focusedSystemId: null,
  toggleFocusedSystem: (systemId) => set((s) => ({
    focusedSystemId: s.focusedSystemId === systemId ? null : systemId
  })),

  /* Spawning */
  spawningNodeIds: [],
  addSpawningNode: (id) =>
    set((s) => ({ spawningNodeIds: [...s.spawningNodeIds, id] })),
  removeSpawningNode: (id) =>
    set((s) => ({
      spawningNodeIds: s.spawningNodeIds.filter((nid) => nid !== id),
    })),

  /* Camera zoom */
  cameraZoom: 80, // initial default matching CameraController
  setCameraZoom: (zoom) => set({ cameraZoom: zoom }),

  /* Active View */
  activeView: 'Dashboard',
  setActiveView: (activeView) => set({ activeView }),
}));
