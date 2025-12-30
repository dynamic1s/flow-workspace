-- Remove the foreign key constraint and other related columns from the tasks table
-- This decouples tasks from goals entirely.

ALTER TABLE public.tasks
DROP COLUMN IF EXISTS goal_id;

-- Also drop the old skill_id column as a fallback, in case the previous rename migration was not applied
ALTER TABLE public.tasks
DROP COLUMN IF EXISTS skill_id;

-- This column was part of a previous design and is no longer needed.
ALTER TABLE public.tasks
DROP COLUMN IF EXISTS is_skill_related;
