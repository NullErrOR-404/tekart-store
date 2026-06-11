import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ExternalLink 
} from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    // Fetch categories
    const { data: catData } = await supabase.from('categories').select('*').order('priority', { ascending: true });
    if (catData) setCategories(catData);

    // Fetch products
    const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFeatured = async (id: string, currentVal: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ featured: !currentVal })
      .eq('id', id);

    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, featured: !currentVal } : p));
    }
  };

  const handleToggleStock = async (id: string, currentStock: number) => {
    // If currentStock > 0, we toggle to 0 (out of stock). Otherwise, we toggle to 10 (in stock).
    const newStock = currentStock > 0 ? 0 : 10;
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', id);

    if (!error) {
      setProducts(products.map(p => 
        p.id === id 
          ? { ...p, stock: newStock, in_stock: newStock > 0 } 
          : p
      ));
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  // Filter products based on search query and category selector
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = 
      prod.name.toLowerCase().includes(search.toLowerCase()) || 
      prod.sku.toLowerCase().includes(search.toLowerCase()) || 
      (prod.brand && prod.brand.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === '' || prod.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-tk-blue-light animate-pulse rounded w-1/4"></div>
          <div className="h-10 bg-tk-blue-light animate-pulse rounded w-28"></div>
        </div>
        <div className="h-96 bg-white border border-tk-border rounded-tk-card animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary">Products Catalog</h2>
          <p className="text-xs text-tk-text-secondary">Manage and organize your storefront inventory.</p>
        </div>
        <Link
          to="/owner/products/new"
          className="bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-2.5 px-5 rounded-tk-input text-xs flex items-center justify-center gap-1.5 self-start shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters controls bar */}
      <div className="bg-white border border-tk-border rounded-tk-card p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-tk-text-tertiary" />
          <input
            type="text"
            placeholder="Search by name, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-tk-border rounded-tk-input text-xs text-tk-text-primary placeholder-tk-text-tertiary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep focus:border-tk-blue-deep"
          />
        </div>

        {/* Category filter dropdown */}
        <div className="relative w-full md:w-56 flex items-center gap-2">
          <Filter className="h-4 w-4 text-tk-text-secondary shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-tk-border rounded-tk-input px-3 py-2 text-xs text-tk-text-primary focus:outline-none focus:ring-1 focus:ring-tk-blue-deep"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table container */}
      <div className="bg-white border border-tk-border rounded-tk-card overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-tk-text-secondary text-sm">
            No products match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-tk-border/50 text-xs">
              <thead className="bg-tk-blue-pale/50">
                <tr>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-left uppercase tracking-wider">Product Info</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-left uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-left uppercase tracking-wider">SKU ID</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-left uppercase tracking-wider">Pricing</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-center uppercase tracking-wider">Stock Status</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-center uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-4 font-bold text-tk-text-secondary text-right uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-tk-border/50 bg-white">
                {filteredProducts.map((prod) => {
                  const cat = categories.find(c => c.id === prod.category_id);
                  const inStock = prod.stock > 0;
                  return (
                    <tr key={prod.id} className="hover:bg-tk-blue-pale/20 transition-colors">
                      {/* Image + Title */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.cover_image}
                            alt={prod.name}
                            className="w-10 h-12 object-cover rounded bg-tk-blue-pale border border-tk-border shrink-0"
                          />
                          <div className="max-w-[200px] truncate">
                            <span className="font-semibold text-tk-text-primary block truncate hover:text-tk-blue-deep">
                              {prod.name}
                            </span>
                            {prod.brand && (
                              <span className="text-[10px] text-tk-text-secondary block">Brand: {prod.brand}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-tk-text-primary">
                          {cat ? `${cat.icon} ${cat.name}` : '—'}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-tk-text-secondary">
                        {prod.sku}
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-tk-text-primary">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          {prod.old_price && (
                            <span className="text-[10px] text-tk-text-tertiary line-through">
                              ₹{prod.old_price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleStock(prod.id, prod.stock)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold transition-all text-[10px] ${
                            inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {inStock ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>In Stock ({prod.stock})</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Enquire Only</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleFeatured(prod.id, prod.featured)}
                          className={`p-1.5 rounded-full border transition-all ${
                            prod.featured
                              ? 'bg-amber-50 border-amber-200 text-amber-500'
                              : 'bg-white border-tk-border text-tk-text-tertiary hover:text-amber-500'
                          }`}
                          title={prod.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <Star className={`h-4.5 w-4.5 ${prod.featured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>

                      {/* Action tools */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-full hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
                            title="Preview Public Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          
                          <Link
                            to={`/owner/products/${prod.id}/edit`}
                            className="p-1.5 rounded-full hover:bg-tk-blue-light text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-full hover:bg-red-50 text-tk-text-tertiary hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
