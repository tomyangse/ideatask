-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create nodes table
CREATE TABLE public.nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('idea', 'project', 'task', 'subtask')),
    status TEXT NOT NULL DEFAULT 'spark' CHECK (status IN ('spark', 'active', 'in_progress', 'done', 'archived')),
    
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    
    parent_id UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
    
    ai_tags TEXT[],
    ai_category TEXT,
    ai_priority INTEGER,
    ai_deadline TIMESTAMPTZ,
    
    -- 3D spatial properties
    pos_x FLOAT DEFAULT 0,
    pos_y FLOAT DEFAULT 0,
    pos_z FLOAT DEFAULT 0,
    
    -- Visual properties
    color TEXT DEFAULT '#ffffff',
    size FLOAT DEFAULT 1.0,
    brightness FLOAT DEFAULT 1.0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    evolved_from UUID REFERENCES public.nodes(id) ON DELETE SET NULL,
    evolved_at TIMESTAMPTZ
);

-- Create connections table
CREATE TABLE public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('related', 'ai_suggested', 'evolved', 'depends_on')),
    strength FLOAT DEFAULT 0.5,
    ai_reason TEXT,
    confirmed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(source_id, target_id)
);

-- Enable RLS
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nodes
CREATE POLICY "Users can view own nodes" ON public.nodes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own nodes" ON public.nodes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes" ON public.nodes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nodes" ON public.nodes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for connections
CREATE POLICY "Users can view own connections" ON public.connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connections" ON public.connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON public.connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON public.connections
    FOR DELETE USING (auth.uid() = user_id);

-- Optional: Create indices for performance
CREATE INDEX IF NOT EXISTS idx_nodes_user_id ON public.nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent_id ON public.nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_connections_source_id ON public.connections(source_id);
CREATE INDEX IF NOT EXISTS idx_connections_target_id ON public.connections(target_id);
