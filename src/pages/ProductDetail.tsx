import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, PhoneCall, Award, ShieldCheck, HelpCircle, ZoomIn } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { useCollection } from '@/context/CollectionContext';
import { ProductCard } from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageLightbox } from '@/components/ImageLightbox';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem, buildSingleProductWhatsAppURL } = useCollection();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      
      // 1. Fetch all categories
      const { data: allCats } = await supabase.from('categories').select('*');
      if (allCats) setCategories(allCats);

      // 2. Fetch the product
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

      if (prodData) {
        setProduct(prodData);
        setActiveImgIndex(0);

        // 3. Fetch related products in same category (exclude current)
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', prodData.category_id)
          .neq('id', prodData.id)
          .order('priority', { ascending: true });
        
        if (related) {
          setRelatedProducts(related.slice(0, 4));
        }
      } else {
        setProduct(null);
      }
      setIsLoading(false);
    };

    fetchProductDetails();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8 min-h-[50vh] text-left">
        <div className="h-6 bg-tk-blue-light animate-pulse rounded w-24"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="aspect-[4/5] bg-white border border-tk-border rounded-tk-card animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-tk-blue-light animate-pulse rounded w-3/4"></div>
            <div className="h-4 bg-tk-blue-light animate-pulse rounded w-1/4"></div>
            <div className="h-20 bg-tk-blue-light animate-pulse rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-tk-text-primary">Product Not Found</h2>
        <p className="text-sm text-tk-text-secondary">The product you are looking for does not exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-tk-blue-deep hover:text-tk-blue-mid">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Combine cover image and gallery array for full list
  const images = [product.cover_image, ...(product.gallery || [])].filter(Boolean);
  const category = categories.find(c => c.id === product.category_id);

  const handleWhatsAppEnquiry = () => {
    const pageURL = window.location.href;
    const url = buildSingleProductWhatsAppURL(product, pageURL);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12 pb-32 text-left">
      {/* Back Link */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tk-text-secondary hover:text-tk-blue-deep transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Product Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-6 space-y-4">
          <div 
            onClick={() => setIsLightboxOpen(true)}
            className="relative aspect-[4/5] bg-white border border-tk-border rounded-tk-modal overflow-hidden shadow-sm cursor-zoom-in group"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImgIndex}
                src={images[activeImgIndex]}
                alt={`${product.name} - View ${activeImgIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Hover overlay with zoom prompt */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center z-10">
              <span className="opacity-0 group-hover:opacity-100 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 scale-95 group-hover:scale-100 shadow-md">
                <ZoomIn className="h-4 w-4" />
                <span>Click to Zoom</span>
              </span>
            </div>

            {product.badge && (
              <span className="absolute top-4 left-4 bg-tk-blue-deep text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-tk-chip shadow-sm z-20">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative w-20 aspect-[4/5] rounded-tk-input overflow-hidden border bg-tk-blue-pale shrink-0 transition-all ${
                    idx === activeImgIndex 
                      ? 'border-tk-blue-deep ring-1 ring-tk-blue-deep' 
                      : 'border-tk-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            {category && (
              <Link
                to={`/category/${category.slug}`}
                className="text-xs font-bold tracking-wider text-tk-blue-deep uppercase hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="font-display font-bold text-3xl md:text-4xl text-tk-text-primary tracking-tight">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-sm text-tk-text-secondary font-medium">Brand: {product.brand}</p>
            )}
            <p className="text-xs text-tk-text-tertiary">Product ID / SKU: {product.sku}</p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-center gap-3 p-4 bg-tk-blue-pale/50 rounded-tk-card border border-tk-border/50">
            <span className="text-3xl font-bold text-tk-text-primary">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.old_price && (
              <>
                <span className="text-lg text-tk-text-tertiary line-through">
                  ₹{product.old_price.toLocaleString('en-IN')}
                </span>
                <span className="bg-tk-wa text-white text-xs font-bold px-2 py-0.5 rounded-tk-chip">
                  {Math.round(((product.old_price - product.price) / product.old_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* In Stock Badge */}
          <div>
            {product.in_stock ? (
              <span className="inline-flex items-center bg-tk-blue-light text-tk-blue-deep text-xs font-semibold py-1.5 px-3 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tk-wa mr-2 animate-pulse"></span>
                In Stock & Ready to Ship
              </span>
            ) : (
              <span className="inline-flex items-center bg-tk-surface-2 text-tk-text-secondary text-xs font-semibold py-1.5 px-3 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tk-text-secondary mr-2"></span>
                Ask Availability
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm font-medium text-tk-text-secondary leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Detailed Description */}
          {product.description && (
            <div className="space-y-2 pt-2 border-t border-tk-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
                Product Description
              </h4>
              <p className="text-sm text-tk-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Why Choose This section */}
          <div className="space-y-3 pt-4 border-t border-tk-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">
              Why Buy From TEKART?
            </h4>
            <ul className="space-y-2 text-sm text-tk-text-secondary">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-tk-blue-deep shrink-0" />
                <span>100% Original products verified by showroom inspection</span>
              </li>
              <li className="flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-tk-blue-deep shrink-0" />
                <span>Fast, interactive checkout over secure WhatsApp channel</span>
              </li>
              <li className="flex items-center gap-2">
                <HelpCircle className="h-4.5 w-4.5 text-tk-blue-deep shrink-0" />
                <span>Boutique experience — direct access to store owner</span>
              </li>
            </ul>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-4 pt-4">
            <button
              onClick={() => {
                addItem(product);
                // Alert popup or feedback
              }}
              className="flex-1 bg-white hover:bg-tk-blue-pale border border-tk-blue-deep hover:border-tk-blue-mid text-tk-blue-deep font-bold py-3.5 px-6 rounded-tk-input flex items-center justify-center gap-2 transition-all"
              id="btn-desktop-add-collection"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Collection</span>
            </button>

            <button
              onClick={handleWhatsAppEnquiry}
              className="flex-1 bg-tk-wa hover:bg-tk-wa-dark text-white font-bold py-3.5 px-6 rounded-tk-input flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
              id="btn-desktop-enquire-wa"
            >
              <PhoneCall className="h-5 w-5" />
              <span>Enquire on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-12 border-t border-tk-border">
          <h3 className="font-display font-bold text-xl text-tk-text-primary">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                categories={categories}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Actions Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-[60px] left-0 right-0 z-30 bg-white border-t border-tk-border px-4 py-3 flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => addItem(product)}
          className="flex-1 bg-white border border-tk-blue-deep text-tk-blue-deep font-bold py-3 px-4 rounded-tk-input text-sm flex items-center justify-center gap-1.5"
          id="btn-mobile-add-collection"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Add to Collection</span>
        </button>

        <button
          onClick={handleWhatsAppEnquiry}
          className="flex-1 bg-tk-wa hover:bg-tk-wa-dark text-white font-bold py-3 px-4 rounded-tk-input text-sm flex items-center justify-center gap-1.5 shadow-sm"
          id="btn-mobile-enquire-wa"
        >
          <PhoneCall className="h-4 w-4" />
          <span>WhatsApp Enquiry</span>
        </button>
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        activeIndex={activeImgIndex}
        onChangeIndex={setActiveImgIndex}
        productName={product.name}
      />
    </div>
  );
};
