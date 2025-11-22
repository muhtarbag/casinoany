export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          category: string
          code: string
          color: string
          created_at: string
          description: string
          display_order: number
          icon: string
          id: string
          is_active: boolean
          name: string
          points_reward: number
          requirement_type: string
          requirement_value: number | null
        }
        Insert: {
          category: string
          code: string
          color?: string
          created_at?: string
          description: string
          display_order?: number
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points_reward?: number
          requirement_type: string
          requirement_value?: number | null
        }
        Update: {
          category?: string
          code?: string
          color?: string
          created_at?: string
          description?: string
          display_order?: number
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points_reward?: number
          requirement_type?: string
          requirement_value?: number | null
        }
        Relationships: []
      }
      ad_banners: {
        Row: {
          alt_text: string | null
          banner_location: string
          banner_name: string
          banner_size: string
          campaign_id: string
          click_url: string
          cpc_rate: number | null
          cpm_rate: number | null
          created_at: string | null
          current_clicks: number | null
          current_impressions: number | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          max_clicks: number | null
          max_impressions: number | null
          mobile_image_url: string | null
          priority: number | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          banner_location: string
          banner_name: string
          banner_size: string
          campaign_id: string
          click_url: string
          cpc_rate?: number | null
          cpm_rate?: number | null
          created_at?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          max_clicks?: number | null
          max_impressions?: number | null
          mobile_image_url?: string | null
          priority?: number | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          banner_location?: string
          banner_name?: string
          banner_size?: string
          campaign_id?: string
          click_url?: string
          cpc_rate?: number | null
          cpm_rate?: number | null
          created_at?: string | null
          current_clicks?: number | null
          current_impressions?: number | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          max_clicks?: number | null
          max_impressions?: number | null
          mobile_image_url?: string | null
          priority?: number | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_banners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_campaigns: {
        Row: {
          advertiser_company: string | null
          advertiser_email: string
          advertiser_name: string
          advertiser_phone: string | null
          campaign_status: string
          campaign_type: string
          contract_terms: string | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          notes: string | null
          spent_budget: number | null
          start_date: string
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          advertiser_company?: string | null
          advertiser_email: string
          advertiser_name: string
          advertiser_phone?: string | null
          campaign_status?: string
          campaign_type: string
          contract_terms?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          spent_budget?: number | null
          start_date: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          advertiser_company?: string | null
          advertiser_email?: string
          advertiser_name?: string
          advertiser_phone?: string | null
          campaign_status?: string
          campaign_type?: string
          contract_terms?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          spent_budget?: number | null
          start_date?: string
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          banner_id: string
          browser: string | null
          campaign_id: string
          created_at: string | null
          device_type: string | null
          id: string
          impression_type: string
          ip_address: string | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          banner_id: string
          browser?: string | null
          campaign_id: string
          created_at?: string | null
          device_type?: string | null
          id?: string
          impression_type: string
          ip_address?: string | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          banner_id?: string
          browser?: string | null
          campaign_id?: string
          created_at?: string | null
          device_type?: string | null
          id?: string
          impression_type?: string
          ip_address?: string | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_impressions_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "ad_banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_impressions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_revenue: {
        Row: {
          campaign_id: string
          clicks_count: number | null
          created_at: string | null
          id: string
          impressions_count: number | null
          revenue_amount: number
          revenue_date: string
          revenue_type: string
        }
        Insert: {
          campaign_id: string
          clicks_count?: number | null
          created_at?: string | null
          id?: string
          impressions_count?: number | null
          revenue_amount?: number
          revenue_date: string
          revenue_type: string
        }
        Update: {
          campaign_id?: string
          clicks_count?: number | null
          created_at?: string | null
          id?: string
          impressions_count?: number | null
          revenue_amount?: number
          revenue_date?: string
          revenue_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_revenue_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_notification_preferences: {
        Row: {
          admin_id: string
          created_at: string | null
          notify_new_registrations: boolean | null
          notify_via_email: boolean | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          notify_new_registrations?: boolean | null
          notify_via_email?: boolean | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          notify_new_registrations?: boolean | null
          notify_via_email?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_metrics: {
        Row: {
          created_at: string
          estimated_revenue: number | null
          id: string
          metric_date: string
          notes: string | null
          site_id: string
          total_clicks: number
          total_conversions: number
          total_views: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_revenue?: number | null
          id?: string
          metric_date?: string
          notes?: string | null
          site_id: string
          total_clicks?: number
          total_conversions?: number
          total_views?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_revenue?: number | null
          id?: string
          metric_date?: string
          notes?: string | null
          site_id?: string
          total_clicks?: number
          total_conversions?: number
          total_views?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payments: {
        Row: {
          commission_percentage: number | null
          created_at: string
          id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_status: string
          payment_type: string
          site_id: string
          updated_at: string
        }
        Insert: {
          commission_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount: number
          payment_date: string
          payment_status?: string
          payment_type?: string
          site_id: string
          updated_at?: string
        }
        Update: {
          commission_percentage?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_status?: string
          payment_type?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payments_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_analysis_history: {
        Row: {
          actions: Json | null
          analysis_type: string
          content_data: Json | null
          created_at: string
          id: string
          metadata: Json | null
          provider: string
          score: number
          seo_data: Json | null
          serp_data: Json | null
          summary: string
          technical_data: Json | null
          ux_data: Json | null
        }
        Insert: {
          actions?: Json | null
          analysis_type: string
          content_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider: string
          score: number
          seo_data?: Json | null
          serp_data?: Json | null
          summary: string
          technical_data?: Json | null
          ux_data?: Json | null
        }
        Update: {
          actions?: Json | null
          analysis_type?: string
          content_data?: Json | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider?: string
          score?: number
          seo_data?: Json | null
          serp_data?: Json | null
          summary?: string
          technical_data?: Json | null
          ux_data?: Json | null
        }
        Relationships: []
      }
      ai_automated_changes: {
        Row: {
          applied_at: string | null
          approved_by: string | null
          change_type: string
          created_at: string
          field_name: string
          id: string
          metadata: Json | null
          new_value: string
          old_value: string | null
          reason: string
          status: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          applied_at?: string | null
          approved_by?: string | null
          change_type: string
          created_at?: string
          field_name: string
          id?: string
          metadata?: Json | null
          new_value: string
          old_value?: string | null
          reason: string
          status?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          applied_at?: string | null
          approved_by?: string | null
          change_type?: string
          created_at?: string
          field_name?: string
          id?: string
          metadata?: Json | null
          new_value?: string
          old_value?: string | null
          reason?: string
          status?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      alternative_domains: {
        Row: {
          blocked_at: string | null
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_checked_at: string | null
          notes: string | null
          priority: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          blocked_at?: string | null
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_checked_at?: string | null
          notes?: string | null
          priority?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          blocked_at?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_checked_at?: string | null
          notes?: string | null
          priority?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_call_logs: {
        Row: {
          created_at: string | null
          duration_ms: number
          endpoint: string
          error_message: string | null
          function_name: string
          id: string
          ip_address: string | null
          method: string
          request_body: Json | null
          response_body: Json | null
          status_code: number
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_ms: number
          endpoint: string
          error_message?: string | null
          function_name: string
          id?: string
          ip_address?: string | null
          method: string
          request_body?: Json | null
          response_body?: Json | null
          status_code: number
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_ms?: number
          endpoint?: string
          error_message?: string | null
          function_name?: string
          id?: string
          ip_address?: string | null
          method?: string
          request_body?: Json | null
          response_body?: Json | null
          status_code?: number
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          banned_until: string | null
          created_at: string | null
          function_name: string
          id: string
          ip_address: string
          request_count: number | null
          updated_at: string | null
          window_start: string | null
        }
        Insert: {
          banned_until?: string | null
          created_at?: string | null
          function_name: string
          id?: string
          ip_address: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Update: {
          banned_until?: string | null
          created_at?: string | null
          function_name?: string
          id?: string
          ip_address?: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      betting_sites: {
        Row: {
          affiliate_commission_percentage: number | null
          affiliate_contract_date: string | null
          affiliate_contract_terms: string | null
          affiliate_has_monthly_payment: boolean | null
          affiliate_link: string
          affiliate_monthly_payment: number | null
          affiliate_notes: string | null
          affiliate_panel_password: string | null
          affiliate_panel_url: string | null
          affiliate_panel_username: string | null
          avg_rating: number | null
          block_styles: Json | null
          bonus: string | null
          cons: string[] | null
          created_at: string | null
          discord: string | null
          display_order: number | null
          email: string | null
          expert_review: string | null
          facebook: string | null
          faq: Json | null
          features: string[] | null
          game_categories: Json | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_featured: boolean | null
          kick: string | null
          linkedin: string | null
          login_guide: string | null
          logo_url: string | null
          name: string
          owner_id: string | null
          ownership_verified: boolean | null
          pinterest: string | null
          pros: string[] | null
          rating: number | null
          review_count: number | null
          slug: string
          telegram: string | null
          telegram_channel: string | null
          twitter: string | null
          updated_at: string | null
          verdict: string | null
          whatsapp: string | null
          withdrawal_guide: string | null
          youtube: string | null
        }
        Insert: {
          affiliate_commission_percentage?: number | null
          affiliate_contract_date?: string | null
          affiliate_contract_terms?: string | null
          affiliate_has_monthly_payment?: boolean | null
          affiliate_link: string
          affiliate_monthly_payment?: number | null
          affiliate_notes?: string | null
          affiliate_panel_password?: string | null
          affiliate_panel_url?: string | null
          affiliate_panel_username?: string | null
          avg_rating?: number | null
          block_styles?: Json | null
          bonus?: string | null
          cons?: string[] | null
          created_at?: string | null
          discord?: string | null
          display_order?: number | null
          email?: string | null
          expert_review?: string | null
          facebook?: string | null
          faq?: Json | null
          features?: string[] | null
          game_categories?: Json | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          kick?: string | null
          linkedin?: string | null
          login_guide?: string | null
          logo_url?: string | null
          name: string
          owner_id?: string | null
          ownership_verified?: boolean | null
          pinterest?: string | null
          pros?: string[] | null
          rating?: number | null
          review_count?: number | null
          slug: string
          telegram?: string | null
          telegram_channel?: string | null
          twitter?: string | null
          updated_at?: string | null
          verdict?: string | null
          whatsapp?: string | null
          withdrawal_guide?: string | null
          youtube?: string | null
        }
        Update: {
          affiliate_commission_percentage?: number | null
          affiliate_contract_date?: string | null
          affiliate_contract_terms?: string | null
          affiliate_has_monthly_payment?: boolean | null
          affiliate_link?: string
          affiliate_monthly_payment?: number | null
          affiliate_notes?: string | null
          affiliate_panel_password?: string | null
          affiliate_panel_url?: string | null
          affiliate_panel_username?: string | null
          avg_rating?: number | null
          block_styles?: Json | null
          bonus?: string | null
          cons?: string[] | null
          created_at?: string | null
          discord?: string | null
          display_order?: number | null
          email?: string | null
          expert_review?: string | null
          facebook?: string | null
          faq?: Json | null
          features?: string[] | null
          game_categories?: Json | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          kick?: string | null
          linkedin?: string | null
          login_guide?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string | null
          ownership_verified?: boolean | null
          pinterest?: string | null
          pros?: string[] | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          telegram?: string | null
          telegram_channel?: string | null
          twitter?: string | null
          updated_at?: string | null
          verdict?: string | null
          whatsapp?: string | null
          withdrawal_guide?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      betting_sites_affiliate: {
        Row: {
          affiliate_commission_percentage: number | null
          affiliate_contract_date: string | null
          affiliate_contract_terms: string | null
          affiliate_has_monthly_payment: boolean | null
          affiliate_link: string
          affiliate_monthly_payment: number | null
          affiliate_notes: string | null
          affiliate_panel_password: string | null
          affiliate_panel_url: string | null
          affiliate_panel_username: string | null
          created_at: string | null
          id: string
          site_id: string
          updated_at: string | null
        }
        Insert: {
          affiliate_commission_percentage?: number | null
          affiliate_contract_date?: string | null
          affiliate_contract_terms?: string | null
          affiliate_has_monthly_payment?: boolean | null
          affiliate_link: string
          affiliate_monthly_payment?: number | null
          affiliate_notes?: string | null
          affiliate_panel_password?: string | null
          affiliate_panel_url?: string | null
          affiliate_panel_username?: string | null
          created_at?: string | null
          id?: string
          site_id: string
          updated_at?: string | null
        }
        Update: {
          affiliate_commission_percentage?: number | null
          affiliate_contract_date?: string | null
          affiliate_contract_terms?: string | null
          affiliate_has_monthly_payment?: boolean | null
          affiliate_link?: string
          affiliate_monthly_payment?: number | null
          affiliate_notes?: string | null
          affiliate_panel_password?: string | null
          affiliate_panel_url?: string | null
          affiliate_panel_username?: string | null
          created_at?: string | null
          id?: string
          site_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betting_sites_affiliate_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betting_sites_affiliate_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_sites_content: {
        Row: {
          block_styles: Json | null
          cons: string[] | null
          created_at: string | null
          expert_review: string | null
          faq: Json | null
          features: string[] | null
          game_categories: Json | null
          id: string
          login_guide: string | null
          pros: string[] | null
          site_id: string
          updated_at: string | null
          verdict: string | null
          withdrawal_guide: string | null
        }
        Insert: {
          block_styles?: Json | null
          cons?: string[] | null
          created_at?: string | null
          expert_review?: string | null
          faq?: Json | null
          features?: string[] | null
          game_categories?: Json | null
          id?: string
          login_guide?: string | null
          pros?: string[] | null
          site_id: string
          updated_at?: string | null
          verdict?: string | null
          withdrawal_guide?: string | null
        }
        Update: {
          block_styles?: Json | null
          cons?: string[] | null
          created_at?: string | null
          expert_review?: string | null
          faq?: Json | null
          features?: string[] | null
          game_categories?: Json | null
          id?: string
          login_guide?: string | null
          pros?: string[] | null
          site_id?: string
          updated_at?: string | null
          verdict?: string | null
          withdrawal_guide?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betting_sites_content_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betting_sites_content_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_sites_social: {
        Row: {
          created_at: string | null
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          site_id: string
          telegram: string | null
          twitter: string | null
          updated_at: string | null
          whatsapp: string | null
          youtube: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          site_id: string
          telegram?: string | null
          twitter?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          site_id?: string
          telegram?: string | null
          twitter?: string | null
          updated_at?: string | null
          whatsapp?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betting_sites_social_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "betting_sites_social_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          comment: string
          created_at: string
          email: string | null
          id: string
          is_approved: boolean | null
          name: string | null
          post_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string | null
          post_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_related_sites: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          post_id: string
          site_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          post_id: string
          site_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          post_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_related_sites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_related_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_related_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          category_id: string | null
          content: string
          created_at: string
          display_order: number | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          like_count: number
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          primary_site_id: string | null
          published_at: string | null
          read_time: number | null
          scheduled_publish_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          like_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          primary_site_id?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_publish_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          like_count?: number
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          primary_site_id?: string | null
          published_at?: string | null
          read_time?: number | null
          scheduled_publish_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_primary_site_id_fkey"
            columns: ["primary_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_primary_site_id_fkey"
            columns: ["primary_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_offers: {
        Row: {
          bonus_amount: string
          bonus_type: string
          created_at: string | null
          display_order: number | null
          eligibility: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          site_id: string | null
          terms: string | null
          title: string
          updated_at: string | null
          validity_period: string | null
          wagering_requirement: string | null
        }
        Insert: {
          bonus_amount: string
          bonus_type?: string
          created_at?: string | null
          display_order?: number | null
          eligibility?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          site_id?: string | null
          terms?: string | null
          title: string
          updated_at?: string | null
          validity_period?: string | null
          wagering_requirement?: string | null
        }
        Update: {
          bonus_amount?: string
          bonus_type?: string
          created_at?: string | null
          display_order?: number | null
          eligibility?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          site_id?: string | null
          terms?: string | null
          title?: string
          updated_at?: string | null
          validity_period?: string | null
          wagering_requirement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonus_offers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_offers_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          notification_id: string
          phone: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          notification_id: string
          phone: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          notification_id?: string
          phone?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "site_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_content_versions: {
        Row: {
          block_styles: Json | null
          cons: string[] | null
          created_at: string | null
          created_by: string | null
          expert_review: string | null
          faq: Json | null
          game_categories: Json | null
          generation_source: string
          id: string
          login_guide: string | null
          metadata: Json | null
          pros: string[] | null
          site_id: string
          verdict: string | null
          withdrawal_guide: string | null
        }
        Insert: {
          block_styles?: Json | null
          cons?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expert_review?: string | null
          faq?: Json | null
          game_categories?: Json | null
          generation_source?: string
          id?: string
          login_guide?: string | null
          metadata?: Json | null
          pros?: string[] | null
          site_id: string
          verdict?: string | null
          withdrawal_guide?: string | null
        }
        Update: {
          block_styles?: Json | null
          cons?: string[] | null
          created_at?: string | null
          created_by?: string | null
          expert_review?: string | null
          faq?: Json | null
          game_categories?: Json | null
          generation_source?: string
          id?: string
          login_guide?: string | null
          metadata?: Json | null
          pros?: string[] | null
          site_id?: string
          verdict?: string | null
          withdrawal_guide?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casino_content_versions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_content_versions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          content: string | null
          content_updated_at: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          content?: string | null
          content_updated_at?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          content?: string | null
          content_updated_at?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      change_history: {
        Row: {
          action_type: string
          batch_id: string | null
          created_at: string
          id: string
          is_undone: boolean | null
          metadata: Json | null
          new_data: Json | null
          previous_data: Json | null
          record_id: string | null
          record_ids: string[] | null
          table_name: string
          undone_at: string | null
          undone_by: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          batch_id?: string | null
          created_at?: string
          id?: string
          is_undone?: boolean | null
          metadata?: Json | null
          new_data?: Json | null
          previous_data?: Json | null
          record_id?: string | null
          record_ids?: string[] | null
          table_name: string
          undone_at?: string | null
          undone_by?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          batch_id?: string | null
          created_at?: string
          id?: string
          is_undone?: boolean | null
          metadata?: Json | null
          new_data?: Json | null
          previous_data?: Json | null
          record_id?: string | null
          record_ids?: string[] | null
          table_name?: string
          undone_at?: string | null
          undone_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      complaint_likes: {
        Row: {
          complaint_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_likes_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "site_complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_responses: {
        Row: {
          complaint_id: string
          created_at: string | null
          id: string
          is_official: boolean | null
          is_site_owner_response: boolean | null
          response_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string | null
          id?: string
          is_official?: boolean | null
          is_site_owner_response?: boolean | null
          response_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string | null
          id?: string
          is_official?: boolean | null
          is_site_owner_response?: boolean | null
          response_text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_responses_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "site_complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_optimization_suggestions: {
        Row: {
          applied_at: string | null
          created_at: string
          current_value: string | null
          id: string
          impact: string
          metadata: Json | null
          post_id: string | null
          reason: string
          status: string
          suggested_value: string
          suggestion_type: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          current_value?: string | null
          id?: string
          impact: string
          metadata?: Json | null
          post_id?: string | null
          reason: string
          status?: string
          suggested_value: string
          suggestion_type: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          current_value?: string | null
          id?: string
          impact?: string
          metadata?: Json | null
          post_id?: string | null
          reason?: string
          status?: string
          suggested_value?: string
          suggestion_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_optimization_suggestions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversions: {
        Row: {
          conversion_type: string
          conversion_value: number | null
          created_at: string
          id: string
          metadata: Json | null
          page_path: string
          session_id: string | null
          site_id: string | null
          user_id: string | null
        }
        Insert: {
          conversion_type: string
          conversion_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path: string
          session_id?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Update: {
          conversion_type?: string
          conversion_value?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string | null
          site_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversions_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_tracking: {
        Row: {
          context_text: string | null
          created_at: string | null
          domain: string
          flagged_at: string | null
          flagged_by: string | null
          flagged_reason: string | null
          full_url: string
          id: string
          is_flagged: boolean | null
          is_whitelisted: boolean | null
          source_column: string
          source_record_id: string
          source_table: string
          updated_at: string | null
          user_id: string | null
          whitelist_reason: string | null
          whitelisted_at: string | null
          whitelisted_by: string | null
        }
        Insert: {
          context_text?: string | null
          created_at?: string | null
          domain: string
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          full_url: string
          id?: string
          is_flagged?: boolean | null
          is_whitelisted?: boolean | null
          source_column: string
          source_record_id: string
          source_table: string
          updated_at?: string | null
          user_id?: string | null
          whitelist_reason?: string | null
          whitelisted_at?: string | null
          whitelisted_by?: string | null
        }
        Update: {
          context_text?: string | null
          created_at?: string | null
          domain?: string
          flagged_at?: string | null
          flagged_by?: string | null
          flagged_reason?: string | null
          full_url?: string
          id?: string
          is_flagged?: boolean | null
          is_whitelisted?: boolean | null
          source_column?: string
          source_record_id?: string
          source_table?: string
          updated_at?: string | null
          user_id?: string | null
          whitelist_reason?: string | null
          whitelisted_at?: string | null
          whitelisted_by?: string | null
        }
        Relationships: []
      }
      footer_links: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          section: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          section?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          section?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      internal_links: {
        Row: {
          ai_relevance_score: number | null
          anchor_text: string
          click_count: number | null
          context_snippet: string | null
          conversion_count: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          link_type: string
          metadata: Json | null
          position_in_content: number | null
          source_page: string
          source_type: string
          target_page: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          ai_relevance_score?: number | null
          anchor_text: string
          click_count?: number | null
          context_snippet?: string | null
          conversion_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          link_type?: string
          metadata?: Json | null
          position_in_content?: number | null
          source_page: string
          source_type: string
          target_page: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          ai_relevance_score?: number | null
          anchor_text?: string
          click_count?: number | null
          context_snippet?: string | null
          conversion_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          link_type?: string
          metadata?: Json | null
          position_in_content?: number | null
          source_page?: string
          source_type?: string
          target_page?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      link_performance: {
        Row: {
          avg_time_on_target: number | null
          bounce_rate: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          link_id: string | null
          updated_at: string | null
        }
        Insert: {
          avg_time_on_target?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          link_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_time_on_target?: number | null
          bounce_rate?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          link_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_performance_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "internal_links"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean
          min_tier: string | null
          points_cost: number
          reward_type: string
          reward_value: string | null
          stock_quantity: number | null
          terms: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_tier?: string | null
          points_cost: number
          reward_type: string
          reward_value?: string | null
          stock_quantity?: number | null
          terms?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_tier?: string | null
          points_cost?: number
          reward_type?: string
          reward_value?: string | null
          stock_quantity?: number | null
          terms?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          metadata: Json | null
          points: number
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          points: number
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          points?: number
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          category: string | null
          content: string
          content_html: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          slug: string
          source_feed: string
          source_url: string
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug: string
          source_feed: string
          source_url: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          content_html?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          slug?: string
          source_feed?: string
          source_url?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      notification_views: {
        Row: {
          clicked: boolean | null
          clicked_at: string | null
          dismissed: boolean | null
          id: string
          notification_id: string
          session_id: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          clicked?: boolean | null
          clicked_at?: string | null
          dismissed?: boolean | null
          id?: string
          notification_id: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          clicked?: boolean | null
          clicked_at?: string | null
          dismissed?: boolean | null
          id?: string
          notification_id?: string
          session_id?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_views_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "site_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_verifications: {
        Row: {
          application_id: string
          created_at: string | null
          expires_at: string
          id: string
          metadata: Json | null
          updated_at: string | null
          verification_code: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          verification_code: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          verification_code?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ownership_verifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "site_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration: number | null
          id: string
          metadata: Json | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration?: number | null
          id?: string
          metadata?: Json | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pagespeed_history: {
        Row: {
          cls: number | null
          created_at: string | null
          fcp: number | null
          fetch_time: number | null
          id: string
          lcp: number | null
          lighthouse_version: string | null
          metadata: Json | null
          performance_score: number | null
          si: number | null
          strategy: string | null
          tbt: number | null
          test_date: string | null
          url: string
        }
        Insert: {
          cls?: number | null
          created_at?: string | null
          fcp?: number | null
          fetch_time?: number | null
          id?: string
          lcp?: number | null
          lighthouse_version?: string | null
          metadata?: Json | null
          performance_score?: number | null
          si?: number | null
          strategy?: string | null
          tbt?: number | null
          test_date?: string | null
          url: string
        }
        Update: {
          cls?: number | null
          created_at?: string | null
          fcp?: number | null
          fetch_time?: number | null
          id?: string
          lcp?: number | null
          lighthouse_version?: string | null
          metadata?: Json | null
          performance_score?: number | null
          si?: number | null
          strategy?: string | null
          tbt?: number | null
          test_date?: string | null
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio_link: string | null
          city: string | null
          company_address: string | null
          company_authorized_person: string | null
          company_description: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_tax_number: string | null
          company_type: string | null
          company_website: string | null
          contact_person_name: string | null
          contact_teams: string | null
          contact_telegram: string | null
          contact_whatsapp: string | null
          created_at: string | null
          district: string | null
          email: string | null
          favorite_game_providers: string[] | null
          favorite_team: string | null
          first_name: string | null
          id: string
          interests: string[] | null
          is_verified: boolean | null
          last_name: string | null
          phone: string | null
          social_discord: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_kick: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_telegram_channel: string | null
          social_twitter: string | null
          social_youtube: string | null
          support_email: string | null
          telegram_chat_id: string | null
          telegram_notifications_enabled: boolean | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio_link?: string | null
          city?: string | null
          company_address?: string | null
          company_authorized_person?: string | null
          company_description?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tax_number?: string | null
          company_type?: string | null
          company_website?: string | null
          contact_person_name?: string | null
          contact_teams?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          favorite_game_providers?: string[] | null
          favorite_team?: string | null
          first_name?: string | null
          id: string
          interests?: string[] | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          social_discord?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_kick?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_telegram_channel?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          support_email?: string | null
          telegram_chat_id?: string | null
          telegram_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio_link?: string | null
          city?: string | null
          company_address?: string | null
          company_authorized_person?: string | null
          company_description?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_tax_number?: string | null
          company_type?: string | null
          company_website?: string | null
          contact_person_name?: string | null
          contact_teams?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          district?: string | null
          email?: string | null
          favorite_game_providers?: string[] | null
          favorite_team?: string | null
          first_name?: string | null
          id?: string
          interests?: string[] | null
          is_verified?: boolean | null
          last_name?: string | null
          phone?: string | null
          social_discord?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_kick?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_telegram_channel?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          support_email?: string | null
          telegram_chat_id?: string | null
          telegram_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          username?: string
        }
        Relationships: []
      }
      recommended_sites_pool: {
        Row: {
          created_at: string
          display_order: number
          id: string
          site_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          site_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommended_sites_pool_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommended_sites_pool_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_history: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          points_awarded: number
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          points_awarded?: number
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string | null
          id: string
          last_searched_at: string | null
          search_count: number
          search_term: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          search_count?: number
          search_term: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_searched_at?: string | null
          search_count?: number
          search_term?: string
        }
        Relationships: []
      }
      seo_keywords: {
        Row: {
          created_at: string
          current_rank: number | null
          difficulty: number | null
          id: string
          keyword: string
          metadata: Json | null
          related_post_id: string | null
          search_volume: number | null
          status: string
          target_rank: number | null
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          difficulty?: number | null
          id?: string
          keyword: string
          metadata?: Json | null
          related_post_id?: string | null
          search_volume?: number | null
          status?: string
          target_rank?: number | null
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          difficulty?: number | null
          id?: string
          keyword?: string
          metadata?: Json | null
          related_post_id?: string | null
          search_volume?: number | null
          status?: string
          target_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_keywords_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_addition_requests: {
        Row: {
          created_at: string
          created_site_id: string | null
          description: string | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          site_name: string
          site_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_site_id?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_name: string
          site_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_site_id?: string | null
          description?: string | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          site_name?: string
          site_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_addition_requests_created_site_id_fkey"
            columns: ["created_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_addition_requests_created_site_id_fkey"
            columns: ["created_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_badges: {
        Row: {
          badge_color: string
          badge_icon: string
          badge_label: string
          badge_type: string
          created_at: string | null
          criteria_met: Json | null
          display_order: number | null
          earned_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          site_id: string
        }
        Insert: {
          badge_color?: string
          badge_icon?: string
          badge_label: string
          badge_type: string
          created_at?: string | null
          criteria_met?: Json | null
          display_order?: number | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          site_id: string
        }
        Update: {
          badge_color?: string
          badge_icon?: string
          badge_label?: string
          badge_type?: string
          created_at?: string | null
          criteria_met?: Json | null
          display_order?: number | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_badges_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_badges_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_banners: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          display_pages: string[] | null
          id: string
          image_url: string
          is_active: boolean | null
          mobile_image_url: string | null
          position: number
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          display_pages?: string[] | null
          id?: string
          image_url: string
          is_active?: boolean | null
          mobile_image_url?: string | null
          position?: number
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          display_pages?: string[] | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          mobile_image_url?: string | null
          position?: number
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_categories: {
        Row: {
          category_id: string
          created_at: string | null
          display_order: number | null
          id: string
          site_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          site_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_categories_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_categories_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_complaints: {
        Row: {
          anonymous_email: string | null
          anonymous_name: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: string
          created_at: string | null
          description: string
          helpful_count: number | null
          id: string
          is_public: boolean | null
          resolved_at: string | null
          response_count: number | null
          severity: string
          site_id: string
          slug: string | null
          status: string
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category: string
          created_at?: string | null
          description: string
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          resolved_at?: string | null
          response_count?: number | null
          severity?: string
          site_id: string
          slug?: string | null
          status?: string
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          created_at?: string | null
          description?: string
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          resolved_at?: string | null
          response_count?: number | null
          severity?: string
          site_id?: string
          slug?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_complaints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_complaints_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_complaints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_keywords: {
        Row: {
          best_rank: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          current_rank: number | null
          difficulty: number | null
          first_tracked_at: string | null
          id: string
          impressions: number | null
          is_target_keyword: boolean | null
          keyword: string
          last_checked_at: string | null
          previous_rank: number | null
          priority: string | null
          rank_change: number | null
          search_volume: number | null
          site_id: string
          trend: string | null
          updated_at: string | null
          worst_rank: number | null
        }
        Insert: {
          best_rank?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          current_rank?: number | null
          difficulty?: number | null
          first_tracked_at?: string | null
          id?: string
          impressions?: number | null
          is_target_keyword?: boolean | null
          keyword: string
          last_checked_at?: string | null
          previous_rank?: number | null
          priority?: string | null
          rank_change?: number | null
          search_volume?: number | null
          site_id: string
          trend?: string | null
          updated_at?: string | null
          worst_rank?: number | null
        }
        Update: {
          best_rank?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          current_rank?: number | null
          difficulty?: number | null
          first_tracked_at?: string | null
          id?: string
          impressions?: number | null
          is_target_keyword?: boolean | null
          keyword?: string
          last_checked_at?: string | null
          previous_rank?: number | null
          priority?: string | null
          rank_change?: number | null
          search_volume?: number | null
          site_id?: string
          trend?: string | null
          updated_at?: string | null
          worst_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_keywords_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_keywords_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_notifications: {
        Row: {
          background_color: string | null
          border_color: string | null
          border_radius: string | null
          border_width: string | null
          button_text: string | null
          button_url: string | null
          content: string | null
          created_at: string
          created_by: string | null
          display_frequency: string | null
          display_pages: string[] | null
          end_date: string | null
          font_family: string | null
          font_size: string | null
          form_fields: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_width: string | null
          notification_type: string
          padding: string | null
          priority: number | null
          shadow_size: string | null
          start_date: string | null
          target_url: string | null
          text_color: string | null
          title: string
          trigger_conditions: Json | null
          trigger_type: string | null
          updated_at: string
          user_segments: string[] | null
        }
        Insert: {
          background_color?: string | null
          border_color?: string | null
          border_radius?: string | null
          border_width?: string | null
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          display_pages?: string[] | null
          end_date?: string | null
          font_family?: string | null
          font_size?: string | null
          form_fields?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_width?: string | null
          notification_type?: string
          padding?: string | null
          priority?: number | null
          shadow_size?: string | null
          start_date?: string | null
          target_url?: string | null
          text_color?: string | null
          title: string
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
          user_segments?: string[] | null
        }
        Update: {
          background_color?: string | null
          border_color?: string | null
          border_radius?: string | null
          border_width?: string | null
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          display_pages?: string[] | null
          end_date?: string | null
          font_family?: string | null
          font_size?: string | null
          form_fields?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_width?: string | null
          notification_type?: string
          padding?: string | null
          priority?: number | null
          shadow_size?: string | null
          start_date?: string | null
          target_url?: string | null
          text_color?: string | null
          title?: string
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
          user_segments?: string[] | null
        }
        Relationships: []
      }
      site_owner_notification_settings: {
        Row: {
          created_at: string | null
          id: string
          notify_on_complaint: boolean | null
          notify_on_review: boolean | null
          notify_on_system_message: boolean | null
          telegram_chat_id: string | null
          telegram_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notify_on_complaint?: boolean | null
          notify_on_review?: boolean | null
          notify_on_system_message?: boolean | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notify_on_complaint?: boolean | null
          notify_on_review?: boolean | null
          notify_on_system_message?: boolean | null
          telegram_chat_id?: string | null
          telegram_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_owner_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          site_id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          site_id: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          site_id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_owner_notifications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_owner_notifications_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_owners: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          company_name: string | null
          contact_email: string | null
          contact_person_name: string | null
          contact_teams: string | null
          contact_telegram: string | null
          contact_whatsapp: string | null
          created_at: string | null
          description: string | null
          id: string
          infrastructure_notes: string | null
          infrastructure_provider: string | null
          logo_url: string | null
          new_site_name: string | null
          ownership_verified: boolean | null
          site_id: string | null
          social_bio_link: string | null
          social_discord: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_kick: string | null
          social_linkedin: string | null
          social_pinterest: string | null
          social_telegram_channel: string | null
          social_twitter: string | null
          social_youtube: string | null
          status: string | null
          support_email: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_teams?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          infrastructure_notes?: string | null
          infrastructure_provider?: string | null
          logo_url?: string | null
          new_site_name?: string | null
          ownership_verified?: boolean | null
          site_id?: string | null
          social_bio_link?: string | null
          social_discord?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_kick?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_telegram_channel?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          status?: string | null
          support_email?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_person_name?: string | null
          contact_teams?: string | null
          contact_telegram?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          infrastructure_notes?: string | null
          infrastructure_provider?: string | null
          logo_url?: string | null
          new_site_name?: string | null
          ownership_verified?: boolean | null
          site_id?: string | null
          social_bio_link?: string | null
          social_discord?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_kick?: string | null
          social_linkedin?: string | null
          social_pinterest?: string | null
          social_telegram_channel?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          status?: string | null
          support_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_owners_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_owners_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_popularity_metrics: {
        Row: {
          active_users_now: number | null
          category_rank: number | null
          clicks_today: number | null
          created_at: string | null
          id: string
          is_rising_star: boolean | null
          is_trending: boolean | null
          last_bonus_claim_at: string | null
          last_complaint_at: string | null
          last_review_at: string | null
          metric_date: string
          overall_rank: number | null
          popularity_score: number | null
          registrations_today: number | null
          site_id: string
          trend_score: number | null
          updated_at: string | null
          views_today: number | null
        }
        Insert: {
          active_users_now?: number | null
          category_rank?: number | null
          clicks_today?: number | null
          created_at?: string | null
          id?: string
          is_rising_star?: boolean | null
          is_trending?: boolean | null
          last_bonus_claim_at?: string | null
          last_complaint_at?: string | null
          last_review_at?: string | null
          metric_date?: string
          overall_rank?: number | null
          popularity_score?: number | null
          registrations_today?: number | null
          site_id: string
          trend_score?: number | null
          updated_at?: string | null
          views_today?: number | null
        }
        Update: {
          active_users_now?: number | null
          category_rank?: number | null
          clicks_today?: number | null
          created_at?: string | null
          id?: string
          is_rising_star?: boolean | null
          is_trending?: boolean | null
          last_bonus_claim_at?: string | null
          last_complaint_at?: string | null
          last_review_at?: string | null
          metric_date?: string
          overall_rank?: number | null
          popularity_score?: number | null
          registrations_today?: number | null
          site_id?: string
          trend_score?: number | null
          updated_at?: string | null
          views_today?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_popularity_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_popularity_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_recommended_sites: {
        Row: {
          created_at: string
          display_order: number
          id: string
          recommended_site_id: string
          site_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          recommended_site_id: string
          site_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          recommended_site_id?: string
          site_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_recommended_sites_recommended_site_id_fkey"
            columns: ["recommended_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_recommended_sites_recommended_site_id_fkey"
            columns: ["recommended_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_recommended_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_recommended_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_reputation_scores: {
        Row: {
          activity_score: number | null
          avg_response_time_hours: number | null
          complaint_resolution_rate: number | null
          complaint_resolution_score: number | null
          created_at: string | null
          id: string
          last_calculated_at: string | null
          rating_score: number | null
          reputation_score: number
          resolved_complaints: number | null
          response_time_score: number | null
          review_score: number | null
          score_history: Json | null
          site_id: string
          total_complaints: number | null
          trust_level: string
          updated_at: string | null
        }
        Insert: {
          activity_score?: number | null
          avg_response_time_hours?: number | null
          complaint_resolution_rate?: number | null
          complaint_resolution_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          rating_score?: number | null
          reputation_score?: number
          resolved_complaints?: number | null
          response_time_score?: number | null
          review_score?: number | null
          score_history?: Json | null
          site_id: string
          total_complaints?: number | null
          trust_level?: string
          updated_at?: string | null
        }
        Update: {
          activity_score?: number | null
          avg_response_time_hours?: number | null
          complaint_resolution_rate?: number | null
          complaint_resolution_score?: number | null
          created_at?: string | null
          id?: string
          last_calculated_at?: string | null
          rating_score?: number | null
          reputation_score?: number
          resolved_complaints?: number | null
          response_time_score?: number | null
          review_score?: number | null
          score_history?: Json | null
          site_id?: string
          total_complaints?: number | null
          trust_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_reputation_scores_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_reputation_scores_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_review_highlights: {
        Row: {
          created_at: string | null
          display_order: number | null
          highlight_type: string
          id: string
          is_active: boolean | null
          review_id: string
          site_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          highlight_type: string
          id?: string
          is_active?: boolean | null
          review_id: string
          site_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          highlight_type?: string
          id?: string
          is_active?: boolean | null
          review_id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_review_highlights_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "site_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_review_highlights_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_review_highlights_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_reviews: {
        Row: {
          comment: string
          created_at: string | null
          email: string | null
          id: string
          is_approved: boolean | null
          name: string | null
          rating: number
          site_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string | null
          rating: number
          site_id: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string | null
          rating?: number
          site_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_reviews_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_reviews_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_seo_metrics: {
        Row: {
          content_length: number | null
          content_score: number | null
          created_at: string | null
          critical_issues: number | null
          has_meta_description: boolean | null
          has_meta_title: boolean | null
          heading_structure: Json | null
          id: string
          image_alt_coverage: number | null
          last_analyzed_at: string | null
          meta_description_length: number | null
          meta_score: number | null
          meta_title_length: number | null
          performance_score: number | null
          recommendations: Json | null
          seo_score: number | null
          site_id: string
          technical_score: number | null
          updated_at: string | null
          warnings: number | null
        }
        Insert: {
          content_length?: number | null
          content_score?: number | null
          created_at?: string | null
          critical_issues?: number | null
          has_meta_description?: boolean | null
          has_meta_title?: boolean | null
          heading_structure?: Json | null
          id?: string
          image_alt_coverage?: number | null
          last_analyzed_at?: string | null
          meta_description_length?: number | null
          meta_score?: number | null
          meta_title_length?: number | null
          performance_score?: number | null
          recommendations?: Json | null
          seo_score?: number | null
          site_id: string
          technical_score?: number | null
          updated_at?: string | null
          warnings?: number | null
        }
        Update: {
          content_length?: number | null
          content_score?: number | null
          created_at?: string | null
          critical_issues?: number | null
          has_meta_description?: boolean | null
          has_meta_title?: boolean | null
          heading_structure?: Json | null
          id?: string
          image_alt_coverage?: number | null
          last_analyzed_at?: string | null
          meta_description_length?: number | null
          meta_score?: number | null
          meta_title_length?: number | null
          performance_score?: number | null
          recommendations?: Json | null
          seo_score?: number | null
          site_id?: string
          technical_score?: number | null
          updated_at?: string | null
          warnings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_seo_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_seo_metrics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_stats: {
        Row: {
          clicks: number | null
          created_at: string | null
          email_clicks: number | null
          facebook_clicks: number | null
          id: string
          instagram_clicks: number | null
          site_id: string
          telegram_clicks: number | null
          twitter_clicks: number | null
          updated_at: string | null
          views: number | null
          whatsapp_clicks: number | null
          youtube_clicks: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          email_clicks?: number | null
          facebook_clicks?: number | null
          id?: string
          instagram_clicks?: number | null
          site_id: string
          telegram_clicks?: number | null
          twitter_clicks?: number | null
          updated_at?: string | null
          views?: number | null
          whatsapp_clicks?: number | null
          youtube_clicks?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          email_clicks?: number | null
          facebook_clicks?: number | null
          id?: string
          instagram_clicks?: number | null
          site_id?: string
          telegram_clicks?: number | null
          twitter_clicks?: number | null
          updated_at?: string | null
          views?: number | null
          whatsapp_clicks?: number | null
          youtube_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_traffic_sources: {
        Row: {
          created_at: string | null
          direct_conversions: number | null
          direct_views: number | null
          id: string
          metric_date: string
          organic_conversions: number | null
          organic_views: number | null
          referral_conversions: number | null
          referral_views: number | null
          site_id: string
          social_conversions: number | null
          social_views: number | null
          top_referrers: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          direct_conversions?: number | null
          direct_views?: number | null
          id?: string
          metric_date?: string
          organic_conversions?: number | null
          organic_views?: number | null
          referral_conversions?: number | null
          referral_views?: number | null
          site_id: string
          social_conversions?: number | null
          social_views?: number | null
          top_referrers?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          direct_conversions?: number | null
          direct_views?: number | null
          id?: string
          metric_date?: string
          organic_conversions?: number | null
          organic_views?: number | null
          referral_conversions?: number | null
          referral_views?: number | null
          site_id?: string
          social_conversions?: number | null
          social_views?: number | null
          top_referrers?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_traffic_sources_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_traffic_sources_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      site_user_behavior: {
        Row: {
          avg_scroll_depth: number | null
          avg_session_duration: number | null
          bounce_rate: number | null
          created_at: string | null
          desktop_users: number | null
          hourly_distribution: Json | null
          id: string
          metric_date: string
          mobile_users: number | null
          pages_per_session: number | null
          peak_hours: Json | null
          site_id: string
          tablet_users: number | null
          updated_at: string | null
        }
        Insert: {
          avg_scroll_depth?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          desktop_users?: number | null
          hourly_distribution?: Json | null
          id?: string
          metric_date?: string
          mobile_users?: number | null
          pages_per_session?: number | null
          peak_hours?: Json | null
          site_id: string
          tablet_users?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_scroll_depth?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          desktop_users?: number | null
          hourly_distribution?: Json | null
          id?: string
          metric_date?: string
          mobile_users?: number | null
          pages_per_session?: number | null
          peak_hours?: Json | null
          site_id?: string
          tablet_users?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_user_behavior_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_user_behavior_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      super_lig_fixtures: {
        Row: {
          away_score: number | null
          away_team_id: string
          created_at: string
          home_score: number | null
          home_team_id: string
          id: string
          match_date: string | null
          season: string
          status: string
          updated_at: string
          venue: string | null
          week: number
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          created_at?: string
          home_score?: number | null
          home_team_id: string
          id?: string
          match_date?: string | null
          season?: string
          status?: string
          updated_at?: string
          venue?: string | null
          week: number
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          created_at?: string
          home_score?: number | null
          home_team_id?: string
          id?: string
          match_date?: string | null
          season?: string
          status?: string
          updated_at?: string
          venue?: string | null
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "super_lig_fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "super_lig_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_lig_fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "super_lig_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      super_lig_standings: {
        Row: {
          drawn: number
          goal_difference: number
          goals_against: number
          goals_for: number
          id: string
          lost: number
          played: number
          points: number
          position: number
          season: string
          team_id: string
          updated_at: string
          won: number
        }
        Insert: {
          drawn?: number
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position: number
          season?: string
          team_id: string
          updated_at?: string
          won?: number
        }
        Update: {
          drawn?: number
          goal_difference?: number
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position?: number
          season?: string
          team_id?: string
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "super_lig_standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "super_lig_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      super_lig_teams: {
        Row: {
          coach: string | null
          created_at: string
          founded_year: number | null
          id: string
          logo_url: string | null
          name: string
          short_name: string | null
          stadium: string | null
          updated_at: string
        }
        Insert: {
          coach?: string | null
          created_at?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name: string
          short_name?: string | null
          stadium?: string | null
          updated_at?: string
        }
        Update: {
          coach?: string | null
          created_at?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string | null
          stadium?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          id: string
          ip_address: string | null
          log_type: string
          metadata: Json | null
          resource: string | null
          session_id: string | null
          severity: string
          stack_trace: string | null
          status_code: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          log_type: string
          metadata?: Json | null
          resource?: string | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          log_type?: string
          metadata?: Json | null
          resource?: string | null
          session_id?: string | null
          severity?: string
          stack_trace?: string | null
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_code: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_code: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_code?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_code_fkey"
            columns: ["achievement_code"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["code"]
          },
        ]
      }
      user_bonus_tracking: {
        Row: {
          bonus_amount: number
          bonus_type: string
          created_at: string | null
          expiry_date: string | null
          id: string
          notes: string | null
          received_date: string
          site_id: string
          status: string
          updated_at: string | null
          user_id: string
          wagering_requirement: string | null
        }
        Insert: {
          bonus_amount: number
          bonus_type: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          received_date: string
          site_id: string
          status?: string
          updated_at?: string | null
          user_id: string
          wagering_requirement?: string | null
        }
        Update: {
          bonus_amount?: number
          bonus_type?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          received_date?: string
          site_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          wagering_requirement?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bonus_tracking_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bonus_tracking_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      user_events: {
        Row: {
          created_at: string
          element_class: string | null
          element_id: string | null
          element_text: string | null
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorite_sites: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          site_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          site_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          site_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorite_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      user_loyalty_points: {
        Row: {
          created_at: string
          id: string
          lifetime_points: number
          tier: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifetime_points?: number
          tier?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          bonus_alerts: boolean | null
          complaint_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          site_updates: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bonus_alerts?: boolean | null
          complaint_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          site_updates?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bonus_alerts?: boolean | null
          complaint_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          site_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "user_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          priority: string
          target_audience: string
          title: string
          updated_at: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message: string
          metadata?: Json | null
          notification_type?: string
          priority?: string
          target_audience?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          priority?: string
          target_audience?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          successful_referrals: number
          total_points_earned: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          successful_referrals?: number
          total_points_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          successful_referrals?: number
          total_points_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reward_redemptions: {
        Row: {
          admin_notes: string | null
          expires_at: string | null
          id: string
          notes: string | null
          points_spent: number
          processed_at: string | null
          redeemed_at: string
          redemption_code: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          points_spent: number
          processed_at?: string | null
          redeemed_at?: string
          redemption_code?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          points_spent?: number
          processed_at?: string | null
          redeemed_at?: string
          redemption_code?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_role_cache: {
        Row: {
          cached_at: string
          expires_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          cached_at?: string
          expires_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          cached_at?: string
          expires_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_site_memberships: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          registration_date: string | null
          site_id: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registration_date?: string | null
          site_id: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          registration_date?: string | null
          site_id?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_site_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_site_memberships_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
      user_status_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      betting_sites_full: {
        Row: {
          affiliate_commission_percentage: number | null
          affiliate_contract_date: string | null
          affiliate_contract_terms: string | null
          affiliate_has_monthly_payment: boolean | null
          affiliate_link: string | null
          affiliate_monthly_payment: number | null
          affiliate_notes: string | null
          affiliate_panel_password: string | null
          affiliate_panel_url: string | null
          affiliate_panel_username: string | null
          avg_rating: number | null
          block_styles: Json | null
          bonus: string | null
          cons: string[] | null
          created_at: string | null
          display_order: number | null
          email: string | null
          expert_review: string | null
          facebook: string | null
          faq: Json | null
          features: string[] | null
          game_categories: Json | null
          id: string | null
          instagram: string | null
          is_active: boolean | null
          is_featured: boolean | null
          login_guide: string | null
          logo_url: string | null
          name: string | null
          pros: string[] | null
          rating: number | null
          review_count: number | null
          slug: string | null
          telegram: string | null
          twitter: string | null
          updated_at: string | null
          verdict: string | null
          whatsapp: string | null
          withdrawal_guide: string | null
          youtube: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          metric: string | null
          value: string | null
        }
        Relationships: []
      }
      site_stats_with_details: {
        Row: {
          clicks: number | null
          created_at: string | null
          email_clicks: number | null
          facebook_clicks: number | null
          id: string | null
          instagram_clicks: number | null
          site_bonus: string | null
          site_id: string | null
          site_is_active: boolean | null
          site_logo_url: string | null
          site_name: string | null
          site_rating: number | null
          site_slug: string | null
          telegram_clicks: number | null
          twitter_clicks: number | null
          updated_at: string | null
          views: number | null
          whatsapp_clicks: number | null
          youtube_clicks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites_full"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auto_approve_verified_individual: { Args: never; Returns: undefined }
      award_achievement: {
        Args: { p_achievement_code: string; p_user_id: string }
        Returns: boolean
      }
      award_loyalty_points: {
        Args: {
          p_description: string
          p_metadata?: Json
          p_points: number
          p_source: string
          p_user_id: string
        }
        Returns: undefined
      }
      calculate_daily_ad_revenue: {
        Args: { p_date?: string }
        Returns: undefined
      }
      calculate_reputation_score: {
        Args: { p_site_id: string }
        Returns: undefined
      }
      calculate_seo_score: { Args: { p_site_id: string }; Returns: undefined }
      can_view_site_stats: { Args: never; Returns: boolean }
      check_and_award_achievements: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_incomplete_profiles: { Args: never; Returns: undefined }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      create_site_notification: {
        Args: {
          p_action_url?: string
          p_message: string
          p_site_id: string
          p_title: string
          p_type: string
        }
        Returns: string
      }
      daily_analytics_maintenance: { Args: never; Returns: undefined }
      extract_domains_from_text: {
        Args: { p_text: string }
        Returns: {
          domain: string
          full_url: string
        }[]
      }
      generate_complaint_slug: {
        Args: { site_slug: string; title_text: string }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      get_active_banner: {
        Args: { p_limit?: number; p_location: string }
        Returns: {
          alt_text: string
          banner_name: string
          campaign_id: string
          click_url: string
          id: string
          image_url: string
          mobile_image_url: string
          priority: number
        }[]
      }
      get_current_user_roles: {
        Args: never
        Returns: {
          owned_sites: string[]
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      get_daily_site_metrics: {
        Args: { days_back?: number }
        Returns: {
          affiliate_clicks: number
          avg_duration_seconds: number
          logged_in_users: number
          metric_date: string
          site_id: string
          site_name: string
          site_slug: string
          total_conversions: number
          total_views: number
          unique_sessions: number
        }[]
      }
      get_daily_site_metrics_advanced: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          affiliate_clicks: number
          avg_duration_seconds: number
          logged_in_users: number
          metric_date: string
          site_id: string
          site_name: string
          site_slug: string
          total_conversions: number
          total_views: number
          unique_sessions: number
        }[]
      }
      get_next_available_domain: { Args: never; Returns: string }
      get_primary_domain: { Args: never; Returns: string }
      get_related_links: {
        Args: { p_limit?: number; p_source_page: string }
        Returns: {
          anchor_text: string
          id: string
          link_type: string
          relevance_score: number
          target_page: string
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_role_status: {
        Args: { p_user_id: string }
        Returns: {
          has_role: boolean
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_cached: {
        Args: {
          required_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      increment_banner_stats: {
        Args: { p_banner_id: string; p_stat_type: string }
        Returns: undefined
      }
      increment_blog_view_count: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_casino_analytics: {
        Args: {
          p_block_name?: string
          p_is_affiliate_click?: boolean
          p_site_id: string
        }
        Returns: undefined
      }
      increment_news_view_count: {
        Args: { article_id: string }
        Returns: undefined
      }
      increment_site_stats: {
        Args: { p_metric_type?: string; p_site_id: string }
        Returns: undefined
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_site_owner_user: { Args: never; Returns: boolean }
      is_username_available: {
        Args: { check_username: string }
        Returns: boolean
      }
      log_change: {
        Args: {
          p_action_type: string
          p_batch_id?: string
          p_metadata?: Json
          p_new_data?: Json
          p_previous_data?: Json
          p_record_id?: string
          p_record_ids?: string[]
          p_table_name: string
        }
        Returns: string
      }
      log_system_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_duration_ms?: number
          p_error_message?: string
          p_log_type: string
          p_resource?: string
          p_session_id?: string
          p_severity: string
          p_status_code?: number
          p_user_id?: string
        }
        Returns: string
      }
      mark_notification_as_read: {
        Args: { p_notification_id: string; p_user_id: string }
        Returns: undefined
      }
      notify_expiring_campaigns: { Args: never; Returns: undefined }
      notify_old_unresolved_complaints: { Args: never; Returns: undefined }
      notify_pending_complaints: { Args: never; Returns: undefined }
      process_referral_signup: {
        Args: { p_referral_code: string; p_referred_user_id: string }
        Returns: boolean
      }
      refresh_all_materialized_views: { Args: never; Returns: undefined }
      refresh_daily_site_metrics: { Args: never; Returns: undefined }
      scan_existing_content_for_domains: {
        Args: never
        Returns: {
          found_domains: number
          scanned_records: number
        }[]
      }
      send_reengagement_notifications: { Args: never; Returns: undefined }
      sync_daily_affiliate_metrics: { Args: never; Returns: undefined }
      track_conversion: {
        Args: {
          p_conversion_type: string
          p_conversion_value?: number
          p_metadata?: Json
          p_page_path: string
          p_session_id?: string
          p_site_id?: string
        }
        Returns: string
      }
      track_domains_in_record: {
        Args: {
          p_column_name: string
          p_content: string
          p_record_id: string
          p_table_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      track_internal_link_click: {
        Args: { p_link_id: string }
        Returns: undefined
      }
      track_page_view: {
        Args: {
          p_duration?: number
          p_page_path: string
          p_page_title?: string
          p_referrer?: string
          p_session_id?: string
          p_user_agent?: string
        }
        Returns: string
      }
      track_search: { Args: { p_search_term: string }; Returns: undefined }
      track_user_event: {
        Args: {
          p_element_id?: string
          p_event_name: string
          p_event_type: string
          p_metadata?: Json
          p_page_path: string
          p_session_id?: string
        }
        Returns: string
      }
      trigger_affiliate_metrics_sync: { Args: never; Returns: undefined }
      undo_change: { Args: { p_change_id: string }; Returns: boolean }
      update_analytics_daily_summary: {
        Args: { target_date?: string }
        Returns: undefined
      }
      user_owns_site: { Args: { site_id_param: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "content_editor"
        | "finance"
        | "seo_manager"
        | "moderator"
        | "site_owner"
      user_status: "pending" | "approved" | "rejected"
      user_type: "individual" | "corporate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "user",
        "content_editor",
        "finance",
        "seo_manager",
        "moderator",
        "site_owner",
      ],
      user_status: ["pending", "approved", "rejected"],
      user_type: ["individual", "corporate"],
    },
  },
} as const
