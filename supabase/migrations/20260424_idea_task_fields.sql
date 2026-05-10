-- Add goal and target_date fields for idea → task transition
ALTER TABLE exo_nodes ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE exo_nodes ADD COLUMN IF NOT EXISTS target_date DATE;
