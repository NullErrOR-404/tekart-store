import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setIsLoading(true);
      
      // 1. Fetch all categories (to pass to ProductCard and for lookup)
      const { data: allCats } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      
      if (allCats) {
        setCategories(allCats);
        
        // Find current category
        const current = allCats.find((c: Category) => c.slug === slug);
        if (current) {
          setCategory(current);
          
          // 2. Fetch products for this category
          const { data: prodData } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', current.id)
            .order('priority', { ascending: true });
            
          if (prodData) {
            // Push out-of-stock items (stock <= 0) to the end of the list
            const sortedProds = [...prodData].sort((a, b) => {
              const aAvailable = a.stock > 0;
              const bAvailable = b.stock > 0;
              if (aAvailable && !bAvailable) return -1;
              if (!aAvailable && bAvailable) return 1;
              return a.priority - b.priority;
            });
            setProducts(sortedProds);
          } else {
            setProducts([]);
          }
        } else {
          setCategory(null);
          setProducts([]);
        }
      }
      setIsLoading(false);
    };

    fetchCategoryAndProducts();
  }, [slug]);

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

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-tk-text-primary">Category Not Found</h2>
        <p className="text-sm text-tk-text-secondary">The category you are looking for does not exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-tk-blue-deep hover:text-tk-blue-mid">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 pb-24 text-left">
      {/* Back button */}
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
        {category.cover_image && (
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-tk-card overflow-hidden shrink-0 bg-tk-blue-pale border border-tk-border shadow-sm">
            <img 
              src={category.cover_image} 
              alt={category.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-3xl md:text-4xl">{category.icon}</span>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-tk-text-primary">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-sm md:text-base text-tk-text-secondary max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Products list */}
      <div className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
          Available in {category.name} ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-tk-border rounded-tk-card bg-white dark:bg-tk-surface">
            <p className="text-sm text-tk-text-secondary font-medium">No products available in this category yet.</p>
            <p className="text-xs text-tk-text-tertiary mt-1">We are updating our boutique showroom, check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
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
