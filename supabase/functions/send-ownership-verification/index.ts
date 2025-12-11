import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId, siteEmail } = await req.json();

    if (!applicationId || !siteEmail) {
      throw new Error('applicationId and siteEmail are required');
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomUUID();

    // Save to database
    const { error: insertError } = await supabase
      .from('ownership_verifications')
      .insert({
        application_id: applicationId,
        verification_type: 'email',
        verification_code: code,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: { token, email: siteEmail }
      });

    if (insertError) throw insertError;

    console.log(`Email verification code generated: ${code} for application: ${applicationId}`);

    // TODO: Integrate with email service (Resend/SendGrid)
    // For now, return the code so admin can manually share it
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        code,
        message: 'Verification code generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-ownership-verification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});