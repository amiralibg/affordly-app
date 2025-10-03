import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { DollarSign, Calendar, TrendingUp, Heart, X, Coins } from 'lucide-react-native';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  monthlySalary?: number;
}

interface TimeBreakdown {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function AddProductModal({ visible, onClose, monthlySalary }: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('');
  const [timeBreakdown, setTimeBreakdown] = useState<TimeBreakdown | null>(null);

  const calculateAccurateTime = (price: number, monthlySalary: number, customMonthlySavings?: number): TimeBreakdown | null => {
    // Determine the effective monthly savings
    const effectiveMonthlySavings = customMonthlySavings && customMonthlySavings > 0
      ? customMonthlySavings
      : monthlySalary;

    if (effectiveMonthlySavings <= 0) return null;

    // Calculate daily income rate (monthly salary / 30 days)
    const dailyIncome = effectiveMonthlySavings / 30;

    // Calculate total days needed
    const totalDays = price / dailyIncome;

    // Convert to seconds for precise breakdown
    const totalSeconds = totalDays * 24 * 60 * 60;

    // Break down into time units
    const years = Math.floor(totalSeconds / (365 * 24 * 60 * 60));
    const remainingAfterYears = totalSeconds % (365 * 24 * 60 * 60);

    const months = Math.floor(remainingAfterYears / (30 * 24 * 60 * 60));
    const remainingAfterMonths = remainingAfterYears % (30 * 24 * 60 * 60);

    const days = Math.floor(remainingAfterMonths / (24 * 60 * 60));
    const remainingAfterDays = remainingAfterMonths % (24 * 60 * 60);

    const hours = Math.floor(remainingAfterDays / (60 * 60));
    const remainingAfterHours = remainingAfterDays % (60 * 60);

    const minutes = Math.floor(remainingAfterHours / 60);
    const seconds = Math.floor(remainingAfterHours % 60);

    return { years, months, days, hours, minutes, seconds };
  };

  const formatTimeBreakdown = (breakdown: TimeBreakdown): string => {
    // Check if it's instant (can buy now)
    const totalTime = breakdown.years + breakdown.months + breakdown.days + breakdown.hours + breakdown.minutes + breakdown.seconds;
    if (totalTime === 0) {
      return t('calculate.canBuyNow');
    }

    const parts: string[] = [];

    // Add years if present
    if (breakdown.years > 0) {
      parts.push(`${breakdown.years} ${breakdown.years === 1 ? t('time.year') : t('time.years')}`);
    }

    // Add months if present
    if (breakdown.months > 0) {
      parts.push(`${breakdown.months} ${breakdown.months === 1 ? t('time.month') : t('time.months')}`);
    }

    // Add days if present
    if (breakdown.days > 0) {
      parts.push(`${breakdown.days} ${breakdown.days === 1 ? t('time.day') : t('time.days')}`);
    }

    // Always show finer granularity if no years
    if (breakdown.years === 0) {
      // Show hours if less than a month or if there are days
      if (breakdown.hours > 0 && breakdown.months === 0) {
        parts.push(`${breakdown.hours} ${breakdown.hours === 1 ? t('time.hour') : t('time.hours')}`);
      }

      // Show minutes if less than a day
      if (breakdown.minutes > 0 && breakdown.months === 0 && breakdown.days === 0) {
        parts.push(`${breakdown.minutes} ${breakdown.minutes === 1 ? t('time.minute') : t('time.minutes')}`);
      }

      // Show seconds only if less than an hour
      if (breakdown.seconds > 0 && breakdown.months === 0 && breakdown.days === 0 && breakdown.hours === 0) {
        parts.push(`${breakdown.seconds} ${breakdown.seconds === 1 ? t('time.second') : t('time.seconds')}`);
      }
    }

    return parts.length > 0 ? parts.join(' ') : `0 ${t('time.seconds')}`;
  };

  const handleAddProduct = async (addToWishlist: boolean) => {
    if (!productName || !productPrice) {
      Alert.alert(t('common.error'), t('calculate.enterProductAndPrice'));
      return;
    }

    const price = parseFloat(productPrice);
    const savings = monthlySavings ? parseFloat(monthlySavings) : (monthlySalary || 0);

    if (isNaN(price) || price <= 0) {
      Alert.alert(t('common.error'), t('calculate.enterValidPrice'));
      return;
    }

    if (savings <= 0) {
      Alert.alert(t('common.error'), t('calculate.savingsMustBePositive'));
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: productName,
        price,
        monthlySavings: savings,
        isWishlisted: addToWishlist,
        savedAmount: 0,
      });

      Alert.alert(
        t('common.success'),
        addToWishlist
          ? t('wishlist.savingsUpdated')
          : t('calculate.skipAndSave')
      );
      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add product';
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
    setMonthlySavings('');
    setTimeBreakdown(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleMonthlySavingsChange = (text: string) => {
    setMonthlySavings(text);
    recalculateTime(productPrice, text);
  };

  const handlePriceChange = (text: string) => {
    setProductPrice(text);
    recalculateTime(text, monthlySavings);
  };

  const recalculateTime = (priceText: string, savingsText: string) => {
    if (priceText && monthlySalary) {
      const price = parseFloat(priceText);
      const customSavings = savingsText ? parseFloat(savingsText) : undefined;

      if (!isNaN(price) && price >= 0) {
        const breakdown = calculateAccurateTime(price, monthlySalary, customSavings);
        setTimeBreakdown(breakdown);
      } else {
        setTimeBreakdown(null);
      }
    } else {
      setTimeBreakdown(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('calculate.newProduct')}</Text>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('calculate.productName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.cardBorder }]}
              placeholder={t('calculate.productNamePlaceholder')}
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>{t('calculate.price')}</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <Coins size={20} color={theme.colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={[styles.inputWithIconText, { color: theme.colors.text }]}
                placeholder="0"
                value={productPrice}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('calculate.monthlySavings')} <Text style={[styles.labelOptional, { color: theme.colors.textTertiary }]}>{t('calculate.monthlySavingsOptional')}</Text>
            </Text>
            <Text style={[styles.labelDescription, { color: theme.colors.textSecondary }]}>
              {t('calculate.monthlySavingsDescription')}
            </Text>
            <View style={[styles.inputWithIcon, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
              <TrendingUp size={20} color={theme.colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={[styles.inputWithIconText, { color: theme.colors.text }]}
                placeholder={monthlySalary ? `${t('calculate.defaultAmount', { amount: formatAmount(monthlySalary) })}` : "0"}
                value={monthlySavings}
                onChangeText={handleMonthlySavingsChange}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          {monthlySalary && parseFloat(monthlySavings) > monthlySalary && (
            <Text style={[styles.warningText, { color: theme.colors.warning }]}>
              {t('calculate.savingsExceedsSalary')}
            </Text>
          )}

          {timeBreakdown !== null && (
            <View style={[styles.resultCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.primary }]}>
              <Calendar size={32} color={theme.colors.primary} strokeWidth={2} />
              <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>{t('calculate.timeToSave')}</Text>
              <Text style={[styles.resultValue, { color: theme.colors.primaryLight }]}>
                {formatTimeBreakdown(timeBreakdown)}
              </Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.wishlistButton, { backgroundColor: theme.colors.primary }, !timeBreakdown && styles.buttonDisabled]}
              onPress={() => handleAddProduct(true)}
              disabled={!timeBreakdown}
            >
              <Heart size={20} color={theme.colors.background} strokeWidth={2} />
              <Text style={[styles.wishlistButtonText, { color: theme.colors.background }]}>{t('calculate.addToWishlist')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }, !timeBreakdown && styles.buttonDisabled]}
              onPress={() => handleAddProduct(false)}
              disabled={!timeBreakdown}
            >
              <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>{t('calculate.skipAndSave')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.helpText, { color: theme.colors.textTertiary }]}>
            {t('calculate.addToWishlistHelp')}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelOptional: {
    fontSize: 14,
    fontWeight: '400',
  },
  labelDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  resultLabel: {
    fontSize: 14,
    marginTop: 12,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  wishlistButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
