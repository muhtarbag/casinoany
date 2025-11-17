import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

// AMP-specific blog post page
export default function AMPBlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post } = useQuery({
    queryKey: ['amp-blog-post', slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle(); // ✅ FIX: Use maybeSingle to prevent crash
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    // Disable default React behaviors for AMP
    document.documentElement.setAttribute('amp', '');
  }, []);

  if (!post) return null;

  const ampHTML = `
<!doctype html>
<html ⚡ lang="tr">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${post.meta_title || post.title}</title>
  <link rel="canonical" href="${window.location.origin}/blog/${post.slug}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${post.meta_description || post.excerpt}">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 0.5em;
      color: #1a1a1a;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 2em;
    }
    .content {
      font-size: 1.1em;
      color: #333;
    }
    .content p {
      margin-bottom: 1em;
    }
    .content img {
      max-width: 100%;
      height: auto;
    }
    .featured-image {
      width: 100%;
      height: auto;
      margin-bottom: 2em;
    }
  </style>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${post.title}",
      "description": "${post.excerpt}",
      "author": {
        "@type": "Organization",
        "name": "CasinoAny"
      },
      "datePublished": "${post.published_at}",
      "dateModified": "${post.updated_at}"
    }
  </script>
</head>
<body>
  <header>
    <h1>${post.title}</h1>
    <div class="meta">
      ${post.published_at ? `Yayınlanma: ${new Date(post.published_at).toLocaleDateString('tr-TR')}` : ''}
      ${post.read_time ? ` • ${post.read_time} dakika okuma` : ''}
    </div>
  </header>
  
  ${post.featured_image ? `
    <amp-img
      class="featured-image"
      src="${post.featured_image}"
      width="800"
      height="400"
      layout="responsive"
      alt="${post.title}">
    </amp-img>
  ` : ''}
  
  <article class="content">
    ${post.content}
  </article>
  
  <footer style="margin-top: 3em; padding-top: 2em; border-top: 1px solid #eee;">
    <p><a href="${window.location.origin}/blog/${post.slug}">Tam sürümü görüntüle</a></p>
    <p><a href="${window.location.origin}">Ana Sayfaya Dön</a></p>
  </footer>
</body>
</html>
  `;

  return (
    <>
      <Helmet>
        <link rel="amphtml" href={`${window.location.origin}/amp/blog/${post.slug}`} />
      </Helmet>
      <div dangerouslySetInnerHTML={{ __html: ampHTML }} />
    </>
  );
}
