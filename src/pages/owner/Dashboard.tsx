import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBasket, 
  Layers, 
  AlertTriangle, 
  Star, 
  Plus, 
  Image, 
  ArrowRight, 
  Eye 
} from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';

export const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    outOfStock: 0,
    featured: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('*');
      const cats = catData || [];
      setCategories(cats);

      // Fetch products
      const { data: prodData } = await supabase.from('products').select('*');
      const prods = prodData || [];
      
      // Calculate statistics
      const outOfStockCount = prods.filter((p: Product) => p.stock <= 0).length;
      const featuredCount = prods.filter((p: Product) => p.featured).length;

      setStats({
        products: prods.length,
        categories: cats.length,
        outOfStock: outOfStockCount,
        featured: featuredCount,
      });

      // Sort products by date created and take top 5
      const sorted = [...prods].sort((a: Product, b: Product) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentProducts(sorted.slice(0, 5));
      setIsLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-tk-blue-light animate-pulse rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card animate-pulse"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', val: stats.products, icon: ShoppingBasket, color: 'text-tk-blue-deep', bg: 'bg-tk-blue-light' },
    { label: 'Total Categories', val: stats.categories, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Out of Stock / Ask Availability', val: stats.outOfStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Featured Items', val: stats.featured, icon: Star, color: 'text-tk-blue-bright', bg: 'bg-sky-50' },
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary">Admin Dashboard</h2>
        <p className="text-xs text-tk-text-secondary">Overview of your storefront's current database state.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-5 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${card.bg} ${card.color} flex items-center justify-center shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-tk-text-secondary uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-tk-text-primary mt-0.5">{card.val}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-tk-text-primary border-b border-tk-border pb-3">
              Quick Operations
            </h3>

            <div className="space-y-3">
              <Link
                to="/owner/products/new"
                className="w-full bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-3 px-4 rounded-tk-input text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Product</span>
              </Link>

              <Link
                to="/owner/upload"
                className="w-full bg-tk-blue-light hover:bg-tk-blue-strong/20 text-tk-blue-deep font-bold py-3 px-4 rounded-tk-input text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Image className="h-4 w-4" />
                <span>Batch Image Upload</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right column: Recent Additions list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-tk-border pb-3">
              <h3 className="font-display font-bold text-lg text-tk-text-primary">
                Recently Added Products
              </h3>
              <Link
                to="/owner/products"
                className="text-xs font-semibold text-tk-blue-deep hover:text-tk-blue-mid flex items-center gap-1"
              >
                <span>Manage All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-8 text-tk-text-secondary text-sm">
                No products found in the catalog. Click "Add New Product" to start seeding.
              </div>
            ) : (
              <div className="divide-y divide-tk-border/50">
                {recentProducts.map((prod) => (
                  <div key={prod.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.cover_image}
                        alt={prod.name}
                        className="w-10 h-12 object-cover bg-tk-blue-pale rounded border border-tk-border shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-tk-text-primary truncate">{prod.name}</h4>
                        <p className="text-[10px] text-tk-text-tertiary">
                          SKU: {prod.sku} · {categories.find(c => c.id === prod.category_id)?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-sm font-bold text-tk-text-primary">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <Link
                        to={`/product/${prod.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-full hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
                        title="Preview Public Page"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
