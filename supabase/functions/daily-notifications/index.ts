import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting daily notification jobs...');

    // 1. Check for incomplete profiles and send reminders
    console.log('Running check_incomplete_profiles...');
    const { error: profileError } = await supabase.rpc('check_incomplete_profiles');
    
    if (profileError) {
      console.error('Error in check_incomplete_profiles:', profileError);
    } else {
      console.log('✓ Profile reminders sent');
    }

    // 2. Send re-engagement notifications to inactive users
    console.log('Running send_reengagement_notifications...');
    const { error: reengagementError } = await supabase.rpc('send_reengagement_notifications');
    
    if (reengagementError) {
      console.error('Error in send_reengagement_notifications:', reengagementError);
    } else {
      console.log('✓ Re-engagement notifications sent');
    }

    // 3. Notify users about pending complaints
    console.log('Running notify_pending_complaints...');
    const { error: complaintError } = await supabase.rpc('notify_pending_complaints');
    
    if (complaintError) {
      console.error('Error in notify_pending_complaints:', complaintError);
    } else {
      console.log('✓ Pending complaint notifications sent');
    }

    console.log('Daily notification jobs completed successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily notification jobs completed',
        jobs: {
          incomplete_profiles: !profileError,
          reengagement: !reengagementError,
          pending_complaints: !complaintError,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Fatal error in daily notifications:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
