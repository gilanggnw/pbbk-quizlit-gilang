-- Add title and description columns to quizzes table
-- This migration adds proper title and description fields to replace the generic pdf_filename usage

-- Add the new columns (allow NULL initially for existing data)
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS title VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT;

-- Migrate existing data: copy pdf_filename to title if title is null
UPDATE quizzes 
SET title = pdf_filename,
    description = 'Quiz generated from ' || pdf_filename
WHERE title IS NULL;

-- Now make title NOT NULL since all rows have values
ALTER TABLE quizzes 
ALTER COLUMN title SET NOT NULL;

-- Optional: Add default value for description
ALTER TABLE quizzes 
ALTER COLUMN description SET DEFAULT '';
