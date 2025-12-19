import { Link } from 'react-router-dom';
import { useFooterLinks } from '@/hooks/queries/useFooterQueries';

export const FooterCategories = () => {
  const { data: links, isLoading } = useFooterLinks('categories');

  if (isLoading || !links || links.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">Kategoriler</h3>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.id}>
            <Link
              to={link.url}
              className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
