import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassInputProps extends TextInputProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * GlassInput - A depth-aware input component
 *
 * Features:
 * - Elevated background with subtle border
 * - Icon support (left or right)
 * - Consistent with depth design system
 */
export default function GlassInput({
  icon,
  iconPosition = 'left',
  containerStyle,
  style,
  ...textInputProps
}: GlassInputProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardElevated,
          borderColor: theme.colors.cardBorder,
          borderRadius: theme.radius.md,
        },
        theme.shadows.small,
        containerStyle,
      ]}
    >
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      <TextInput
        {...textInputProps}
        style={[
          styles.input,
          {
            color: theme.colors.text,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textTertiary}
      />
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconLeft: {
    marginRight: 12,
  },
  iconRight: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Vazirmatn_400Regular',
    fontSize: 16,
    textAlign: 'right',
  },
});
