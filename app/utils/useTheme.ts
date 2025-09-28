import {useState, useEffect} from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    const initialTheme = stored || 'system';

    setTheme(initialTheme);

    if (initialTheme === 'system') {
      setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(initialTheme);
    }

    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add the resolved theme class
    root.classList.add(resolvedTheme);

    // Update localStorage
    localStorage.setItem('theme', theme);
  }, [theme, resolvedTheme, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, isInitialized]);

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);

    if (newTheme === 'system') {
      setResolvedTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(newTheme);
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeValue,
  };
}
