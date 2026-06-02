-- Cleanup for the current Admin/HSA/SRC frontend.
-- Run this after deploying the matching backend changes.

-- 1. Normalize user roles to the frontend-supported set.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE users
SET role = 'SRC_STAFF'
WHERE role IN ('HOSPITAL_STAFF', 'HOSPITAL_ADMIN')
   OR role IS NULL
   OR role NOT IN ('ADMIN', 'HSA', 'SRC_STAFF');

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('ADMIN', 'HSA', 'SRC_STAFF'));

-- 2. Users no longer belong to hospitals.
ALTER TABLE users DROP CONSTRAINT IF EXISTS fkp6gav3u8g4bku2f3e87dmc2m7;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_hospital_id_fkey;
ALTER TABLE users DROP COLUMN IF EXISTS hospital_id;

-- 3. Hospital transfer/allocation workflow was removed from the frontend/backend.
DROP TABLE IF EXISTS blood_transfers CASCADE;

-- 4. Ensure the dedicated admin account exists.
INSERT INTO users (
  email,
  password,
  name,
  designation,
  contact_number,
  role
)
VALUES (
  'admin@codered.sg',
  '$2a$10$KYVbZ5JFVfqu0oV98LnF5eTk4QAp4CJdF1BZ8IX8sRe7jsBtW3nHe',
  'Admin',
  'System Administrator',
  NULL,
  'ADMIN'
)
ON CONFLICT (email) DO UPDATE
SET role = 'ADMIN',
    designation = 'System Administrator';
