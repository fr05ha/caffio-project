import { useEffect } from 'react';
import { Cafe } from '../services/api';

export function useTheme(cafe: Cafe | null) {
  useEffect(() => {
    if (!cafe) {
      // Reset to default theme
      document.documentElement.style.setProperty('--primary-color', '#f59e0b');
      document.documentElement.style.setProperty('--secondary-color', '#d97706');
      document.documentElement.style.setProperty('--accent-color', '#fbbf24');
      return;
    }

    // Apply cafe theme colors
    const primary = cafe.primaryColor || '#f59e0b';
    const secondary = cafe.secondaryColor || '#d97706';
    const accent = cafe.accentColor || '#fbbf24';

    document.documentElement.style.setProperty('--primary-color', primary);
    document.documentElement.style.setProperty('--secondary-color', secondary);
    document.documentElement.style.setProperty('--accent-color', accent);

    // Add theme class to body for additional styling
    document.body.className = `theme-${cafe.theme || 'amber'}`;
  }, [cafe]);
}

