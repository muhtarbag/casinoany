-- Fix security warnings: Set search_path on functions

-- Fix notify_user_status_change function
CREATE OR REPLACE FUNCTION notify_user_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO user_status_notifications (
      user_id,
      notification_type,
      title,
      message
    )
    VALUES (
      NEW.user_id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'approval'
        WHEN NEW.status = 'rejected' THEN 'rejection'
        ELSE 'status_change'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Başvurunuz Onaylandı'
        WHEN NEW.status = 'rejected' THEN 'Başvurunuz Reddedildi'
        ELSE 'Durum Değişikliği'
      END,
      CASE 
        WHEN NEW.status = 'approved' THEN 'Başvurunuz başarıyla onaylandı. Artık panele erişebilirsiniz.'
        WHEN NEW.status = 'rejected' THEN 'Başvurunuz değerlendirmeye alındı ancak şu anda onaylanamamıştır.'
        ELSE 'Başvuru durumunuz güncellendi: ' || NEW.status
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;