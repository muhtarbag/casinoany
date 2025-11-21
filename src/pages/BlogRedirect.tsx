import { useParams, Navigate } from 'react-router-dom';

/**
 * Redirect old /blog/:slug URLs to new /:slug format
 * This is for SEO - implements 301 permanent redirect
 */
export default function BlogRedirect() {
  const { slug } = useParams();
  
  // 301 redirect to new URL structure
  return <Navigate to={`/${slug}`} replace />;
}
