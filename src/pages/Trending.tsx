import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';

export const TrendingPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'default' | 'name-asc' | 'price-asc' | 'price-desc'>('default');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      if (catData) setCategories(catData);

      // 2. Fetch all products from all categories
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .order('priority', { ascending: true });

      if (prodData) {
        setProducts(prodData);
      } else {
        setProducts([]);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Compute popularity sorted base list and sort within groups
  const sortedProducts = useMemo(() => {
    // 1. Read click stats from localStorage to compute trending popularity order
    const statsStr = localStorage.getItem('tk_popular_clicks');
    let stats: Record<string, number> = {};
    if (statsStr) {
      try {
        stats = JSON.parse(statsStr);
      } catch (err) {
        console.error(err);
      }
    }

    // Sort products: In-stock first, then apply sort option or popularity
    return [...products].sort((a, b) => {
      const aAvailable = a.stock > 0;
      const bAvailable = b.stock > 0;
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;

      // Sort within groups
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'price-asc') {
        return a.price - b.price;
      }
      if (sortOption === 'price-desc') {
        return b.price - a.price;
      }

      // Default: Sort by click count popularity, then default priority
      const clicksA = stats[a.name] || 0;
      const clicksB = stats[b.name] || 0;
      if (clicksB !== clicksA) {
        return clicksB - clicksA;
      }
      return a.priority - b.priority;
    });
  }, [products, sortOption]);

  // Limit total products to a maximum of 36 items across all categories
  const displayedProducts = useMemo(() => {
    return sortedProducts.slice(0, 36);
  }, [sortedProducts]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 min-h-[50vh] text-left">
        <div className="h-6 bg-tk-blue-light animate-pulse rounded w-24"></div>
        <div className="space-y-3">
          <div className="h-10 bg-tk-blue-light animate-pulse rounded w-1/3"></div>
          <div className="h-4 bg-tk-blue-light animate-pulse rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[4/5] bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-4 space-y-4 animate-pulse">
              <div className="w-full h-2/3 bg-tk-blue-pale rounded-tk-input"></div>
              <div className="h-4 bg-tk-blue-pale rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 pb-24 text-left">
      {/* Back to Home Link */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Category Hero / Header */}
      <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-modal p-6 md:p-10 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-tk-card overflow-hidden shrink-0 bg-tk-blue-pale border border-tk-border shadow-sm flex items-center justify-center text-4xl">
          🔥
        </div>
        
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="h-5 w-5 text-tk-blue-deep" />
            <h1 className="font-display font-bold text-3xl md:text-4xl text-tk-text-primary">
              Trending Curation
            </h1>
          </div>
          <p className="text-sm md:text-base text-tk-text-secondary max-w-2xl leading-relaxed">
            Discover our fastest-selling items and trending styles. Handpicked by customer activity and store curation from all our main product categories.
          </p>
        </div>
      </div>

      {/* Products list */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-tk-border/50 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
            Top Trends ({displayedProducts.length} items shown)
          </h2>

          {displayedProducts.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-tk-text-secondary font-semibold">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-chip px-3 py-1.5 text-xs font-bold text-tk-text-primary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep cursor-pointer"
              >
                <option value="default">Popularity</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>

        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-tk-border rounded-tk-card bg-white dark:bg-tk-surface">
            <p className="text-sm text-tk-text-secondary font-medium">No trending products available yet.</p>
            <p className="text-xs text-tk-text-tertiary mt-1">Check back later once catalog updates are live!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                categories={categories}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
