import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ElevatedCard from './ElevatedCard';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  style?: StyleProp<ViewStyle>;
}

/**
 * StatCard - A specialized card for displaying statistics
 *
 * Features:
 * - Icon, label, value, and optional subtext
 * - Color variants for different states
 * - Centered layout with depth
 */
export default function StatCard({
  icon,
  label,
  value,
  subtext,
  variant = 'default',
  style,
}: StatCardProps) {
  const { theme } = useTheme();

  const getAccentColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary + '40';
      case 'success':
        return theme.colors.success + '40';
      case 'warning':
        return theme.colors.warning + '40';
      case 'error':
        return theme.colors.error + '40';
      default:
        return theme.colors.cardBorder;
    }
  };

  const accentColor = getAccentColor();
  const borderColor = getBorderColor();

  return (
    <ElevatedCard
      elevation="elevated"
      shadowLevel="medium"
      style={[
        styles.card,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          borderColor: borderColor,
          borderWidth: 2,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          {
            color: accentColor,
            marginTop: theme.spacing.xs,
          },
        ]}
      >
        {value}
      </Text>
      {subtext && (
        <Text
          style={[
            styles.subtext,
            {
              color: theme.colors.textTertiary,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {subtext}
        </Text>
      )}
    </ElevatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Vazirmatn_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: 'Vazirmatn_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  value: {
    fontFamily: 'Vazirmatn_700Bold',
    fontSize: 28,

    textAlign: 'center',
  },
});
