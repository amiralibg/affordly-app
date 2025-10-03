import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design token system - Single source of truth for spacing, typography, and radius
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export interface Theme {
  colors: {
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    primary: string;
    primaryLight: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    card: string;
    cardBorder: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  radius: typeof RADIUS;
  isDark: boolean;
}

const darkTheme: Theme = {
  colors: {
    // Deep, rich backgrounds - strong contrast
    background: '#0a0512',
    backgroundSecondary: '#150d24',
    backgroundTertiary: '#221838',

    // Vibrant purples - less pastel, more saturated
    primary: '#a78bfa',
    primaryLight: '#c4b5fd',

    // High contrast text hierarchy
    text: '#ffffff',
    textSecondary: '#d4c5f9',
    textTertiary: '#a78bfa',

    // Defined borders
    border: '#2d1f47',

    // Cards stand out from background
    card: '#1a1129',
    cardBorder: '#2d1f4750',

    // Vibrant status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  isDark: true,
};

const lightTheme: Theme = {
  colors: {
    // Clean, bright backgrounds
    background: '#fafafa',
    backgroundSecondary: '#f5f3ff',
    backgroundTertiary: '#ede9fe',

    // Rich, saturated purple
    primary: '#7c3aed',
    primaryLight: '#a78bfa',

    // Strong text contrast
    text: '#0a0512',
    textSecondary: '#4c1d95',
    textTertiary: '#7c3aed',

    // Clear borders
    border: '#e9d5ff',

    // Crisp white cards
    card: '#ffffff',
    cardBorder: '#e9d5ff60',

    // Vibrant status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  isDark: false,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@affordly_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true); // Default to dark theme

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        newTheme ? 'dark' : 'light'
      );
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
