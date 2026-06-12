import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Clock, ArrowRight } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';

// Helper functions for Typo-Tolerant (Fuzzy) Search
function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

function getWordFuzzyScore(queryWord: string, targetWord: string): number {
  const distance = getLevenshteinDistance(queryWord, targetWord);
  const maxLength = Math.max(queryWord.length, targetWord.length);
  if (maxLength === 0) return 0;
  return 1 - distance / maxLength;
}

function getProductFuzzyScore(query: string, product: Product): number {
  const queryLower = query.toLowerCase().trim();
  if (!queryLower) return 0;
  
  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return 0;

  const nameLower = product.name.toLowerCase();
  const brandLower = product.brand?.toLowerCase() || '';
  const skuLower = product.sku.toLowerCase();
  const tags = product.tags || [];

  // Check direct substring match first (exact contains matches rank high)
  const isDirectSubstring = 
    nameLower.includes(queryLower) || 
    brandLower.includes(queryLower) || 
    skuLower.includes(queryLower) ||
    tags.some(tag => tag.toLowerCase().includes(queryLower));

  if (isDirectSubstring) {
    return 1.0;
  }

  // Word-by-word fuzzy comparison
  let totalScore = 0;
  for (const qWord of queryWords) {
    let bestWordScore = 0;

    // Check name words
    const nameWords = nameLower.split(/\s+/).filter(Boolean);
    for (const nWord of nameWords) {
      bestWordScore = Math.max(bestWordScore, getWordFuzzyScore(qWord, nWord));
    }

    // Check brand words
    if (brandLower) {
      const brandWords = brandLower.split(/\s+/).filter(Boolean);
      for (const bWord of brandWords) {
        bestWordScore = Math.max(bestWordScore, getWordFuzzyScore(qWord, bWord));
      }
    }

    // Check SKU
    bestWordScore = Math.max(bestWordScore, getWordFuzzyScore(qWord, skuLower));

    // Check tags
    for (const tag of tags) {
      const tagLower = tag.toLowerCase();
      bestWordScore = Math.max(bestWordScore, getWordFuzzyScore(qWord, tagLower));
    }

    totalScore += bestWordScore;
  }

  return totalScore / queryWords.length;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState<'default' | 'name-asc' | 'price-asc' | 'price-desc'>('default');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const sortedResults = useMemo(() => {
    if (sortOption === 'default') {
      return results;
    }

    return [...results].sort((a, b) => {
      // 1. Keep out-of-stock items (stock <= 0) at the bottom
      const aAvailable = a.stock > 0;
      const bAvailable = b.stock > 0;
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;

      // 2. Sort within groups
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'price-asc') {
        return a.price - b.price;
      }
      if (sortOption === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });
  }, [results, sortOption]);

  // Load categories, recent searches, and dynamically build popular searches from real database traffic
  useEffect(() => {
    if (isOpen) {
      // Focus input
      setTimeout(() => searchInputRef.current?.focus(), 100);
      
      // Load recent searches
      const saved = localStorage.getItem('tk_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent searches', e);
        }
      }

      // Fetch categories and products to build popular searches list
      const fetchSearchData = async () => {
        const { data: catData } = await supabase.from('categories').select('*').order('priority', { ascending: true });
        if (catData) setCategories(catData);

        const { data: prodData } = await supabase.from('products').select('name').order('priority', { ascending: true });
        if (prodData) {
          const statsStr = localStorage.getItem('tk_popular_clicks');
          let stats: Record<string, number> = {};
          if (statsStr) {
            try {
              stats = JSON.parse(statsStr);
            } catch (err) {
              console.error(err);
            }
          }
          // Sort products by user traffic (clicked counts)
          const sorted = [...prodData].sort((a, b) => {
            const clicksA = stats[a.name] || 0;
            const clicksB = stats[b.name] || 0;
            return clicksB - clicksA;
          });
          setPopularSearches(sorted.map(p => p.name).slice(0, 5));
        }
      };
      fetchSearchData();
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Debounced search logic
  useEffect(() => {
    setSortOption('default'); // Reset sort when query changes
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      // Search in products by name or description
      const { data } = await supabase
        .from('products')
        .select('*');

      if (data) {
        const queryLower = query.toLowerCase().trim();

        // 1. Calculate fuzzy match scores for all products and filter by threshold (62% similarity)
        const scoredProducts = data
          .map((product: Product) => {
            const score = getProductFuzzyScore(queryLower, product);
            return { product, score };
          })
          .filter((item: { product: Product; score: number }) => item.score >= 0.62);

        // 2. Sort results based on score, starts-with relevance, and availability
        const sorted = [...scoredProducts].sort((a, b) => {
          // Push out-of-stock items to the bottom
          const aAvailable = a.product.stock > 0;
          const bAvailable = b.product.stock > 0;
          if (aAvailable && !bAvailable) return -1;
          if (!aAvailable && bAvailable) return 1;
          
          // Sort by match score (highest score first)
          if (Math.abs(a.score - b.score) > 0.01) {
            return b.score - a.score;
          }

          // Prioritize starts-with name match
          const aNameLower = a.product.name.toLowerCase();
          const bNameLower = b.product.name.toLowerCase();
          const aStartsWith = aNameLower.startsWith(queryLower);
          const bStartsWith = bNameLower.startsWith(queryLower);
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          // Fallback to priority order
          return a.product.priority - b.product.priority;
        });

        setResults(sorted.map((item: { product: Product; score: number }) => item.product));
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  const addRecentSearch = (searchVal: string) => {
    if (!searchVal.trim()) return;
    const cleanSearchVal = searchVal.trim();
    const updated = [cleanSearchVal, ...recentSearches.filter(s => s !== cleanSearchVal)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('tk_recent_searches', JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query);
    }
  };

  const registerClick = (prodName: string) => {
    const statsStr = localStorage.getItem('tk_popular_clicks');
    let stats: Record<string, number> = {};
    if (statsStr) {
      try {
        stats = JSON.parse(statsStr);
      } catch (err) {
        console.error(err);
      }
    }
    stats[prodName] = (stats[prodName] || 0) + 1;
    localStorage.setItem('tk_popular_clicks', JSON.stringify(stats));
  };

  const handlePopularClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
  };

  const handleResultClick = (productName: string, slug: string) => {
    registerClick(productName);
    if (query.trim()) {
      addRecentSearch(query);
    }
    onClose();
    navigate(`/product/${slug}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('tk_recent_searches');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-tk-surface flex flex-col animate-fade-in">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-4 border-b border-tk-border flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center max-w-3xl relative">
          <Search className="absolute left-3 h-5 w-5 text-tk-text-secondary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products, brands, or categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-base text-tk-text-primary placeholder-tk-text-tertiary border border-tk-border rounded-tk-input focus:outline-none focus:ring-1 focus:ring-tk-blue-deep focus:border-tk-blue-deep transition-all"
            id="input-search"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 text-tk-text-secondary hover:text-tk-text-primary"
            >
              Clear
            </button>
          )}
        </form>

        <button
          onClick={onClose}
          className="ml-6 p-2 rounded-full hover:bg-tk-blue-light text-tk-text-primary transition-colors"
          aria-label="Close search"
          id="btn-close-search"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick links & history */}
          <div className="md:col-span-1 space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Recent Searches</h4>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-tk-text-tertiary hover:text-tk-blue-deep"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handlePopularClick(term)}
                      className="flex items-center gap-2 text-sm text-tk-text-primary hover:text-tk-blue-deep w-full text-left py-1"
                    >
                      <Clock className="h-3.5 w-3.5 text-tk-text-tertiary" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches (real products, ordered by user clicks) */}
            {!query && popularSearches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handlePopularClick(term);
                        registerClick(term);
                      }}
                      className="text-xs font-medium text-tk-text-secondary bg-tk-blue-light hover:bg-tk-blue-mid hover:text-white px-3 py-1.5 rounded-tk-chip transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Explore Categories</h4>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onClose();
                      navigate(`/category/${cat.slug}`);
                    }}
                    className="flex items-center justify-between w-full text-left text-sm text-tk-text-primary hover:text-tk-blue-deep py-2 pl-2 border-l-2 border-transparent hover:border-tk-blue-bright hover:bg-tk-blue-light/30 transition-all rounded"
                  >
                    <span>{cat.icon} {cat.name}</span>
                    <ArrowRight className="h-4 w-4 text-tk-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results Column */}
          <div className="md:col-span-2">
            {isLoading ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Searching...</h4>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 p-3 border border-tk-border rounded-tk-card bg-white dark:bg-tk-surface animate-pulse">
                    <div className="w-16 h-20 bg-tk-blue-light rounded"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-tk-blue-light rounded w-3/4"></div>
                      <div className="h-3 bg-tk-blue-light rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-tk-border/50 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
                    Search Results ({results.length})
                  </h4>

                  {results.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-tk-text-secondary font-semibold">Sort By:</span>
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                        className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-chip px-3 py-1.5 text-xs font-bold text-tk-text-primary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep cursor-pointer"
                      >
                        <option value="default">Best Match</option>
                        <option value="name-asc">Alphabetical (A-Z)</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                      </select>
                    </div>
                  )}
                </div>

                {sortedResults.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-tk-border rounded-tk-card bg-tk-blue-pale/50">
                    <p className="text-sm text-tk-text-secondary">No products found matching "{query}".</p>
                    <p className="text-xs text-tk-text-tertiary mt-1">Try searching with a different keyword.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product.name, product.slug)}
                        className="flex gap-4 p-3 border border-tk-border hover:border-tk-blue-bright rounded-tk-card bg-white dark:bg-tk-surface w-full text-left transition-all hover:shadow-[0_4px_12px_rgba(24,50,184,0.04)] cursor-pointer"
                      >
                        <img
                          src={product.cover_image}
                          alt={product.name}
                          className="w-14 h-18 object-cover bg-tk-blue-pale rounded-tk-input"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-tk-text-secondary font-medium tracking-wider uppercase mb-0.5">
                            {categories.find(c => c.id === product.category_id)?.name}
                          </p>
                          <h5 className="text-sm font-semibold text-tk-text-primary truncate">{product.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-bold text-tk-blue-deep">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.old_price && (
                              <span className="text-xs text-tk-text-tertiary line-through">
                                ₹{product.old_price.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center py-12 text-tk-text-secondary bg-tk-blue-pale/30 border border-dashed border-tk-border rounded-tk-card">
                <Search className="h-10 w-10 text-tk-text-tertiary mb-3" />
                <p className="text-sm font-medium">Start typing to search the TEKART showroom.</p>
                <p className="text-xs text-tk-text-tertiary mt-1">Find original, premium products instantly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
