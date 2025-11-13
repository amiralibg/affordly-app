import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Coins, Heart, X, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { useProfile } from '@/lib/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/lib/toast';
import { formatGoldWeight } from '@/lib/utils/goldUnits';
import GlassInput from './ui/GlassInput';
import DepthButton from './ui/DepthButton';
import StatCard from './ui/StatCard';
import { TEXT, formatNumber } from '@/constants/text';
import { persianToEnglish, englishToPersian } from '@/utils/numbers';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  goldPrice?: number;
}

export default function AddProductModal({ visible, onClose, goldPrice }: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const { data: profile } = useProfile();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  // Memoized styles for dynamic theming and RTL support
  const keyboardAvoidingViewStyle = useMemo(() => ({ flex: 1 }), []);

  const modalContainerStyle = useMemo(
    () => ({ backgroundColor: theme.colors.background }),
    [theme.colors.background]
  );

  const modalHeaderStyle = useMemo(
    () => ({
      borderBottomColor: theme.colors.border,
      flexDirection: 'row-reverse' as const,
    }),
    [theme.colors.border]
  );

  const modalHeaderSafeAreaStyle = useMemo(
    () => ({ paddingTop: (insets.top || 0) + 24 }),
    [insets.top]
  );

  const modalTitleStyle = useMemo(() => ({ color: theme.colors.text }), [theme.colors.text]);

  const handlePriceChange = (text: string) => {
    // Convert Persian/Arabic digits to English digits
    const converted = persianToEnglish(text);

    // Remove all non-digit characters (keep only English digits)
    const cleanedText = converted.replace(/[^\d]/g, '');

    if (cleanedText === '') {
      setProductPrice('');
      return;
    }

    // Format with commas (using English format)
    const formatted = new Intl.NumberFormat('en-US').format(parseInt(cleanedText));

    // Convert to Persian digits for display
    const persianFormatted = englishToPersian(formatted);
    setProductPrice(persianFormatted);
  };

  const getPriceValue = useCallback((): number => {
    // Convert Persian digits to English, remove commas and parse to number
    const englishPrice = persianToEnglish(productPrice);
    const cleanedPrice = englishPrice.replace(/,/g, '');
    return parseInt(cleanedPrice) || 0;
  }, [productPrice]);

  const goldEquivalent = productPrice && goldPrice ? getPriceValue() / goldPrice : 0;

  const goldWeightFormatted = goldEquivalent > 0 ? formatGoldWeight(goldEquivalent) : null;

  // Calculate timeline estimate
  const timelineEstimate = useMemo(() => {
    if (!profile || !goldPrice || !productPrice || goldEquivalent <= 0) {
      return null;
    }

    const salary = profile.monthlySalary;
    const savingsPercentage = profile.monthlySavingsPercentage;

    if (salary <= 0 || savingsPercentage <= 0) {
      return null;
    }

    const price = getPriceValue();
    const monthlySavings = (salary * savingsPercentage) / 100;
    const monthsToSave = price / monthlySavings;

    const years = Math.floor(monthsToSave / 12);
    const months = Math.floor(monthsToSave % 12);

    let timelineText = '';
    if (monthsToSave === 0) {
      timelineText = TEXT.timeline.goalReached;
    } else if (years > 0) {
      timelineText = TEXT.timeline.yearsToSave(years, months);
    } else if (months > 0) {
      timelineText = TEXT.timeline.monthsToSave(months);
    } else {
      const days = Math.ceil(monthsToSave * 30);
      timelineText = TEXT.timeline.daysToSave(days);
    }

    return {
      monthsToSave,
      monthlySavings,
      timelineText,
    };
  }, [profile, goldPrice, productPrice, goldEquivalent, getPriceValue]);

  const handleAddProduct = async (addToWishlist: boolean) => {
    // eslint-disable-next-line no-console
    console.log('handleAddProduct called with addToWishlist:', addToWishlist);

    if (!productName || !productPrice) {
      // eslint-disable-next-line no-console
      console.log('Validation failed: missing name or price');
      showToast.error(TEXT.common.error, TEXT.calculate.enterProductAndPrice);
      return;
    }

    const price = getPriceValue();
    // eslint-disable-next-line no-console
    console.log('Product price:', price);

    if (isNaN(price) || price <= 0) {
      // eslint-disable-next-line no-console
      console.log('Validation failed: invalid price');
      showToast.error(TEXT.common.error, TEXT.calculate.enterValidPrice);
      return;
    }

    // eslint-disable-next-line no-console
    console.log('Sending product data:', {
      name: productName,
      price,
      isWishlisted: addToWishlist,
      savedGoldAmount: 0,
    });

    try {
      const result = await createProduct.mutateAsync({
        name: productName,
        price,
        isWishlisted: addToWishlist,
        savedGoldAmount: 0,
      });

      // eslint-disable-next-line no-console
      console.log('Product created successfully:', result);

      showToast.success(
        TEXT.calculate.productAdded,
        addToWishlist ? TEXT.calculate.addedToWishlist : TEXT.calculate.productSaved
      );
      resetForm();
      onClose();
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('CreateProduct error:', error);
      // eslint-disable-next-line no-console
      console.error(
        'Error response:',
        (error as { response?: { data?: unknown } })?.response?.data
      );
      // eslint-disable-next-line no-console
      console.error(
        'Error status:',
        (error as { response?: { status?: unknown } })?.response?.status
      );

      const errorMessage =
        (error as { response?: { data?: { error?: string }; message?: string } })?.response?.data
          ?.error ||
        (error as { message?: string })?.message ||
        TEXT.calculate.addProductError;
      showToast.error(TEXT.common.error, errorMessage);
    }
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={keyboardAvoidingViewStyle}
      >
        <View style={[styles.modalContainer, modalContainerStyle]}>
          <View style={[styles.modalHeader, modalHeaderStyle, modalHeaderSafeAreaStyle]}>
            <Text style={[styles.modalTitle, modalTitleStyle]}>{TEXT.calculate.newProduct}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                {TEXT.calculate.productName}
              </Text>
              <GlassInput
                placeholder={TEXT.calculate.productNamePlaceholder}
                value={productName}
                onChangeText={setProductName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                {TEXT.calculate.price}
              </Text>
              <GlassInput
                icon={<Coins size={20} color={theme.colors.textSecondary} strokeWidth={2.5} />}
                placeholder="0"
                value={productPrice}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
              />
            </View>

            {goldWeightFormatted && (
              <StatCard
                icon={<Coins size={36} color={theme.colors.primary} strokeWidth={2.5} />}
                label={TEXT.calculate.goldEquivalent}
                value={`${formatNumber(goldWeightFormatted.primary.value)} ${goldWeightFormatted.primary.unit}`}
                subtext={
                  goldWeightFormatted.secondary
                    ? `(${englishToPersian(goldWeightFormatted.secondary.value.toFixed(3))} ${goldWeightFormatted.secondary.unit})`
                    : undefined
                }
                variant="primary"
                style={{ marginBottom: theme.spacing.md }}
              />
            )}

            {/* Timeline Estimate */}
            {timelineEstimate && (
              <StatCard
                icon={<Clock size={32} color={theme.colors.success} strokeWidth={2.5} />}
                label={TEXT.timeline.canBuy}
                value={timelineEstimate.timelineText}
                subtext={`${formatNumber(timelineEstimate.monthlySavings)} ${TEXT.wishlist.toman} / ${TEXT.common.month}`}
                variant="success"
                style={{ marginBottom: theme.spacing.md }}
              />
            )}

            <View style={styles.buttonGroup}>
              <DepthButton
                onPress={() => handleAddProduct(true)}
                disabled={goldEquivalent <= 0}
                variant="primary"
                size="large"
                icon={
                  <Heart size={20} color={theme.isDark ? '#0A0A0A' : '#FFFFFF'} strokeWidth={2.5} />
                }
                iconPosition="right"
              >
                {TEXT.calculate.addToWishlist}
              </DepthButton>

              <DepthButton
                onPress={() => handleAddProduct(false)}
                disabled={goldEquivalent <= 0}
                variant="outline"
                size="large"
              >
                {TEXT.calculate.saveWithoutWishlist}
              </DepthButton>
            </View>

            <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
              {TEXT.calculate.wishlistHelp}
            </Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  helpText: {
    fontFamily: 'Vazirmatn_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Vazirmatn_400Regular',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 24,
  },
  modalTitle: {
    fontFamily: 'Vazirmatn_700Bold',
    fontSize: 24,
  },
});
