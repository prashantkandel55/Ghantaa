-- Add role and hourly_rate fields to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2) DEFAULT 15.00;

-- Update existing employees to set the first one as admin
UPDATE employees 
SET role = 'admin' 
WHERE id = 1;

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_codes table
CREATE TABLE IF NOT EXISTS admin_codes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin code
INSERT INTO admin_codes (code) VALUES ('ADMIN1234')
ON CONFLICT DO NOTHING;
