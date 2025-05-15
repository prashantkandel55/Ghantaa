-- Add role field to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee';

-- Update existing employees to set the first one as admin
UPDATE employees 
SET role = 'admin' 
WHERE id = 1;
