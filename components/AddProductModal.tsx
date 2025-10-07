import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Coins, Heart, X } from 'lucide-react-native';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  goldPrice?: number;
}

export default function AddProductModal({ visible, onClose, goldPrice }: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const fontRegular = useLocalizedFont('regular');
  const fontBold = useLocalizedFont('bold');
  const isRTL = i18n.language === 'fa';

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const formatNumber = (num: number) => {
    const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(locale).format(Math.round(num));
  };

  const handlePriceChange = (text: string) => {
    // Convert Persian/Arabic digits to English digits
    const persianToEnglish = (str: string) => {
      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
      const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
      const englishDigits = '0123456789';

      return str.split('').map(char => {
        const persianIndex = persianDigits.indexOf(char);
        const arabicIndex = arabicDigits.indexOf(char);

        if (persianIndex !== -1) return englishDigits[persianIndex];
        if (arabicIndex !== -1) return englishDigits[arabicIndex];
        return char;
      }).join('');
    };

    // Convert to English digits first
    const converted = persianToEnglish(text);

    // Remove all non-digit characters (keep only English digits)
    const cleanedText = converted.replace(/[^\d]/g, '');

    if (cleanedText === '') {
      setProductPrice('');
      return;
    }

    // Format with commas (using English format)
    const formatted = new Intl.NumberFormat('en-US').format(parseInt(cleanedText));
    setProductPrice(formatted);
  };

  const getPriceValue = (): number => {
    // Remove commas and parse to number (already in English digits)
    const cleanedPrice = productPrice.replace(/,/g, '');
    return parseInt(cleanedPrice) || 0;
  };

  const goldEquivalent = productPrice && goldPrice
    ? getPriceValue() / goldPrice
    : 0;

  const handleAddProduct = async (addToWishlist: boolean) => {
    if (!productName || !productPrice) {
      showToast.error(t('common.error'), t('calculate.enterProductAndPrice'));
      return;
    }

    const price = getPriceValue();

    if (isNaN(price) || price <= 0) {
      showToast.error(t('common.error'), t('calculate.enterValidPrice'));
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: productName,
        price,
        isWishlisted: addToWishlist,
        savedGoldAmount: 0,
      });

      showToast.success(
        t('calculate.productAdded'),
        addToWishlist
          ? t('calculate.addedToWishlist')
          : t('calculate.productSaved')
      );
      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('calculate.addProductError');
      showToast.error(t('common.error'), errorMessage);
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
      <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, fontBold, { color: theme.colors.text }]}>{t('calculate.newProduct')}</Text>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, fontBold, { color: theme.colors.text, textAlign: 'left' }]}>{t('calculate.productName')}</Text>
            <TextInput
              style={[styles.input, fontRegular, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, color: theme.colors.text, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('calculate.productNamePlaceholder')}
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, fontBold, { color: theme.colors.text, textAlign: 'left' }]}>{t('calculate.price')}</Text>
            <View style={[styles.inputWithIcon, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Coins size={20} color={theme.colors.textSecondary} strokeWidth={2} />
              <TextInput
                style={[styles.inputWithIconText, fontRegular, { color: theme.colors.text, textAlign: isRTL ? 'right' : 'left', marginRight: isRTL ? 8 : 0, marginLeft: isRTL ? 0 : 8 }]}
                placeholder="0"
                value={productPrice}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textTertiary}
              />
            </View>
          </View>

          {goldEquivalent > 0 && (
            <View style={[styles.resultCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.primary }]}>
              <Coins size={32} color={theme.colors.primary} strokeWidth={2} />
              <Text style={[styles.resultLabel, fontRegular, { color: theme.colors.textTertiary }]}>{t('calculate.goldEquivalent')}</Text>
              <Text style={[styles.resultValue, fontBold, { color: theme.colors.primary }]}>
                {formatNumber(goldEquivalent * 1000)} {t('calculate.milligrams')}
              </Text>
              <Text style={[styles.resultSubtext, fontRegular, { color: theme.colors.textTertiary }]}>
                ({goldEquivalent.toFixed(3)} {t('calculate.grams18K')})
              </Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.wishlistButton, { backgroundColor: theme.colors.primary, flexDirection: isRTL ? 'row-reverse' : 'row' }, goldEquivalent <= 0 && styles.buttonDisabled]}
              onPress={() => handleAddProduct(true)}
              disabled={goldEquivalent <= 0}
            >
              <Heart size={20} color={theme.colors.background} strokeWidth={2} />
              <Text style={[styles.wishlistButtonText, fontBold, { color: theme.colors.background, marginRight: isRTL ? 8 : 0, marginLeft: isRTL ? 0 : 8 }]}>{t('calculate.addToWishlist')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }, goldEquivalent <= 0 && styles.buttonDisabled]}
              onPress={() => handleAddProduct(false)}
              disabled={goldEquivalent <= 0}
            >
              <Text style={[styles.skipButtonText, fontBold, { color: theme.colors.textSecondary }]}>{t('calculate.saveWithoutWishlist')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.helpText, fontRegular, { color: theme.colors.textSecondary }]}>
            {t('calculate.wishlistHelp')}
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
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputWithIcon: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
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
  resultSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  wishlistButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
