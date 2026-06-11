import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Search, PhoneCall } from 'lucide-react';

interface BottomNavProps {
  onSearchOpen: () => void;
  onExploreOpen: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onSearchOpen, onExploreOpen }) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-tk-border h-[60px] pb-safe flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
            isActive ? 'text-tk-blue-deep' : 'text-tk-text-secondary hover:text-tk-blue-mid'
          }`
        }
        id="btn-nav-home"
      >
        <Home className="h-5 w-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      {/* Explore (Trigger menu drawer or categories view) */}
      <button
        onClick={onExploreOpen}
        className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-tk-text-secondary hover:text-tk-blue-mid transition-colors"
        id="btn-nav-explore"
      >
        <Compass className="h-5 w-5 mb-0.5" />
        <span>Explore</span>
      </button>

      {/* Search */}
      <button
        onClick={onSearchOpen}
        className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-tk-text-secondary hover:text-tk-blue-mid transition-colors"
        id="btn-nav-search"
      >
        <Search className="h-5 w-5 mb-0.5" />
        <span>Search</span>
      </button>

      {/* Contact */}
      <NavLink
        to="/contact"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
            isActive ? 'text-tk-blue-deep' : 'text-tk-text-secondary hover:text-tk-blue-mid'
          }`
        }
        id="btn-nav-contact"
      >
        <PhoneCall className="h-5 w-5 mb-0.5" />
        <span>Contact</span>
      </NavLink>
    </nav>
  );
};
