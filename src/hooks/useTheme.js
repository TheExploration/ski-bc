import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    try {
      // Check localStorage first
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
        }
      }
    } catch (error) {
      console.warn('Error accessing localStorage or matchMedia:', error);
    }
    setIsInitialized(true);
  }, []);

  // Update DOM and localStorage when theme changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }, [theme, isInitialized]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };
}