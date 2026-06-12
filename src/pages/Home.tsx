import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, Sparkles, ShieldCheck, BadgeCheck, MessageSquare, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const slideshowProducts = products.filter(p => p.featured).slice(0, 6);
  // Fallback to top 5 products if no products are explicitly marked featured
  const finalSlideshowProducts = slideshowProducts.length > 0 
    ? slideshowProducts 
    : products.slice(0, 5);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    if (finalSlideshowProducts.length <= 1) return;
    const timer = setTimeout(() => {
      setActiveSlideIndex(prev => (prev + 1) % finalSlideshowProducts.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeSlideIndex, finalSlideshowProducts.length]);

  const currentSlideProduct = finalSlideshowProducts[activeSlideIndex] || null;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: true });
      if (catData) setCategories(catData);

      // Fetch products (limit to 12)
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
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
        // Limit to 12 products
        setProducts(sortedProds.slice(0, 12));
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-tk-blue-light/50 via-white dark:via-tk-surface to-tk-blue-pale/80 py-12 md:py-24 px-4 md:px-8 border-b border-tk-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Hero Content */}
          <div className="md:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tk-blue-light text-tk-blue-deep rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Living Showroom</span>
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight text-tk-text-primary leading-[1.05]">
              SMART <br />
              <span className="bg-gradient-to-r from-tk-blue-deep to-tk-blue-bright bg-clip-text text-transparent">
                LIVING
              </span>
            </h1>

            <p className="text-base md:text-lg text-tk-text-secondary max-w-xl leading-relaxed">
              Welcome to TEKART. We curate premium electronics, exquisite perfumes, designer fashion, and top-tier cosmetics. Simple browsing, instant WhatsApp checkouts, absolute quality.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('trending-products');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-tk-blue-deep hover:bg-tk-blue-mid text-white font-bold py-3.5 px-7 rounded-tk-input flex items-center gap-2 shadow-lg shadow-tk-blue-deep/10 transition-all hover:scale-[1.01]"
                id="btn-hero-explore"
              >
                <span>Explore Products</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="https://wa.me/919384180516"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-tk-surface border border-tk-border hover:border-tk-blue-mid text-tk-text-primary hover:text-tk-blue-deep font-bold py-3.5 px-6 rounded-tk-input flex items-center gap-2 shadow-sm transition-all"
                id="btn-hero-whatsapp"
              >
                <PhoneCall className="h-4 w-4 text-tk-wa" />
                <span>Talk to Owner</span>
              </a>
            </div>
          </div>

          {/* Hero Image Slideshow */}
          <div className="md:col-span-5 relative group/slideshow">
            {currentSlideProduct ? (
              <div className="relative aspect-[4/5] md:aspect-square rounded-tk-modal overflow-hidden bg-tk-blue-pale border border-tk-border shadow-xl transition-all duration-300 hover:shadow-2xl">
                {/* Active Slide Link */}
                <Link 
                  to={`/product/${currentSlideProduct.slug}`}
                  className="block w-full h-full"
                >
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSlideIndex}
                      src={currentSlideProduct.cover_image}
                      alt={currentSlideProduct.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                    />
                  </AnimatePresence>
                </Link>

                {/* Left/Right manual arrows (hidden on mobile, visible on desktop hover) */}
                {finalSlideshowProducts.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSlideIndex(prev => 
                          prev === 0 ? finalSlideshowProducts.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-tk-surface/85 hover:bg-white dark:hover:bg-tk-surface text-tk-text-primary border border-tk-border shadow-md opacity-0 group-hover/slideshow:opacity-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSlideIndex(prev => 
                          (prev + 1) % finalSlideshowProducts.length
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/85 dark:bg-tk-surface/85 hover:bg-white dark:hover:bg-tk-surface text-tk-text-primary border border-tk-border shadow-md opacity-0 group-hover/slideshow:opacity-100 transition-all duration-200 cursor-pointer flex items-center justify-center"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}

                {/* Progress Indicators/Dots */}
                {finalSlideshowProducts.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/15 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
                    {finalSlideshowProducts.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === activeSlideIndex 
                            ? 'w-4 bg-white' 
                            : 'w-1.5 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Premium Product Details Card Overlay */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlideIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-4 right-4 bg-white/90 dark:bg-tk-surface/90 backdrop-blur-md border border-tk-border p-3 rounded-tk-card shadow-lg text-left max-w-[200px] z-10 hidden sm:block"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-tk-blue-deep block mb-0.5">
                      Featured Item
                    </span>
                    <h4 className="font-sans font-bold text-xs text-tk-text-primary line-clamp-1">
                      {currentSlideProduct.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-tk-border">
                      <span className="text-xs font-extrabold text-tk-text-primary">
                        ₹{currentSlideProduct.price.toLocaleString('en-IN')}
                      </span>
                      <Link 
                        to={`/product/${currentSlideProduct.slug}`}
                        className="text-[10px] font-bold text-tk-blue-deep flex items-center gap-0.5 hover:underline"
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              /* Skeleton Loader */
              <div className="aspect-[4/5] md:aspect-square rounded-tk-modal bg-white dark:bg-tk-surface border border-tk-border animate-pulse shadow-sm"></div>
            )}

            {/* Float Badge */}
            <div className="absolute -bottom-4 -left-4 bg-white dark:bg-tk-surface border border-tk-border p-4 rounded-tk-card shadow-lg flex items-center gap-3 z-20">
              <div className="w-10 h-10 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-tk-text-primary">100% Original</p>
                <p className="text-[10px] text-tk-text-secondary">Verified Store Curation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary mb-4 text-left">
          Shop by Category
        </h2>
        
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/category/${cat.slug}`)}
              className="flex items-center gap-2 bg-white dark:bg-tk-surface hover:bg-tk-blue-light dark:hover:bg-tk-surface-2 hover:text-tk-blue-deep border border-tk-border hover:border-tk-blue-strong px-5 py-3 rounded-full font-medium text-sm text-tk-text-primary transition-all whitespace-nowrap shadow-sm shrink-0"
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FEATURED EDITORIAL CARDS */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.slice(0, 3).map((cat) => (
            <div key={cat.id} className="relative aspect-[16/10] md:aspect-auto md:h-72 rounded-tk-card overflow-hidden group border border-tk-border shadow-sm">
              <img
                src={cat.cover_image || "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop"}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-tk-blue-bright mb-1">
                  Explore Curation
                </span>
                <h3 className="font-display font-bold text-xl text-white mb-2">{cat.name}</h3>
                <Link
                  to={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-tk-blue-bright transition-colors"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 4. PRODUCT GRID ("Trending Now") */}
      <section id="trending-products" className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-tk-text-secondary">Curated Selection</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary mt-1">Trending Now</h2>
          </div>
          <Link
            to="/category/fashion"
            className="text-sm font-semibold text-tk-blue-deep hover:text-tk-blue-mid flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white dark:bg-tk-surface border border-tk-border rounded-tk-card p-4 space-y-4 animate-pulse">
                <div className="w-full h-2/3 bg-tk-blue-pale rounded-tk-input"></div>
                <div className="h-4 bg-tk-blue-pale rounded w-3/4"></div>
                <div className="h-3 bg-tk-blue-pale rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. TRUST STRIP */}
      <section className="bg-white dark:bg-tk-surface border-y border-tk-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-tk-text-primary">Original Products</p>
              <p className="text-[11px] text-tk-text-secondary">Direct from authorized hubs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep shrink-0">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-tk-text-primary">Store Verified</p>
              <p className="text-[11px] text-tk-text-secondary">Physical showroom audit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-tk-text-primary">Fast Response</p>
              <p className="text-[11px] text-tk-text-secondary">Owner replies in minutes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-tk-blue-light flex items-center justify-center text-tk-blue-deep shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-tk-text-primary">Nagercoil, TN</p>
              <p className="text-[11px] text-tk-text-secondary">Proud local storefront</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VISIT US CARD */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white dark:bg-tk-surface border border-tk-border rounded-tk-modal p-6 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
          <div className="md:col-span-7 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tk-blue-deep bg-tk-blue-light py-1 px-2.5 rounded">
              Visit Our Store
            </span>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-tk-text-primary">
              TEKART SMART LIVING
            </h3>
            <div className="space-y-2 text-sm text-tk-text-secondary">
              <p className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-tk-blue-deep shrink-0 mt-0.5" />
                <span>30-A/08 Alexandra Press Road, Nagercoil – 629001, Tamil Nadu</span>
              </p>
              <p className="pl-7">
                <strong>Contact:</strong> +91 7339433225 / +91 9025511375
              </p>
              <p className="pl-7">
                <strong>Hours:</strong> 10:00 AM - 09:00 PM (Monday - Saturday)
              </p>
            </div>
            <div className="pt-2 flex gap-4">
              <a
                href="https://maps.google.com/?q=Alexandra+Press+Road,+Nagercoil"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-tk-blue-light text-tk-blue-deep hover:bg-tk-blue-deep hover:text-white font-bold py-2.5 px-5 rounded-tk-input text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Open Google Maps</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="md:col-span-5 h-48 md:h-64 rounded-tk-card bg-tk-blue-pale border border-tk-border overflow-hidden">
            {/* Embed static map mock styling or iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3949.3140733568864!2d77.42557997451383!3d8.171060902047805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b04f123bc60a7ff%3A0xe541cf5e1e484bf8!2sNagercoil%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              title="TEKART Store Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};
