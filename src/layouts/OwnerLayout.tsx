import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBasket, Image, LogOut, Store } from 'lucide-react';
import { supabase, isMockMode } from '@/lib/supabase';

export const OwnerLayout: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        setUserEmail(data.session.user?.email || '');
      } else {
        setIsAuthenticated(false);
        // Save redirect path
        navigate('/owner/login', { state: { from: location } });
      }
    };
    checkAuth();
  }, [navigate, location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    navigate('/');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tk-bg">
        <div className="h-8 w-8 border-4 border-tk-blue-deep border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
    { label: 'Manage Products', path: '/owner/products', icon: ShoppingBasket },
    { label: 'Batch Upload', path: '/owner/upload', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-tk-bg flex flex-col md:flex-row text-left">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-tk-border flex flex-col shrink-0">
        {/* Brand/Header */}
        <div className="p-6 border-b border-tk-border flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-lg text-tk-text-primary">TEKART Admin</h1>
            <p className="text-[10px] text-tk-text-secondary font-medium uppercase tracking-wider">
              {isMockMode ? 'Mock Offline Mode' : 'Connected to Supabase'}
            </p>
          </div>
          <Link to="/" className="p-2 text-tk-text-secondary hover:text-tk-blue-deep" title="View Storefront">
            <Store className="h-5 w-5" />
          </Link>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-tk-blue-pale/50 border-b border-tk-border text-xs">
          <p className="text-tk-text-secondary">Logged in as:</p>
          <p className="font-bold text-tk-text-primary truncate">{userEmail}</p>
        </div>

        {/* Menu Links */}
        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-tk-input text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-tk-blue-deep text-white shadow-sm'
                    : 'text-tk-text-secondary hover:bg-tk-blue-light hover:text-tk-blue-deep'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Action */}
        <div className="p-4 border-t border-tk-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-tk-input text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Mock database pill alert */}
        {isMockMode && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-tk-input p-3 text-xs text-amber-800 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>
              <strong>Demo Mode:</strong> Any modifications you make will be saved locally in your browser's LocalStorage. To connect your real database, provide your Supabase credentials in the env configuration.
            </span>
          </div>
        )}
        
        <Outlet />
      </main>
    </div>
  );
};
