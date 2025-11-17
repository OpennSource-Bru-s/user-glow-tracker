-- Rename name column to first_name and add last_name column
ALTER TABLE tracked_users RENAME COLUMN name TO first_name;
ALTER TABLE tracked_users ADD COLUMN last_name text;

-- Update existing records to split names if they have spaces
UPDATE tracked_users 
SET last_name = SPLIT_PART(first_name, ' ', 2),
    first_name = SPLIT_PART(first_name, ' ', 1)
WHERE first_name LIKE '% %';
