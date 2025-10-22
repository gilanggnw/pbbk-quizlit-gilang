# Database Schema Update Instructions

## Run this SQL in your Supabase SQL Editor

Execute the migration script to add title and description columns to the quizzes table:

```sql
-- Add title and description columns to quizzes table
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
```

## After running the migration

1. The backend code has been updated to use the new title and description columns
2. When creating new quizzes, both title and description will be properly saved
3. Existing quizzes will have their title set to the PDF filename and a default description
4. The dashboard will now show meaningful titles and descriptions instead of just filenames

## Next Steps

After running this migration:
- Restart your backend server
- Create a new quiz to test the new fields
- The dashboard should now show proper quiz titles and descriptions
