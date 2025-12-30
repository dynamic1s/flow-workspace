-- Add a "type" column to the "skills" table
ALTER TABLE skills
ADD COLUMN type TEXT DEFAULT 'skill';

-- Rename the "skill_id" column to "goal_id" in the "time_entries" table
ALTER TABLE time_entries
RENAME COLUMN skill_id TO goal_id;

-- Drop the old trigger
DROP TRIGGER on_time_entry_change ON public.time_entries;

-- Update the function to use goal_id
CREATE OR REPLACE FUNCTION public.update_skill_total_seconds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds + NEW.duration_seconds,
        updated_at = now()
    WHERE id = NEW.goal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds - OLD.duration_seconds,
        updated_at = now()
    WHERE id = OLD.goal_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds - OLD.duration_seconds + NEW.duration_seconds,
        updated_at = now()
    WHERE id = NEW.goal_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_time_entry_change
  AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_skill_total_seconds();

-- Add a trigger to update the "updated_at" timestamp on the "skills" table
CREATE TRIGGER handle_updated_at_skills
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);
