import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom';
import { CollectionProvider } from '@/context/CollectionContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { SearchOverlay } from '@/components/SearchOverlay';
import { CollectionDrawer } from '@/components/CollectionDrawer';

// Pages
import { Home } from '@/pages/Home';
import { CategoryPage } from '@/pages/Category';
import { ProductDetail } from '@/pages/ProductDetail';
import { Contact } from '@/pages/Contact';

// Owner Admin Pages
import { OwnerLayout } from '@/layouts/OwnerLayout';
import { OwnerLogin } from '@/pages/owner/Login';
import { OwnerDashboard } from '@/pages/owner/Dashboard';
import { ProductList } from '@/pages/owner/ProductList';
import { ProductForm } from '@/pages/owner/ProductForm';
import { UploadWizard } from '@/pages/owner/UploadWizard';
import { ResetPassword } from '@/pages/owner/ResetPassword';

// Scroll to top helper on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Public Layout containing Header, Footer, Bottom Navigation & Side Overlays
const PublicLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const location = useLocation();

  // If path is exactly /search, open search overlay automatically
  useEffect(() => {
    if (location.pathname === '/search') {
      setIsSearchOpen(true);
    }
  }, [location.pathname]);

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    // If they navigated directly to /search, change URL back to home when closing
    if (location.pathname === '/search') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-tk-bg text-tk-text-primary antialiased">
      {/* Scroll restore */}
      <ScrollToTop />

      {/* Public Header */}
      <Header 
        onSearchOpen={() => setIsSearchOpen(true)} 
        onCollectionOpen={() => setIsCollectionOpen(true)} 
      />

      {/* Pages Content View */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-4">
        <Outlet />
      </div>

      {/* Footer Area */}
      <footer className="bg-white dark:bg-tk-surface border-t border-tk-border py-8 pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tk-text-secondary">
          <div className="text-center sm:text-left">
            <p className="font-bold text-tk-text-primary">TEKART Smart Living Storefront</p>
            <p className="mt-0.5">30-A/08 Alexandra Press Road, Nagercoil – 629001</p>
          </div>
          
          <div className="flex gap-4">
            <a href="tel:+917339433225" className="hover:text-tk-blue-deep transition-colors">Call Store</a>
            <span>·</span>
            <a href="https://wa.me/919384180516" className="hover:text-tk-blue-deep transition-colors">WhatsApp</a>
            <span>·</span>
            <Link to="/owner" className="hover:text-tk-blue-deep transition-colors">Admin Login</Link>
          </div>

          <p className="text-[10px] text-tk-text-tertiary">
            &copy; {new Date().getFullYear()} TEKART. All rights reserved. Made in India.
          </p>
        </div>
      </footer>

      {/* Overlays Panels */}
      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={handleCloseSearch} 
      />
      
      <CollectionDrawer 
        isOpen={isCollectionOpen} 
        onClose={() => setIsCollectionOpen(false)} 
      />

      {/* Sticky Bottom Nav Bar for Mobile screens */}
      <BottomNav 
        onSearchOpen={() => setIsSearchOpen(true)} 
        onExploreOpen={() => setIsCollectionOpen(true)} 
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CollectionProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Storefront Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="search" element={<Home />} /> {/* Renders home page with active search modal */}
              <Route path="contact" element={<Contact />} />
            </Route>

            {/* Secure Admin Portal Routes */}
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/reset-password" element={<ResetPassword />} />
            <Route path="/owner" element={<OwnerLayout />}>
              <Route index element={<OwnerDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="upload" element={<UploadWizard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CollectionProvider>
    </ThemeProvider>
  );
}

export default App;
