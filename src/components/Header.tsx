import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, PhoneCall, Sun, Moon, Monitor } from 'lucide-react';
import { useCollection } from '@/context/CollectionContext';
import tekartLogo from '@/assets/tekart-logo.png';
import { supabase, type Category } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const MotionLink = motion(Link);

interface HeaderProps {
  onSearchOpen: () => void;
  onCollectionOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchOpen, onCollectionOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemsCount } = useCollection();
  const { theme, setTheme, resolvedTheme } = useTheme();
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative flex items-center justify-between">
          {/* Left: Menu button */}
          <motion.button
            onClick={() => setIsMenuOpen(true)}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 -ml-2 text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200 cursor-pointer z-20"
            aria-label="Open navigation menu"
            id="btn-open-menu"
          >
            <Menu className="h-6 w-6" />
          </motion.button>

          {/* Center: Logo (perfectly centered top center) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link to="/" className="flex items-center justify-center">
              <motion.img
                src={tekartLogo}
                alt="TEKART - SMART LIVING"
                whileHover={{ scale: 1.05, y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="h-9 md:h-11 w-auto object-contain cursor-pointer transition-all duration-300"
                style={resolvedTheme === 'dark' ? { filter: 'brightness(0) invert(1)' } : undefined}
              />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 z-20">
            {/* Theme Toggle Dropdown */}
            <div className="hidden sm:block relative group">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200 cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'system' && <Monitor className="h-5 w-5" />}
              </motion.button>
              
              <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-tk-surface border border-tk-border rounded-tk-input shadow-lg py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                <button
                  onClick={(e) => setTheme('light', e)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 hover:bg-tk-blue-pale dark:hover:bg-tk-surface-2 ${
                    theme === 'light' ? 'text-tk-blue-deep bg-tk-blue-light/50' : 'text-tk-text-secondary'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={(e) => setTheme('dark', e)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 hover:bg-tk-blue-pale dark:hover:bg-tk-surface-2 ${
                    theme === 'dark' ? 'text-tk-blue-deep bg-tk-blue-light/50' : 'text-tk-text-secondary'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={(e) => setTheme('system', e)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center gap-2 hover:bg-tk-blue-pale dark:hover:bg-tk-surface-2 ${
                    theme === 'system' ? 'text-tk-blue-deep bg-tk-blue-light/50' : 'text-tk-text-secondary'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <motion.button
              onClick={onSearchOpen}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200 cursor-pointer"
              aria-label="Search products"
              id="btn-header-search"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            {/* Collection (Wishlist) */}
            <motion.button
              onClick={onCollectionOpen}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 relative text-tk-text-primary hover:text-tk-blue-deep transition-colors duration-200 cursor-pointer"
              aria-label="Open collection"
              id="btn-header-collection"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-tk-blue-deep text-[10px] font-bold text-white animate-scale-in">
                  {itemsCount}
                </span>
              )}
            </motion.button>

            {/* WhatsApp (Desktop Direct) */}
            <motion.a
              href="https://wa.me/919384180516"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="hidden sm:flex p-2 items-center gap-1 text-xs font-semibold text-white bg-tk-wa hover:bg-tk-wa-dark transition-colors duration-200 rounded-full px-3 cursor-pointer shadow-sm hover:shadow"
              id="btn-header-whatsapp"
            >
              <PhoneCall className="h-3 w-3" />
              <span>WhatsApp</span>
            </motion.a>
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
          <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-tk-surface p-6 shadow-2xl transition-transform duration-300 animate-slide-in-left">
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
              <MotionLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                whileHover={{ x: 4 }}
                className="block text-base font-semibold text-tk-text-primary hover:text-tk-blue-deep py-2 border-b border-tk-border/50"
              >
                Home
              </MotionLink>
              
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
                    <motion.button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      whileHover={{ x: 6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-full text-left block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep py-2 pl-2 border-l-2 border-transparent hover:border-tk-blue-bright transition-colors duration-200 cursor-pointer"
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </motion.button>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-tk-border mt-6 space-y-3">
                <MotionLink
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ x: 4 }}
                  className="block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep"
                >
                  Store Location & Hours
                </MotionLink>
                <MotionLink
                  to="/owner"
                  onClick={() => setIsMenuOpen(false)}
                  whileHover={{ x: 4 }}
                  className="block text-sm font-medium text-tk-text-secondary hover:text-tk-blue-deep"
                >
                  Owner Portal
                </MotionLink>
              </div>
            </nav>

            {/* Theme switcher inside Mobile Drawer */}
            <div className="border-t border-tk-border pt-4 pb-4">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-tk-text-secondary mb-2">
                Theme Mode
              </span>
              <div className="flex bg-tk-blue-pale dark:bg-tk-surface-2 p-1 rounded-tk-input border border-tk-border">
                <button
                  onClick={(e) => setTheme('light', e)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-tk-chip text-[11px] font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-white dark:bg-tk-surface text-tk-blue-deep shadow-sm'
                      : 'text-tk-text-secondary hover:text-tk-text-primary'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={(e) => setTheme('dark', e)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-tk-chip text-[11px] font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-tk-surface text-tk-blue-deep shadow-sm'
                      : 'text-tk-text-secondary hover:text-tk-text-primary'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={(e) => setTheme('system', e)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-tk-chip text-[11px] font-semibold transition-all ${
                    theme === 'system'
                      ? 'bg-white dark:bg-tk-surface text-tk-blue-deep shadow-sm'
                      : 'text-tk-text-secondary hover:text-tk-text-primary'
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            <div className="border-t border-tk-border pt-4">
              <div className="text-xs text-tk-text-secondary space-y-1">
                <p className="font-semibold text-tk-text-primary">TEKART Smart Living</p>
                <p>Nagercoil, Tamil Nadu</p>
                <p>+91 7339433225</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
