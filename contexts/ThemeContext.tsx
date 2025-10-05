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
  families: {
    default: 'Poppins_400Regular' as const,
    defaultBold: 'Poppins_700Bold' as const,
    persian: 'Vazirmatn_400Regular' as const,
    persianBold: 'Vazirmatn_700Bold' as const,
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
    // Deep, elegant dark backgrounds with warm undertone
    background: '#0C0A09', // near-black with subtle brown warmth
    backgroundSecondary: '#1A1411', // slightly lighter, cozy layer
    backgroundTertiary: '#2B201B', // warm neutral for surfaces

    // Refined gold primary accents
    primary: '#E6B422', // elegant muted gold
    primaryLight: '#F2CC85', // soft highlight gold

    // High-contrast text
    text: '#F9FAFB', // near white
    textSecondary: '#D1BFA4', // soft warm beige text
    textTertiary: '#E6B422', // gold accent text

    // Borders
    border: '#3C2E25',

    // Cards and overlays
    card: '#14100E',
    cardBorder: '#3C2E2555',

    // Status colors (unchanged)
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  isDark: true,
};

const lightTheme: Theme = {
  colors: {
    // Soft neutral backgrounds with warmth
    background: '#FAFAF9', // clean off-white
    backgroundSecondary: '#F9F5EC', // soft cream
    backgroundTertiary: '#F5EAD3', // subtle golden tone

    // Gold primary colors
    primary: '#E6B422', // same refined gold as dark mode
    primaryLight: '#F2CC85',

    // Strong text hierarchy
    text: '#1C1917', // deep neutral brownish-black
    textSecondary: '#6B5E50', // soft warm gray-brown
    textTertiary: '#A67C2E', // elegant muted gold text

    // Clear borders and surfaces
    border: '#E4E4E7',
    card: '#FFFFFF',
    cardBorder: '#E4E4E7',

    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
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
