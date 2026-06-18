import React, { useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useSettingsStore();

  useEffect(() => {
    // Apply theme to document element
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
