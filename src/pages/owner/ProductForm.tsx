import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Upload } from 'lucide-react';
import { supabase, type Category } from '@/lib/supabase';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [featured, setFeatured] = useState(false);
  const [badge, setBadge] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [priority, setPriority] = useState('0');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Loading categories and product if edit mode
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('*').order('priority', { ascending: true });
      if (catData) {
        setCategories(catData);
        if (catData.length > 0 && !categoryId) {
          setCategoryId(catData[0].id);
        }
      }

      if (isEditMode) {
        const { data: prod, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (prod) {
          setName(prod.name);
          setSku(prod.sku);
          setSlug(prod.slug);
          setCategoryId(prod.category_id);
          setBrand(prod.brand || '');
          setPrice(prod.price.toString());
          setOldPrice(prod.old_price ? prod.old_price.toString() : '');
          setStock(prod.stock.toString());
          setFeatured(prod.featured || false);
          setBadge(prod.badge || '');
          setCoverImage(prod.cover_image);
          setGalleryInput(prod.gallery ? prod.gallery.join(', ') : '');
          setShortDescription(prod.short_description || '');
          setDescription(prod.description || '');
          setTagsInput(prod.tags ? prod.tags.join(', ') : '');
          setPriority(prod.priority.toString());
          setSeoTitle(prod.seo_title || '');
          setSeoDescription(prod.seo_description || '');
        } else if (error) {
          setErrorMsg('Failed to load product details.');
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [id, isEditMode]);

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditMode) {
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
      
      // Auto-generate SKU
      const initials = val
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      if (initials) {
        setSku(`TK-${initials}-${Math.floor(100 + Math.random() * 900)}`);
      }
    }
  };

  // Handle local cover image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      // Validate type & size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg('Only JPG, PNG, WEBP, and SVG image files are allowed.');
        setIsLoading(false);
        return;
      }

      // Max size: 2MB
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image size must be smaller than 2MB.');
        setIsLoading(false);
        return;
      }

      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        setErrorMsg(`Storage upload error: ${error.message}`);
      } else if (data) {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
        
        if (urlData) {
          setCoverImage(urlData.publicUrl);
          setSuccessMsg('Image uploaded and set as cover successfully!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err: any) {
      setErrorMsg(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!name.trim()) return setErrorMsg('Product name is required.');
    if (!sku.trim()) return setErrorMsg('Product SKU is required.');
    if (!slug.trim()) return setErrorMsg('Product slug is required.');
    if (!price || isNaN(Number(price))) return setErrorMsg('Price must be a valid number.');
    if (!coverImage.trim()) return setErrorMsg('Cover image URL or upload is required.');

    const parsedPrice = parseFloat(price);
    const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : undefined;
    const parsedStock = parseInt(stock) || 0;
    const parsedPriority = parseInt(priority) || 0;

    const galleryArr = galleryInput
      .split(',')
      .map(url => url.trim())
      .filter(Boolean);

    const tagsArr = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    const productPayload = {
      name: name.trim(),
      sku: sku.trim(),
      slug: slug.trim(),
      category_id: categoryId,
      brand: brand.trim() || null,
      price: parsedPrice,
      old_price: parsedOldPrice || null,
      stock: parsedStock,
      featured,
      badge: badge.trim() || null,
      cover_image: coverImage.trim(),
      gallery: galleryArr,
      tags: tagsArr,
      priority: parsedPriority,
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
    };

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', id);

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Product details updated successfully!');
          setTimeout(() => navigate('/owner/products'), 1500);
        }
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productPayload]);

        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('New product added successfully!');
          setTimeout(() => navigate('/owner/products'), 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the product details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl pb-12">
      {/* Back button */}
      <div>
        <Link 
          to="/owner/products" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Product Listing</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary">
          {isEditMode ? 'Edit Product Details' : 'Add New Product'}
        </h2>
        <p className="text-xs text-tk-text-secondary">
          {isEditMode ? 'Modify properties of the existing catalog item.' : 'Create a new boutique storefront record.'}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-tk-input p-4 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-tk-input p-4 text-xs text-emerald-800 flex items-center gap-2">
          <Save className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleFormSubmit} className="space-y-6 bg-white dark:bg-tk-surface border border-tk-border rounded-tk-modal p-6 md:p-8 shadow-sm">
        
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tk-blue-deep border-b border-tk-border pb-2">
            1. Core Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g., Oud Royal Cologne"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g., TEKART Fragrances"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Unique SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., TK-OUD-201"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., oud-royal-cologne"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Category Association *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white dark:bg-tk-surface-2 px-3.5 py-2.5 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Stock */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tk-blue-deep border-b border-tk-border pb-2">
            2. Pricing & Stock
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999.00"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Old Strikethrough Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="1499.00"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Stock Level Count</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Product Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g., Popular, New, Sale"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-tk-border text-tk-blue-deep focus:ring-tk-blue-deep"
            />
            <label htmlFor="featured" className="text-xs font-bold text-tk-text-primary select-none cursor-pointer">
              Mark as Featured Product (displays on landing page grid)
            </label>
          </div>
        </div>

        {/* Section 3: Media Attachments */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tk-blue-deep border-b border-tk-border pb-2">
            3. Images & Media
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-tk-text-secondary mb-1">Cover Image URL *</label>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tk-text-secondary mb-1">Or Upload Local Image</label>
                <div className="mt-1 flex items-center gap-3">
                  <label className="cursor-pointer bg-tk-blue-light hover:bg-tk-blue-strong/20 text-tk-blue-deep font-bold py-2 px-4 rounded-tk-input text-xs flex items-center gap-1.5 transition-colors border border-tk-border">
                    <Upload className="h-4.5 w-4.5" />
                    <span>Upload to Storage</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {isLoading && <span className="text-xs text-tk-text-tertiary">Uploading...</span>}
                </div>
              </div>
            </div>

            {/* Preview Image */}
            <div className="bg-tk-blue-pale/50 border border-tk-border rounded-tk-card p-4 flex items-center justify-center h-40">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="max-h-full max-w-full object-contain rounded border border-tk-border shadow-sm"
                />
              ) : (
                <span className="text-xs text-tk-text-tertiary">Cover Image Preview</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-tk-text-secondary mb-1">
              Gallery Image URLs (comma-separated list for thumbnails)
            </label>
            <input
              type="text"
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="https://image1.jpg, https://image2.jpg"
              className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Section 4: Descriptions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tk-blue-deep border-b border-tk-border pb-2">
            4. Descriptions & Details
          </h3>

          <div>
            <label className="block text-xs font-bold text-tk-text-secondary mb-1">Short Tagline Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Short 1-line display under product title"
              className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-tk-text-secondary mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full product details, specifications, and notes."
              className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Search Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="fragrance, oud, perfume"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">Display Priority Weight (higher runs first)</label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 5: SEO */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-tk-text-secondary border-b border-tk-border pb-2">
            5. SEO Configurations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">SEO Page Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Search engine meta title"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-tk-text-secondary mb-1">SEO Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Search engine meta description snippet"
                className="w-full px-3.5 py-2 border border-tk-border rounded-tk-input text-xs focus:ring-1 focus:ring-tk-blue-deep focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Form Submit */}
        <div className="pt-4 border-t border-tk-border flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/products')}
            className="border border-tk-border hover:bg-tk-blue-pale text-tk-text-secondary font-bold py-2.5 px-6 rounded-tk-input text-xs transition-all"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-2.5 px-6 rounded-tk-input text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Product</span>
          </button>
        </div>
      </form>
    </div>
  );
};
