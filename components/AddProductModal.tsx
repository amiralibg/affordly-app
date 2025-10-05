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
import { Coins, Heart, X } from 'lucide-react-native';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { useTheme } from '@/contexts/ThemeContext';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  goldPrice?: number;
}

export default function AddProductModal({ visible, onClose, goldPrice }: AddProductModalProps) {
  const createProduct = useCreateProduct();
  const { theme } = useTheme();

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
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
      Alert.alert('خطا', 'لطفاً نام و قیمت محصول را وارد کنید');
      return;
    }

    const price = getPriceValue();

    if (isNaN(price) || price <= 0) {
      Alert.alert('خطا', 'لطفاً قیمت معتبری وارد کنید');
      return;
    }

    try {
      await createProduct.mutateAsync({
        name: productName,
        price,
        isWishlisted: addToWishlist,
        savedGoldAmount: 0,
      });

      Alert.alert(
        'موفق',
        addToWishlist
          ? 'محصول به لیست علاقه‌مندی اضافه شد'
          : 'محصول ذخیره شد'
      );
      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'خطا در افزودن محصول';
      Alert.alert('خطا', errorMessage);
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
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>افزودن محصول جدید</Text>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>نام محصول</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, color: theme.colors.text }]}
              placeholder="مثلاً: گوشی موبایل"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>قیمت (تومان)</Text>
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

          {goldEquivalent > 0 && (
            <View style={[styles.resultCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.primary }]}>
              <Coins size={32} color={theme.colors.primary} strokeWidth={2} />
              <Text style={[styles.resultLabel, { color: theme.colors.textTertiary }]}>معادل طلا</Text>
              <Text style={[styles.resultValue, { color: theme.colors.primary }]}>
                {formatNumber(goldEquivalent * 1000)} میلی‌گرم
              </Text>
              <Text style={[styles.resultSubtext, { color: theme.colors.textTertiary }]}>
                ({goldEquivalent.toFixed(3)} گرم طلای 18 عیار)
              </Text>
            </View>
          )}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.wishlistButton, { backgroundColor: theme.colors.primary }, goldEquivalent <= 0 && styles.buttonDisabled]}
              onPress={() => handleAddProduct(true)}
              disabled={goldEquivalent <= 0}
            >
              <Heart size={20} color={theme.colors.background} strokeWidth={2} />
              <Text style={[styles.wishlistButtonText, { color: theme.colors.background }]}>افزودن به علاقه‌مندی</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.skipButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }, goldEquivalent <= 0 && styles.buttonDisabled]}
              onPress={() => handleAddProduct(false)}
              disabled={goldEquivalent <= 0}
            >
              <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>ذخیره بدون علاقه‌مندی</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
            با افزودن به علاقه‌مندی می‌توانید پیشرفت خرید خود را با طلا پیگیری کنید
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
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Vazirmatn_700Bold',
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
    textAlign: 'right',
    fontFamily: 'Vazirmatn_700Bold',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_400Regular',
  },
  inputWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_400Regular',
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
    fontFamily: 'Vazirmatn_400Regular',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Vazirmatn_700Bold',
  },
  resultSubtext: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Vazirmatn_400Regular',
  },
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  wishlistButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'Vazirmatn_700Bold',
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
    fontFamily: 'Vazirmatn_700Bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Vazirmatn_400Regular',
  },
});
