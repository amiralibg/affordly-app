import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// Shadow system for depth
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;

export interface Theme {
  colors: {
    // Background layers (darkest to lightest)
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    backgroundQuaternary: string;

    // Primary color variations (for depth)
    primary: string;
    primaryLight: string;
    primaryLighter: string;
    primaryDark: string;

    // Text hierarchy
    text: string;
    textSecondary: string;
    textTertiary: string;

    // Card/Surface layers
    card: string;
    cardElevated: string;
    cardHighlight: string;
    cardBorder: string;

    // Border variations
    border: string;
    borderLight: string;

    // Status colors
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;

    // Overlay and glass effects
    overlay: string;
    glass: string;
  };
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
  isDark: boolean;
}

const darkTheme: Theme = {
  colors: {
    // Background layers (darkest to lightest for depth)
    background: '#0A0A0A', // deepest dark (base layer)
    backgroundSecondary: '#141414', // second layer
    backgroundTertiary: '#1F1F1F', // third layer (cards)
    backgroundQuaternary: '#2A2A2A', // elevated elements

    // Primary gold with depth variations
    primary: '#D4AF36', // main gold (pure gold color)
    primaryLight: '#E8C96E', // lighter gold (hover/active)
    primaryLighter: '#F5E5B8', // lightest gold (highlights)
    primaryDark: '#B8962D', // darker gold (pressed states)

    // Text hierarchy (lighter = higher importance)
    text: '#FAFAFA', // pure white (primary text)
    textSecondary: '#A3A3A3', // neutral gray (secondary)
    textTertiary: '#737373', // muted gray (tertiary)

    // Card/Surface layers (lighter colors = elevated surfaces)
    card: '#1A1A1A', // base card
    cardElevated: '#252525', // elevated card
    cardHighlight: '#2F2F2F', // highlighted/active card
    cardBorder: '#333333',

    // Borders (lighter for emphasis)
    border: '#2A2A2A',
    borderLight: '#404040',

    // Status colors with light variations
    success: '#10B981',
    successLight: '#10B98126',
    warning: '#F59E0B',
    warningLight: '#F59E0B26',
    error: '#EF4444',
    errorLight: '#EF444426',

    // Overlay and glass effects
    overlay: '#00000080',
    glass: '#1A1A1ACC',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  shadows: SHADOWS,
  isDark: true,
};

const lightTheme: Theme = {
  colors: {
    // Background layers (darkest to lightest for depth)
    background: '#F5F5F5', // base gray (deepest layer)
    backgroundSecondary: '#FAFAFA', // second layer
    backgroundTertiary: '#FFFFFF', // third layer (cards - lighter on top!)
    backgroundQuaternary: '#FFFFFF', // elevated elements (pure white)

    // Primary gold with depth variations
    primary: '#D4AF36', // main gold (pure gold color)
    primaryLight: '#E8C96E', // lighter gold (hover/active)
    primaryLighter: '#F5E5B8', // lightest gold (highlights)
    primaryDark: '#B8962D', // darker gold (pressed states)

    // Text hierarchy (darker = higher importance in light mode)
    text: '#0A0A0A', // near black (primary text)
    textSecondary: '#525252', // dark gray (secondary)
    textTertiary: '#737373', // muted gray (tertiary)

    // Card/Surface layers (lighter = elevated in light mode)
    card: '#FFFFFF', // base card (lightest)
    cardElevated: '#FFFFFF', // elevated card
    cardHighlight: '#FFF8F0', // highlighted/active card (warm tint)
    cardBorder: '#E5E5E5',

    // Borders (darker for definition)
    border: '#E5E5E5',
    borderLight: '#F0F0F0',

    // Status colors with light variations
    success: '#10B981',
    successLight: '#10B98126',
    warning: '#F59E0B',
    warningLight: '#F59E0B26',
    error: '#EF4444',
    errorLight: '#EF444426',

    // Overlay and glass effects
    overlay: '#00000040',
    glass: '#FFFFFFCC',
  },
  spacing: SPACING,
  typography: TYPOGRAPHY,
  radius: RADIUS,
  shadows: SHADOWS,
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
    void loadTheme();
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
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
