-- Add a "type" column to the "skills" table
ALTER TABLE skills
ADD COLUMN type TEXT DEFAULT 'skill';

-- Rename the "skill_id" column to "goal_id" in the "time_entries" table
ALTER TABLE time_entries
RENAME COLUMN skill_id TO goal_id;

-- Add a trigger to update the "updated_at" timestamp on the "skills" table
CREATE TRIGGER handle_updated_at_skills
BEFORE UPDATE ON skills
FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);
