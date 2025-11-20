-- Change default value for is_public to false for new complaints
ALTER TABLE site_complaints 
ALTER COLUMN is_public SET DEFAULT false;

-- Add approval_status column for better tracking
ALTER TABLE site_complaints 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' 
CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add approved_at and approved_by columns
ALTER TABLE site_complaints 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id);

-- Create index for faster querying by approval status
CREATE INDEX IF NOT EXISTS idx_site_complaints_approval_status 
ON site_complaints(approval_status);

-- Update existing complaints to be approved (backwards compatibility)
UPDATE site_complaints 
SET approval_status = 'approved', 
    is_public = true,
    approved_at = created_at
WHERE is_public = true;