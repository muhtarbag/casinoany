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

    // Generate recovery link (contains actual tokens)
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: userData.user.email!,
    })

    if (linkError) {
      console.error('Link generation error:', linkError)
      throw new Error(`Link generation failed: ${linkError.message}`)
    }

    console.log('Recovery link generated')

    // Extract tokens from recovery link - they're in the URL fragment
    const actionLink = linkData.properties.action_link
    console.log('Action link:', actionLink)
    
    // Recovery links have tokens in the hash fragment after redirect
    // Format: https://project.supabase.co/auth/v1/verify?...#access_token=...&refresh_token=...
    
    // Parse the URL to get the verification URL first
    const verifyUrl = new URL(actionLink)
    
    // For recovery type, we need to follow the redirect or parse hashed_token
    // Better approach: Use the hashed_token to exchange for session
    const hashedToken = linkData.properties.hashed_token
    
    if (!hashedToken) {
      console.error('No hashed token in response')
      throw new Error('Failed to generate recovery token')
    }

    console.log('Got hashed token, exchanging for session...')

    // Exchange the hashed token for an actual session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.verifyOtp({
      token_hash: hashedToken,
      type: 'recovery',
    })

    if (sessionError) {
      console.error('Session exchange error:', sessionError)
      throw new Error(`Session exchange failed: ${sessionError.message}`)
    }

    if (!sessionData.session) {
      console.error('No session in response')
      throw new Error('Failed to create session')
    }

    const access_token = sessionData.session.access_token
    const refresh_token = sessionData.session.refresh_token

    console.log('Tokens generated successfully for user:', user_id)

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
