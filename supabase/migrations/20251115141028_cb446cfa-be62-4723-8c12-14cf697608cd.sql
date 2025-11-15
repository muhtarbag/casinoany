-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'content_editor';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'seo_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';