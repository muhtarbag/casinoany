
-- Mevcut verileri affiliate_metrics'e aktar
INSERT INTO affiliate_metrics (
  site_id,
  metric_date,
  total_views,
  total_clicks,
  total_conversions,
  estimated_revenue
)
SELECT 
  bs.id,
  CURRENT_DATE - 1 as metric_date,
  COALESCE(ss.views, 0) as total_views,
  COALESCE(
    (SELECT COUNT(*) FROM conversions 
     WHERE site_id = bs.id AND conversion_type = 'affiliate_click'),
    0
  ) as total_clicks,
  COALESCE(
    (SELECT COUNT(*) FROM conversions WHERE site_id = bs.id),
    0
  ) as total_conversions,
  COALESCE(
    (SELECT COUNT(*) FROM conversions WHERE site_id = bs.id),
    0
  ) * 10.0 as estimated_revenue
FROM betting_sites bs
LEFT JOIN site_stats ss ON ss.site_id = bs.id
WHERE bs.is_active = true 
  AND bs.affiliate_contract_date IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM affiliate_metrics am 
    WHERE am.site_id = bs.id AND am.metric_date = CURRENT_DATE - 1
  )
ON CONFLICT (site_id, metric_date) DO NOTHING;

-- Günlük otomatik sync için cron job kur
SELECT cron.schedule(
  'daily-affiliate-metrics-sync',
  '0 1 * * *', -- Her gün saat 01:00'de
  $$
  SELECT public.sync_daily_affiliate_metrics();
  $$
);

COMMENT ON FUNCTION public.sync_daily_affiliate_metrics IS 'Günlük affiliate metriklerini otomatik senkronize eder';
