-- Fix search_path for site owner notification functions
CREATE OR REPLACE FUNCTION notify_site_owner_on_new_complaint()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_owner_id UUID;
BEGIN
  -- Get the site owner's user_id
  SELECT owner_id INTO v_site_owner_id
  FROM betting_sites
  WHERE id = NEW.site_id;
  
  -- Only send notification if site has an owner
  IF v_site_owner_id IS NOT NULL THEN
    INSERT INTO site_owner_notifications (
      site_id,
      user_id,
      type,
      title,
      message,
      action_url
    ) VALUES (
      NEW.site_id,
      v_site_owner_id,
      'complaint',
      'Yeni Şikayet',
      'Siteniz hakkında "' || NEW.title || '" başlıklı yeni bir şikayet alındı.',
      '/panel/site-management'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_site_owner_on_complaint_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_owner_id UUID;
BEGIN
  -- Only notify on approval status change
  IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
    -- Get the site owner's user_id
    SELECT owner_id INTO v_site_owner_id
    FROM betting_sites
    WHERE id = NEW.site_id;
    
    -- Only send notification if site has an owner
    IF v_site_owner_id IS NOT NULL THEN
      INSERT INTO site_owner_notifications (
        site_id,
        user_id,
        type,
        title,
        message,
        action_url
      ) VALUES (
        NEW.site_id,
        v_site_owner_id,
        'complaint_approved',
        'Şikayet Yayınlandı',
        '"' || NEW.title || '" başlıklı şikayet yönetici tarafından onaylanarak yayınlandı.',
        '/panel/site-management'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_site_owner_on_review_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_site_owner_id UUID;
BEGIN
  -- Only notify on approval
  IF NEW.is_approved = TRUE AND (OLD IS NULL OR OLD.is_approved = FALSE) THEN
    -- Get the site owner's user_id
    SELECT owner_id INTO v_site_owner_id
    FROM betting_sites
    WHERE id = NEW.site_id;
    
    -- Only send notification if site has an owner
    IF v_site_owner_id IS NOT NULL THEN
      INSERT INTO site_owner_notifications (
        site_id,
        user_id,
        type,
        title,
        message,
        action_url
      ) VALUES (
        NEW.site_id,
        v_site_owner_id,
        'review',
        'Yeni Değerlendirme Onaylandı',
        'Siteniz ' || NEW.rating || ' yıldız aldı. "' || COALESCE(NEW.comment, 'Yorum yok') || '"',
        '/panel/site-management'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;