-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS exo_connections CASCADE;
DROP TABLE IF EXISTS exo_nodes CASCADE;

-- 1. Create `exo_nodes` table
CREATE TABLE exo_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('idea', 'project', 'task', 'subtask')),
    status TEXT NOT NULL CHECK (status IN ('spark', 'active', 'in_progress', 'done', 'archived')),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    parent_id UUID REFERENCES exo_nodes(id) ON DELETE SET NULL,
    ai_tags TEXT[] DEFAULT '{}',
    ai_category TEXT,
    ai_priority INTEGER,
    ai_deadline TIMESTAMPTZ,
    pos_x FLOAT NOT NULL DEFAULT 0,
    pos_y FLOAT NOT NULL DEFAULT 0,
    pos_z FLOAT NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    size FLOAT NOT NULL DEFAULT 1.0,
    brightness FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    evolved_from UUID REFERENCES exo_nodes(id) ON DELETE SET NULL,
    evolved_at TIMESTAMPTZ
);

-- 2. Create `exo_connections` table
CREATE TABLE exo_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES exo_nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES exo_nodes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('related', 'ai_suggested', 'evolved', 'depends_on')),
    strength FLOAT NOT NULL DEFAULT 1.0,
    ai_reason TEXT,
    confirmed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(source_id, target_id)
);

-- Configure RLS logic
ALTER TABLE exo_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exo_connections ENABLE ROW LEVEL SECURITY;

-- Create Policies for exo_nodes
CREATE POLICY "Users can insert their own nodes" 
ON exo_nodes FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own nodes" 
ON exo_nodes FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own nodes" 
ON exo_nodes FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nodes" 
ON exo_nodes FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Create Policies for exo_connections
CREATE POLICY "Users can insert their own connections" 
ON exo_connections FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own connections" 
ON exo_connections FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections" 
ON exo_connections FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
ON exo_connections FOR DELETE TO authenticated 
USING (auth.uid() = user_id);
