-- First, remove the foreign key column from the skills table
ALTER TABLE public.skills
DROP COLUMN IF EXISTS project_id;

-- Now, drop the projects table
DROP TABLE IF EXISTS public.projects;
