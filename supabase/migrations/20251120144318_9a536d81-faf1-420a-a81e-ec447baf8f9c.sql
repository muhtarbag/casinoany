-- Enable notifications for site owners when new complaints are created
CREATE OR REPLACE FUNCTION notify_site_owner_on_new_complaint()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new complaints
DROP TRIGGER IF EXISTS trigger_notify_on_new_complaint ON site_complaints;
CREATE TRIGGER trigger_notify_on_new_complaint
  AFTER INSERT ON site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION notify_site_owner_on_new_complaint();

-- Enable notifications for site owners when complaints are approved
CREATE OR REPLACE FUNCTION notify_site_owner_on_complaint_approval()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for complaint approvals
DROP TRIGGER IF EXISTS trigger_notify_on_complaint_approval ON site_complaints;
CREATE TRIGGER trigger_notify_on_complaint_approval
  AFTER UPDATE ON site_complaints
  FOR EACH ROW
  WHEN (NEW.approval_status = 'approved')
  EXECUTE FUNCTION notify_site_owner_on_complaint_approval();

-- Enable notifications for site owners when reviews are approved
CREATE OR REPLACE FUNCTION notify_site_owner_on_review_approval()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for review approvals
DROP TRIGGER IF EXISTS trigger_notify_on_review_approval ON site_reviews;
CREATE TRIGGER trigger_notify_on_review_approval
  AFTER INSERT OR UPDATE ON site_reviews
  FOR EACH ROW
  WHEN (NEW.is_approved = TRUE)
  EXECUTE FUNCTION notify_site_owner_on_review_approval();