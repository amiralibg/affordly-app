import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DepthButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * DepthButton - A button component with depth and elevation
 *
 * Variants:
 * - primary: Solid background with primary color + glow shadow
 * - secondary: Lighter background with subtle shadow
 * - outline: Border only with hover effect
 * - ghost: No background, text only
 */
export default function DepthButton({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: DepthButtonProps) {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) {
      return variant === 'ghost' ? 'transparent' : theme.colors.cardBorder;
    }

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.cardElevated;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return theme.colors.textTertiary;
    }

    switch (variant) {
      case 'primary':
        return theme.isDark ? '#0A0A0A' : '#FFFFFF';
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getShadow = () => {
    if (disabled || variant === 'ghost') {
      return theme.shadows.none;
    }

    if (variant === 'primary') {
      return theme.shadows.glow(theme.colors.primary);
    }

    return theme.shadows.small;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 28 };
      case 'medium':
      default:
        return { paddingVertical: 14, paddingHorizontal: 22 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      case 'medium':
      default:
        return 16;
    }
  };

  const borderStyle =
    variant === 'outline'
      ? {
          borderWidth: 2,
          borderColor: disabled
            ? theme.colors.cardBorder
            : (style as ViewStyle)?.borderColor || theme.colors.primary,
        }
      : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.radius.lg,
          ...getPadding(),
        },
        getShadow(),
        borderStyle,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontFamily: 'Vazirmatn_700Bold',
  },
});
