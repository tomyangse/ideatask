/* ============================================
   Exobrain — Core Types
   ============================================ */

export type NodeType = 'project' | 'idea' | 'task' | 'issue' | 'note';

export type NodeStatus = 'active' | 'planning' | 'paused' | 'blocked' | 'done' | 'open' | 'todo' | 'doing' | 'spark' | 'in_progress' | 'archived';

export interface ExoNode {
  id: string;
  user_id: string;
  type: NodeType;
  status: NodeStatus;
  title: string;
  content: string | null;
  summary: string | null;
  parent_id: string | null;
  ai_tags: string[] | null;
  ai_category: string | null;
  ai_priority: number | null;
  ai_deadline: string | null;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  color: string;
  size: number;
  brightness: number;
  created_at: string;
  updated_at: string;
  evolved_from: string | null;
  evolved_at: string | null;
  goal: string | null;
  target_date: string | null;
}

export type ConnectionType = 'related' | 'ai_suggested' | 'evolved' | 'depends_on';

export interface ExoConnection {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  type: ConnectionType;
  strength: number;
  ai_reason: string | null;
  confirmed: boolean;
  created_at: string;
}

export interface AIStructuredInput {
  title: string;
  content: string | null;
  tags: string[];
  category: string;
  priority: number;
  suggested_deadline: string | null;
}

/* Star visual config based on node type */
export const STAR_CONFIG: Record<NodeType, {
  baseColor: string;
  glowColor: string;
  emissiveIntensity: number;
  baseSize: number;
  borderColor: string;
  iconColor: string;
}> = {
  project: {
    baseColor: '#7C3AED',
    glowColor: '#7C3AED',
    emissiveIntensity: 3.0,
    baseSize: 0.8,
    borderColor: '#C4B5FD',
    iconColor: '#7C3AED',
  },
  idea: {
    baseColor: '#F59E0B',
    glowColor: '#F59E0B',
    emissiveIntensity: 2.0,
    baseSize: 0.5,
    borderColor: '#FDE68A',
    iconColor: '#F59E0B',
  },
  task: {
    baseColor: '#3B82F6',
    glowColor: '#3B82F6',
    emissiveIntensity: 1.5,
    baseSize: 0.35,
    borderColor: '#DBEAFE',
    iconColor: '#3B82F6',
  },
  issue: {
    baseColor: '#EF4444',
    glowColor: '#EF4444',
    emissiveIntensity: 1.5,
    baseSize: 0.35,
    borderColor: '#FECACA',
    iconColor: '#EF4444',
  },
  note: {
    baseColor: '#6B7280',
    glowColor: '#6B7280',
    emissiveIntensity: 1.0,
    baseSize: 0.35,
    borderColor: '#E5E7EB',
    iconColor: '#6B7280',
  },
};

export const STATUS_BRIGHTNESS: Record<NodeStatus, number> = {
  spark: 0.6,
  active: 1.0,
  in_progress: 1.2,
  done: 0.4,
  archived: 0.15,
  planning: 0.8,
  paused: 0.5,
  blocked: 0.8,
  open: 1.0,
  todo: 0.7,
  doing: 1.2,
};

/* Category colors for spatial grouping */
export const CATEGORY_COLORS: Record<string, string> = {
  technology: '#3B82F6',
  business: '#F59E0B',
  creative: '#EC4899',
  personal: '#10B981',
  research: '#8B5CF6',
  other: '#6B7280',
};
