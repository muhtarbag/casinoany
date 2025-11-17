-- Add foreign key from site_complaints to profiles
-- First drop the existing constraint to auth.users
ALTER TABLE site_complaints
DROP CONSTRAINT site_complaints_user_id_fkey;

-- Add new constraint to profiles
ALTER TABLE site_complaints
ADD CONSTRAINT site_complaints_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Same for complaint_responses
ALTER TABLE complaint_responses
DROP CONSTRAINT IF EXISTS complaint_responses_user_id_fkey;

ALTER TABLE complaint_responses
ADD CONSTRAINT complaint_responses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;