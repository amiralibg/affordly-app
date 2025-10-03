import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfile, useUpdateProfile } from '@/lib/hooks/useProfile';
import { DollarSign, LogOut, Moon, Sun, Languages, Coins } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useCurrency, CURRENCIES } from '@/contexts/CurrencyContext';
import { changeLanguage } from '@/i18n';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { theme, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { currency, setCurrency, formatAmount } = useCurrency();

  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [salary, setSalary] = useState('0');
  const isRTL = i18n.language === 'fa';

  useEffect(() => {
    if (profile) {
      setSalary(profile.monthlySalary.toString());
    }
  }, [profile]);

  const handleSaveSalary = async () => {
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      Alert.alert(t('common.error'), t('profile.enterValidSalary'));
      return;
    }

    try {
      await updateProfile.mutateAsync({ monthlySalary: salaryNum });
      Alert.alert(t('common.success'), t('profile.salaryUpdated'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update salary';
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    // Note: App needs restart for full RTL effect
    Alert.alert(
      t('common.success'),
      'Language changed. Please restart the app for full effect.',
      [{ text: 'OK' }]
    );
  };

  const handleCurrencyChange = async (curr: 'USD' | 'IRR') => {
    await setCurrency(curr);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('profile.title')}</Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.language')}</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {t('profile.languageDescription')}
        </Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: i18n.language === 'en' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleLanguageChange('en')}
          >
            <Languages size={20} color={i18n.language === 'en' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: i18n.language === 'en' ? theme.colors.background : theme.colors.text }
            ]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: i18n.language === 'fa' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleLanguageChange('fa')}
          >
            <Languages size={20} color={i18n.language === 'fa' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: i18n.language === 'fa' ? theme.colors.background : theme.colors.text }
            ]}>
              فارسی
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Currency Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.currency')}</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {t('profile.currencyDescription')}
        </Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: currency === 'USD' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleCurrencyChange('USD')}
          >
            <Coins size={20} color={currency === 'USD' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: currency === 'USD' ? theme.colors.background : theme.colors.text }
            ]}>
              {isRTL ? CURRENCIES.USD.nameFa : CURRENCIES.USD.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: currency === 'IRR' ? theme.colors.primary : theme.colors.card,
                borderColor: theme.colors.cardBorder
              }
            ]}
            onPress={() => handleCurrencyChange('IRR')}
          >
            <Coins size={20} color={currency === 'IRR' ? theme.colors.background : theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[
              styles.optionText,
              { color: currency === 'IRR' ? theme.colors.background : theme.colors.text }
            ]}>
              {isRTL ? CURRENCIES.IRR.nameFa : CURRENCIES.IRR.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.theme')}</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {t('profile.themeDescription')}
        </Text>

        <View style={[styles.themeContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          {isDark ? (
            <Moon size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          ) : (
            <Sun size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          )}
          <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
            {isDark ? t('profile.darkMode') : t('profile.lightMode')}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
            thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Monthly Salary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.monthlySalary')}</Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {t('profile.monthlySalaryDescription')}
        </Text>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
          <DollarSign size={20} color={theme.colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="0"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSaveSalary}
        >
          <Text style={[styles.buttonText, { color: theme.colors.background }]}>{t('profile.saveSalary')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.signOutButton, { borderColor: theme.colors.error }]} onPress={handleSignOut}>
        <LogOut size={20} color={theme.colors.error} strokeWidth={2} />
        <Text style={[styles.signOutText, { color: theme.colors.error }]}>{t('profile.signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
