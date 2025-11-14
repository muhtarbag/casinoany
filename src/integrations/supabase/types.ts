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
      analytics_sessions: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device_type: string | null
          exit_page: string | null
          id: string
          is_bounce: boolean | null
          landing_page: string | null
          last_activity: string
          page_count: number | null
          session_id: string
          total_duration: number | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          exit_page?: string | null
          id?: string
          is_bounce?: boolean | null
          landing_page?: string | null
          last_activity?: string
          page_count?: number | null
          session_id: string
          total_duration?: number | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          exit_page?: string | null
          id?: string
          is_bounce?: boolean | null
          landing_page?: string | null
          last_activity?: string
          page_count?: number | null
          session_id?: string
          total_duration?: number | null
          user_id?: string | null
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
          id: string
          instagram: string | null
          is_active: boolean | null
          is_featured: boolean | null
          login_guide: string | null
          logo_url: string | null
          name: string
          pros: string[] | null
          rating: number | null
          slug: string
          telegram: string | null
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
          block_styles?: Json | null
          bonus?: string | null
          cons?: string[] | null
          created_at?: string | null
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
          login_guide?: string | null
          logo_url?: string | null
          name: string
          pros?: string[] | null
          rating?: number | null
          slug: string
          telegram?: string | null
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
          block_styles?: Json | null
          bonus?: string | null
          cons?: string[] | null
          created_at?: string | null
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
          login_guide?: string | null
          logo_url?: string | null
          name?: string
          pros?: string[] | null
          rating?: number | null
          slug?: string
          telegram?: string | null
          twitter?: string | null
          updated_at?: string | null
          verdict?: string | null
          whatsapp?: string | null
          withdrawal_guide?: string | null
          youtube?: string | null
        }
        Relationships: []
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
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          display_order: number | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string | null
          primary_site_id: string | null
          published_at: string | null
          read_time: number | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          primary_site_id?: string | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          display_order?: number | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string | null
          primary_site_id?: string | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_primary_site_id_fkey"
            columns: ["primary_site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
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
      casino_content_analytics: {
        Row: {
          affiliate_clicks: number | null
          avg_time_on_page: number | null
          block_interactions: Json | null
          bounce_rate: number | null
          created_at: string | null
          id: string
          site_id: string
          total_views: number | null
          updated_at: string | null
          view_date: string
        }
        Insert: {
          affiliate_clicks?: number | null
          avg_time_on_page?: number | null
          block_interactions?: Json | null
          bounce_rate?: number | null
          created_at?: string | null
          id?: string
          site_id: string
          total_views?: number | null
          updated_at?: string | null
          view_date?: string
        }
        Update: {
          affiliate_clicks?: number | null
          avg_time_on_page?: number | null
          block_interactions?: Json | null
          bounce_rate?: number | null
          created_at?: string | null
          id?: string
          site_id?: string
          total_views?: number | null
          updated_at?: string | null
          view_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_content_analytics_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
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
        ]
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
        ]
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
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
      site_notifications: {
        Row: {
          background_color: string | null
          button_text: string | null
          button_url: string | null
          content: string | null
          created_at: string
          created_by: string | null
          display_frequency: string | null
          display_pages: string[] | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          notification_type: string
          priority: number | null
          start_date: string | null
          target_url: string | null
          text_color: string | null
          title: string
          trigger_conditions: Json | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          display_pages?: string[] | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          notification_type?: string
          priority?: number | null
          start_date?: string | null
          target_url?: string | null
          text_color?: string | null
          title: string
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          button_text?: string | null
          button_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          display_frequency?: string | null
          display_pages?: string[] | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          notification_type?: string
          priority?: number | null
          start_date?: string | null
          target_url?: string | null
          text_color?: string | null
          title?: string
          trigger_conditions?: Json | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: []
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
          id: string
          site_id: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          site_id: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          site_id?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at: string | null
          status: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          recorded_at?: string | null
          status?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
          status?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      site_stats_with_details: {
        Row: {
          clicks: number | null
          created_at: string | null
          id: string | null
          site_bonus: string | null
          site_id: string | null
          site_is_active: boolean | null
          site_name: string | null
          site_rating: number | null
          site_slug: string | null
          updated_at: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "site_stats_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: true
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_view_site_stats: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
      record_health_metric: {
        Args: {
          p_metadata?: Json
          p_metric_name: string
          p_metric_type: string
          p_metric_value: number
          p_status?: string
        }
        Returns: string
      }
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
      undo_change: { Args: { p_change_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
