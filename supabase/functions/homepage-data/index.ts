import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HomepageData {
  featuredSites: any[]
  allSites: any[]
  banners: any[]
  searchHistory: any[]
  notifications: any[]
  success: boolean
  cached?: boolean
  timestamp: string
}

// In-memory cache (resets when function cold starts)
let dataCache: HomepageData | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    
    // Check cache first
    const now = Date.now()
    if (dataCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Returning cached data')
      return new Response(
        JSON.stringify({ ...dataCache, cached: true }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300' // 5 min browser cache
          } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🔄 Fetching fresh data...')

    // Fetch all data in parallel
    const [
      featuredSitesResult,
      allSitesResult,
      bannersResult,
      searchHistoryResult,
      notificationsResult,
    ] = await Promise.all([
      // Featured sites (top 3)
      supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube, review_count, avg_rating')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(3),
      
      // All active sites
      supabase
        .from('betting_sites')
        .select('id, name, slug, logo_url, rating, bonus, features, affiliate_link, email, whatsapp, telegram, twitter, instagram, facebook, youtube, is_active, display_order, review_count, avg_rating')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
      
      // Active banners for homepage
      supabase
        .from('site_banners')
        .select('*')
        .eq('is_active', true)
        .contains('display_pages', ['home'])
        .order('position', { ascending: true })
        .order('display_order', { ascending: true }),
      
      // Popular searches
      supabase
        .from('search_history')
        .select('search_term, search_count')
        .order('search_count', { ascending: false })
        .limit(8),
      
      // Active notifications
      supabase
        .from('site_notifications')
        .select('*')
        .eq('is_active', true)
        .in('notification_type', ['popup', 'form'])
        .or('start_date.is.null,start_date.lte.' + new Date().toISOString())
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString())
        .order('priority', { ascending: false })
    ])

    // Check for errors
    if (featuredSitesResult.error) throw featuredSitesResult.error
    if (allSitesResult.error) throw allSitesResult.error
    if (bannersResult.error) throw bannersResult.error
    if (searchHistoryResult.error) throw searchHistoryResult.error
    if (notificationsResult.error) throw notificationsResult.error

    const responseData: HomepageData = {
      featuredSites: featuredSitesResult.data || [],
      allSites: allSitesResult.data || [],
      banners: bannersResult.data || [],
      searchHistory: searchHistoryResult.data || [],
      notifications: notificationsResult.data || [],
      success: true,
      cached: false,
      timestamp: new Date().toISOString()
    }

    // Update cache
    dataCache = responseData
    cacheTimestamp = now

    const duration = Date.now() - startTime
    console.log(`✅ Data fetched successfully in ${duration}ms`)

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error fetching homepage data:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        featuredSites: [],
        allSites: [],
        banners: [],
        searchHistory: [],
        notifications: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
