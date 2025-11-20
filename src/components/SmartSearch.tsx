import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface SmartSearchProps {
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
  onNavigate?: (slug: string) => void;
}

export const SmartSearch = ({ onSearch, searchTerm, onNavigate }: SmartSearchProps) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all sites for suggestions
  const { data: allSites } = useQuery({
    queryKey: ['all-sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('betting_sites')
        .select('id, name, slug, rating, bonus, features')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_term, search_count')
        .order('search_count', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fuzzy search algorithm
  const fuzzyMatch = (query: string, text: string): number => {
    if (!query || !text) return 0;
    
    query = query.toLowerCase();
    text = text.toLowerCase();
    
    // Exact match gets highest score
    if (text === query) return 100;
    if (text.startsWith(query)) return 90;
    if (text.includes(query)) return 80;
    
    // Levenshtein distance for similarity
    let score = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        score += 10;
        queryIndex++;
      }
    }
    
    // Bonus for matching all characters
    if (queryIndex === query.length) {
      score += 20;
    }
    
    return score;
  };

  // Update suggestions based on search
  useEffect(() => {
    if (!localSearch.trim() || !allSites) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchResults = allSites
      .map((site: any) => ({
        ...site,
        score: Math.max(
          fuzzyMatch(localSearch, site.name),
          fuzzyMatch(localSearch, site.features?.join(' ') || ''),
          fuzzyMatch(localSearch, site.bonus || '')
        )
      }))
      .filter(site => site.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setSuggestions(searchResults);
    if (searchResults.length > 0) {
      setShowSuggestions(true);
      setShowPopular(false);
    }
  }, [localSearch, allSites]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowPopular(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Track search
  const trackSearch = async (term: string) => {
    if (!term.trim()) return;
    
    try {
      await supabase.rpc('track_search', { p_search_term: term });
    } catch (error) {
      // Silent fail for analytics
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    trackSearch(localSearch);
    onSearch(localSearch);
    setShowSuggestions(false);
    setShowPopular(false);
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSuggestionClick = (siteSlug: string, siteName: string) => {
    trackSearch(siteName);
    setShowSuggestions(false);
    setShowPopular(false);
    if (onNavigate) {
      onNavigate(siteSlug);
    } else {
      window.location.href = `/${siteSlug}`;
    }
  };

  const handlePopularClick = (term: string) => {
    setLocalSearch(term);
    trackSearch(term);
    onSearch(term);
    setShowPopular(false);
    document.getElementById('sites-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
      <div className="flex flex-col sm:flex-row gap-2 sm:relative">
        <div className="relative flex-1" ref={suggestionsRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground z-10 pointer-events-none" />
          <Input
            type="text"
            placeholder="Bahis sitesi ara..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onFocus={() => {
              if (!localSearch.trim() && popularSearches && popularSearches.length > 0) {
                setShowPopular(true);
              }
              if (localSearch.trim() && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay to allow click events to fire first
              setTimeout(() => {
                setShowSuggestions(false);
                setShowPopular(false);
              }, 300);
            }}
            className="pl-13 pr-4 sm:pl-14 sm:pr-28 py-4 sm:py-6 text-base sm:text-lg text-foreground placeholder:text-muted-foreground/70 rounded-lg border-2 border-border focus:border-primary w-full font-normal"
          />
          
          {/* Popular Searches Dropdown */}
          {showPopular && popularSearches && popularSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center gap-2">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Popüler Aramalar</span>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {popularSearches.map((search: any, index: number) => (
                  <button
                    key={search.id || `popular-${index}`}
                    type="button"
                    onClick={() => handlePopularClick(search.search_term)}
                    className="group"
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-all duration-200 flex items-center gap-2"
                    >
                      <span className="capitalize">{search.search_term}</span>
                      {search.search_count > 5 && (
                        <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">
                          {search.search_count}
                        </span>
                      )}
                    </Badge>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 bg-muted/50 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  En çok aranan siteler ve özellikler
                </p>
              </div>
            </div>
          )}

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
              {suggestions.map((site, index) => (
                <button
                  key={site.id || `suggestion-${index}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(site.slug, site.name);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {index === 0 ? (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    ) : (
                      <Search className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{site.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        {site.rating}
                      </span>
                      {site.bonus && (
                        <>
                          <span>•</span>
                          <span className="truncate">{site.bonus}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      En İyi Eşleşme
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="submit"
          className="sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 px-6 py-4 sm:py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200 w-full sm:w-auto font-semibold"
        >
          <Search className="w-4 h-4 sm:hidden mr-2" />
          Ara
        </Button>
      </div>
    </form>
  );
};
