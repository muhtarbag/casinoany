import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 hidden md:block">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {/* Home */}
        <li className="flex items-center gap-2">
          <Link 
            to="/" 
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
        </li>

        {/* Dynamic items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <>
                  <Link 
                    to={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <span className={isLast ? "font-medium text-foreground" : ""}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
