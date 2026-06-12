import React, { createContext, useContext, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('tk_theme') as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const setTheme = (
    newTheme: Theme,
    event?: React.MouseEvent | MouseEvent | { clientX: number; clientY: number }
  ) => {
    if (newTheme === theme) return;

    const isSupported = typeof document !== 'undefined' && 'startViewTransition' in document;
    if (!isSupported) {
      setThemeState(newTheme);
      localStorage.setItem('tk_theme', newTheme);
      return;
    }

    // Capture click coordinates, falling back to center of the viewport
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    if (event) {
      x = event.clientX;
      y = event.clientY;
    }

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setThemeState(newTheme);
        localStorage.setItem('tk_theme', newTheme);
        
        // Also update resolved theme synchronously
        let activeTheme: 'light' | 'dark' = 'light';
        if (newTheme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          activeTheme = systemPrefersDark ? 'dark' : 'light';
        } else {
          activeTheme = newTheme;
        }
        setResolvedTheme(activeTheme);
        
        // Manually toggle root class to capture the correct snapshot state immediately
        const root = window.document.documentElement;
        if (activeTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      });
    });

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    transition.ready.then(() => {
      document.documentElement.animate(
        [
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${endRadius}px at ${x}px ${y}px)` }
        ],
        {
          duration: 550,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      let activeTheme: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = systemPrefersDark ? 'dark' : 'light';
      } else {
        activeTheme = theme;
      }

      setResolvedTheme(activeTheme);

      if (activeTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
