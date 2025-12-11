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

    const { domain, verificationCode, applicationId } = await req.json();

    if (!domain || !verificationCode || !applicationId) {
      throw new Error('domain, verificationCode, and applicationId are required');
    }

    let verified = false;
    let method = null;

    // Check DNS TXT record
    try {
      const dnsLookupUrl = `https://dns.google/resolve?name=_casinodoo-verify.${domain}&type=TXT`;
      const dnsResponse = await fetch(dnsLookupUrl);
      const dnsData = await dnsResponse.json();
      
      if (dnsData.Answer) {
        const txtRecords = dnsData.Answer.map((record: any) => record.data);
        const dnsVerified = txtRecords.some((record: string) => 
          record.includes(`casinodoo-verify-${verificationCode}`)
        );
        
        if (dnsVerified) {
          verified = true;
          method = 'dns';
        }
      }
    } catch (dnsError) {
      console.error('DNS verification error:', dnsError);
    }

    // Check HTML meta tag if DNS verification failed
    if (!verified) {
      try {
        const htmlResponse = await fetch(`https://${domain}`, {
          headers: { 'User-Agent': 'CasinoDoo-Verification-Bot' }
        });
        const html = await htmlResponse.text();
        
        const metaVerified = html.includes(`casinodoo-verification" content="${verificationCode}"`);
        
        if (metaVerified) {
          verified = true;
          method = 'meta';
        }
      } catch (htmlError) {
        console.error('HTML verification error:', htmlError);
      }
    }

    // Update database if verified
    if (verified) {
      const { error: updateError } = await supabase
        .from('ownership_verifications')
        .update({ 
          verified_at: new Date().toISOString(),
          metadata: { method }
        })
        .eq('application_id', applicationId)
        .eq('verification_code', verificationCode);

      if (updateError) throw updateError;

      // Update site_owners ownership_verified flag
      const { error: ownerError } = await supabase
        .from('site_owners')
        .update({ ownership_verified: true })
        .eq('id', applicationId);

      if (ownerError) throw ownerError;
    }

    return new Response(
      JSON.stringify({ 
        verified, 
        method,
        message: verified ? 'Domain ownership verified successfully' : 'Domain ownership verification failed'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in verify-domain-ownership:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});