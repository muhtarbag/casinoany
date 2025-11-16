
-- ============================================
-- CRITICAL SECURITY FIX: Convert views to SECURITY INVOKER
-- Sprint 1 - Security Hardening Phase 2
-- Risk: RLS bypass prevention
-- ============================================

-- PostgreSQL views default to SECURITY DEFINER which bypasses RLS
-- Converting to SECURITY INVOKER enforces RLS policies of the querying user

-- Fix 1: betting_sites_full view
ALTER VIEW public.betting_sites_full SET (security_invoker = true);

-- Fix 2: performance_metrics view  
ALTER VIEW public.performance_metrics SET (security_invoker = true);

-- Add security comments
COMMENT ON VIEW public.betting_sites_full IS 
'Full betting sites view with SECURITY INVOKER - enforces RLS policies of querying user';

COMMENT ON VIEW public.performance_metrics IS 
'Database performance metrics with SECURITY INVOKER - enforces RLS policies of querying user';
