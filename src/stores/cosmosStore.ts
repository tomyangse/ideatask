import { create } from 'zustand';
import { ExoNode, ExoConnection } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface CosmosState {
  /* Data */
  nodes: ExoNode[];
  connections: ExoConnection[];
  isLoading: boolean;

  /* Actions */
  setNodes: (nodes: ExoNode[]) => void;
  addNode: (node: ExoNode) => void;
  updateNode: (id: string, updates: Partial<ExoNode>) => void;
  updateNodeLocal: (id: string, updates: Partial<ExoNode>) => void;
  removeNode: (id: string) => void;
  setConnections: (connections: ExoConnection[]) => void;
  addConnection: (connection: ExoConnection) => void;
  setLoading: (loading: boolean) => void;
  
  /* Async Actions */
  fetchData: () => Promise<void>;

  /* Derived selectors */
  getNodeById: (id: string) => ExoNode | undefined;
  getChildNodes: (parentId: string) => ExoNode[];
  getNodeConnections: (nodeId: string) => ExoConnection[];
}

export const useCosmosStore = create<CosmosState>((set, get) => ({
  nodes: [],
  connections: [],
  isLoading: true,

  setNodes: (nodes) => set({ nodes }),

  addNode: async (node) => {
    // Optimistic UI update
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    
    // Sync to backend
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        node.user_id = user.id; // Ensure user_id is set before insert
        const { error } = await supabase.from('exo_nodes').insert(node);
        if (error) console.error('Error inserting node:', error);
      }
    } catch (e) {
      console.error(e);
    }
  },

  updateNode: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
    
    try {
      const supabase = createClient();
      const { error } = await supabase.from('exo_nodes').update(updates).eq('id', id);
      if (error) console.error('Error updating node:', error);
    } catch (e) {
      console.error(e);
    }
  },

  updateNodeLocal: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  },

  removeNode: async (id) => {
    // Collect all descendant ids recursively
    const getDescendants = (parentId: string): string[] => {
      const children = get().nodes.filter(n => n.parent_id === parentId).map(n => n.id);
      return children.reduce((acc, childId) => [...acc, childId, ...getDescendants(childId)], [] as string[]);
    };

    const idsToDelete = [id, ...getDescendants(id)];

    set((state) => ({
      nodes: state.nodes.filter((n) => !idsToDelete.includes(n.id)),
      connections: state.connections.filter(
        (c) => !idsToDelete.includes(c.source_id) && !idsToDelete.includes(c.target_id)
      ),
    }));
    try {
      const supabase = createClient();
      const { error } = await supabase.from('exo_nodes').delete().in('id', idsToDelete);
      if (error) console.error('Error deleting node:', error);
    } catch (e) {
      console.error(e);
    }
  },

  setConnections: (connections) => set({ connections }),

  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, connection],
  })),

  setLoading: (isLoading) => set({ isLoading }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();
      const { data: nodesData, error: nodesError } = await supabase.from('exo_nodes').select('*');
      if (nodesError) console.error('Error fetching nodes:', nodesError);
      if (nodesData) set({ nodes: nodesData as ExoNode[] });

      const { data: connData, error: connError } = await supabase.from('exo_connections').select('*');
      if (connError) console.error('Error fetching connections:', connError);
      if (connData) set({ connections: connData as ExoConnection[] });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  getNodeById: (id) => get().nodes.find((n) => n.id === id),

  getChildNodes: (parentId) =>
    get().nodes.filter((n) => n.parent_id === parentId),

  getNodeConnections: (nodeId) =>
    get().connections.filter(
      (c) => c.source_id === nodeId || c.target_id === nodeId
    ),
}));
