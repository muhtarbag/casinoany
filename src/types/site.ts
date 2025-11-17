// ✅ Centralized Site Type Definitions

import { Json } from '@/integrations/supabase/types';

export interface SiteData {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  affiliate_link: string;
  bonus?: string | null;
  rating?: number | null;
  avg_rating?: number | null;
  review_count?: number | null;
  is_active?: boolean | null;
  is_featured?: boolean | null;
  display_order?: number | null;
  features?: string[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  verdict?: string | null;
  expert_review?: string | null;
  login_guide?: string | null;
  withdrawal_guide?: string | null;
  game_categories?: Json | null;
  faq?: Json | null;
  block_styles?: Json | null;
  email?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  owner_id?: string | null;
}

export interface SiteWithStats extends SiteData {
  favoriteCount?: number;
  complaintsCount?: number;
  stats?: {
    views: number;
    clicks: number;
  };
}

export interface ComplaintResponse {
  id: string;
  complaint_id: string;
  user_id: string;
  response_text: string;
  is_official?: boolean;
  is_site_owner_response?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Complaint {
  id: string;
  site_id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved';
  severity: 'low' | 'medium' | 'high';
  is_public?: boolean;
  created_at: string;
  updated_at?: string;
  complaint_responses?: ComplaintResponse[];
}

export interface SiteReview {
  id: string;
  site_id: string;
  user_id?: string;
  rating: number;
  comment: string;
  is_approved?: boolean;
  created_at: string;
  updated_at?: string;
}
