import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

// AMP-specific site detail page
export default function AMPSiteDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: site } = useQuery({
    queryKey: ['amp-site', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to prevent crash
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    document.documentElement.setAttribute('amp', '');
  }, []);

  if (!site) return null;

  const ampHTML = `
<!doctype html>
<html ⚡ lang="tr">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${site.name} - İnceleme ve Bonus Bilgileri</title>
  <link rel="canonical" href="${window.location.origin}/${site.slug}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${site.name} detaylı incelemesi, bonusları ve özellikleri">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
      background: #f5f5f5;
    }
    .site-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 2em;
      margin-bottom: 0.5em;
      color: #1a1a1a;
    }
    .rating {
      color: #f59e0b;
      font-size: 1.5em;
      font-weight: bold;
    }
    .bonus {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .features {
      list-style: none;
      padding: 0;
    }
    .features li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .cta-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 15px 30px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
    }
    .pros-cons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    .pros-cons div {
      padding: 15px;
      border-radius: 8px;
    }
    .pros {
      background: #d1fae5;
    }
    .cons {
      background: #fee2e2;
    }
  </style>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "${site.name}",
      "description": "${site.name} bahis sitesi incelemesi",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "${site.rating}",
        "bestRating": "5",
        "worstRating": "1"
      }
    }
  </script>
</head>
<body>
  <div class="site-card">
    ${site.logo_url ? `
      <amp-img
        src="${site.logo_url}"
        width="200"
        height="80"
        layout="responsive"
        alt="${site.name} Logo">
      </amp-img>
    ` : ''}
    
    <h1>${site.name}</h1>
    <div class="rating">⭐ ${site.rating}/5</div>
    
    ${site.bonus ? `
      <div class="bonus">
        <h3>💰 Hoş Geldin Bonusu</h3>
        <p>${site.bonus}</p>
      </div>
    ` : ''}
    
    <a href="${site.affiliate_link}" class="cta-button" target="_blank" rel="nofollow noopener">
      Siteye Git →
    </a>
    
    ${site.features && site.features.length > 0 ? `
      <h2>Özellikler</h2>
      <ul class="features">
        ${site.features.map((f: string) => `<li>✓ ${f}</li>`).join('')}
      </ul>
    ` : ''}
    
    ${site.pros || site.cons ? `
      <div class="pros-cons">
        ${site.pros && site.pros.length > 0 ? `
          <div class="pros">
            <h3>Artılar</h3>
            <ul>
              ${site.pros.map((p: string) => `<li>+ ${p}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${site.cons && site.cons.length > 0 ? `
          <div class="cons">
            <h3>Eksiler</h3>
            <ul>
              ${site.cons.map((c: string) => `<li>- ${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    ` : ''}
    
    ${site.expert_review ? `
      <div class="site-card">
        <h2>Uzman Yorumu</h2>
        <p>${site.expert_review}</p>
      </div>
    ` : ''}
  </div>
  
  <footer style="text-align: center; margin-top: 3em; padding-top: 2em;">
    <p><a href="${window.location.origin}/${site.slug}">Tam sürümü görüntüle</a></p>
    <p><a href="${window.location.origin}">Ana Sayfaya Dön</a></p>
  </footer>
</body>
</html>
  `;

  return (
    <>
      <Helmet>
        <link rel="amphtml" href={`${window.location.origin}/amp/${site.slug}`} />
      </Helmet>

      {/* Script for Prerenderer to extract clean AMP HTML */}
      <script id="amp-source" type="text/plain" dangerouslySetInnerHTML={{ __html: ampHTML }} />

      {/* Preview for User/Dev */}
      <iframe
        srcDoc={ampHTML}
        style={{ width: '100%', height: '100vh', border: 'none' }}
        title={`AMP Preview: ${site.name}`}
      />
    </>
  );
}
