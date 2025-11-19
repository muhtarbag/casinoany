-- Create trigger for new complaints to send notifications
CREATE TRIGGER on_new_complaint
  AFTER INSERT ON public.site_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_complaint();

-- Create trigger for new/approved reviews to send notifications
CREATE TRIGGER on_new_review
  AFTER INSERT OR UPDATE ON public.site_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_review();