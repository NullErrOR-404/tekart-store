import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, PhoneCall } from 'lucide-react';
import { useCollection } from '@/context/CollectionContext';
import tekartLogo from '@/assets/tekart-logo.png';
import { supabase, type Category } from '@/lib/supabase';

interface HeaderProps {
  onSearchOpen: () => void;
  onCollectionOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchOpen, onCollectionOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemsCount } = useCollection();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories for menu drawer
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('priority', { ascending: true });
      if (data) setCategories(data);
    };
    fetchCategories();

    // Handle scroll background effect
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryClick = (slug: string) => {
    setIsMenuOpen(false);
    navigate(`/category/${slug}`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled 
            ? 'tk-glass shadow-sm py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left: Menu button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200"
            aria-label="Open navigation menu"
            id="btn-open-menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link to="/" className="flex items-center justify-center">
              <img
                src={tekartLogo}
                alt="TEKART - SMART LIVING"
                className="h-9 md:h-11 w-auto object-contain transition-all duration-300"
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onSearchOpen}
              className="p-2 text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200"
              aria-label="Search products"
              id="btn-header-search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Collection (Wishlist) */}
            <button
              onClick={onCollectionOpen}
              className="p-2 relative text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200"
              aria-label="Open collection"
              id="btn-header-collection"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tk-blue-deep text-[10px] font-bold text-white animate-scale-in">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* WhatsApp (Desktop Direct) */}
            <a
              href="https://wa.me/919384180516"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 items-center gap-1 text-xs font-semibold text-white bg-tk-wa hover:bg-tk-wa-dark transition-colors duration-200 rounded-full px-3"
              id="btn-header-whatsapp"
            >
              <PhoneCall className="h-3 w-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Drawer Menu (Overlay) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-full max-w-xs flex-col bg-white p-6 shadow-2xl transition-transform duration-300 animate-slide-in-left">
            <div className="flex items-center justify-between border-b border-tk-border pb-4">
              <span className="font-display font-bold text-lg text-tk-text-primary">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 text-tk-text-secondary hover:text-tk-text-primary"
                aria-label="Close menu"
                id="btn-close-menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-4">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block text-base font-semibold text-tk-text-primary hover:text-tk-blue-deep py-2 border-b border-tk-border/50"
              >
                Home
              </Link>
              
              <div className="space-y-1">
                <span className="block text-xs font-bold uppercase tracking-wider text-tk-text-secondary mt-4 mb-2">
                  Shop Categories
                </span>
                
                {categories.length === 0 ? (
                  <div className="space-y-2 py-2">
                    <div className="h-4 bg-tk-blue-light animate-pulse rounded w-3/4"></div>
                    <div className="h-4 bg-tk-blue-light animate-pulse rounded w-1/2"></div>
                  </div>
                ) : (
                  categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="w-full text-left block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep py-2 pl-2 border-l-2 border-transparent hover:border-tk-blue-bright transition-all"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-tk-border mt-6 space-y-3">
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep"
                >
                  Store Location & Hours
                </Link>
                <Link
                  to="/owner"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep"
                >
                  Owner Portal
                </Link>
              </div>
            </nav>

            <div className="border-t border-tk-border pt-4">
              <div className="text-xs text-tk-text-secondary space-y-1">
                <p className="font-semibold text-tk-text-primary">TEKART Smart Living</p>
                <p>Nagercoil, Tamil Nadu</p>
                <p>+91 9384180516</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
