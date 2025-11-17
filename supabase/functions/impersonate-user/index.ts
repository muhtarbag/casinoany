import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify the admin user
    const { data: { user: adminUser }, error: adminError } = await supabaseClient.auth.getUser(token)
    
    if (adminError || !adminUser) {
      throw new Error('Unauthorized')
    }

    // Check if admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUser.id)
      .eq('status', 'approved')
      .single()

    if (!roles || roles.role !== 'admin') {
      throw new Error('Only admins can impersonate users')
    }

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('user_id is required')
    }

    // Get the target user's email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id)

    if (userError || !userData.user) {
      throw new Error('User not found')
    }

    // Generate a magic link for the target user
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email!,
    })

    if (linkError) throw linkError

    // Extract the tokens from the magic link
    const url = new URL(linkData.properties.action_link)
    const access_token = url.searchParams.get('access_token')
    const refresh_token = url.searchParams.get('refresh_token')

    if (!access_token || !refresh_token) {
      throw new Error('Failed to generate tokens')
    }

    return new Response(
      JSON.stringify({
        access_token,
        refresh_token,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
