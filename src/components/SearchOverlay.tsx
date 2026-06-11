import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Clock, ArrowRight } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['Oxford Shirt', 'Chelsea Boots', 'ANC Headphones', 'Oud Noir', 'Lipstick'];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load categories and recent searches
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

      // Fetch categories
      const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('priority', { ascending: true });
        if (data) setCategories(data);
      };
      fetchCategories();
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
        // Simple search filtering locally since mockSupabase does not do partial text matches on DB side in a complex way
        const filtered = data.filter((product: Product) => 
          product.name.toLowerCase().includes(query.toLowerCase()) || 
          (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
          (product.brand && product.brand.toLowerCase().includes(query.toLowerCase())) ||
          product.sku.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
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

  const handlePopularClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
  };

  const handleResultClick = (slug: string) => {
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
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

            {/* Popular Searches */}
            {!query && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handlePopularClick(term)}
                      className="text-xs font-medium text-tk-text-secondary bg-tk-blue-light hover:bg-tk-blue-mid hover:text-white px-3 py-1.5 rounded-tk-chip transition-colors"
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
                  <div key={i} className="flex gap-4 p-3 border border-tk-border rounded-tk-card bg-white animate-pulse">
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
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
                    Search Results ({results.length})
                  </h4>
                </div>

                {results.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-tk-border rounded-tk-card bg-tk-blue-pale/50">
                    <p className="text-sm text-tk-text-secondary">No products found matching "{query}".</p>
                    <p className="text-xs text-tk-text-tertiary mt-1">Try searching with a different keyword.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleResultClick(product.slug)}
                        className="flex gap-4 p-3 border border-tk-border hover:border-tk-blue-bright rounded-tk-card bg-white w-full text-left transition-all hover:shadow-[0_4px_12px_rgba(24,50,184,0.04)]"
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
