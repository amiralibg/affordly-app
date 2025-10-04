import { useTranslation } from 'react-i18next';
import { TextStyle } from 'react-native';
import { TYPOGRAPHY } from '@/contexts/ThemeContext';

export const useLocalizedFont = (weight?: 'regular' | 'bold'): TextStyle => {
  const { i18n } = useTranslation();

  if (i18n.language === 'fa') {
    return {
      fontFamily: weight === 'bold'
        ? TYPOGRAPHY.families.persianBold
        : TYPOGRAPHY.families.persian,
    };
  }

  return {
    fontFamily: weight === 'bold'
      ? TYPOGRAPHY.families.defaultBold
      : TYPOGRAPHY.families.default,
  };
};
