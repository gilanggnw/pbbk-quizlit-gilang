-- Add user_answers column to quiz_attempts table to store individual user answers

-- Add the column if it doesn't exist
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS user_answers JSONB;

-- Add a comment to describe the column
COMMENT ON COLUMN quiz_attempts.user_answers IS 'Stores user answers as JSON object with question_id as key and answer as value';
