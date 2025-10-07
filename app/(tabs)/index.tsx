import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { use18KGoldPrice } from '@/lib/hooks/useGold';
import { Plus, Coins } from 'lucide-react-native';
import AddProductModal from '@/components/AddProductModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';

export default function CalculateScreen() {
  const { data: goldPrice, isLoading } = use18KGoldPrice();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const fontRegular = useLocalizedFont('regular');
  const fontBold = useLocalizedFont('bold');

  const formatNumber = (num: number) => {
    const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(locale).format(Math.round(num));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, fontBold, { color: theme.colors.text }]}>{t('calculate.title')}</Text>
        <Text style={[styles.subtitle, fontRegular, { color: theme.colors.textSecondary }]}>{t('calculate.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, fontRegular, { color: theme.colors.textSecondary }]}>{t('calculate.fetchingGoldPrice')}</Text>
          </View>
        ) : goldPrice ? (
          <View style={[styles.goldCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.primary }]}>
            <Coins size={32} color={theme.colors.primary} strokeWidth={2} />
            <Text style={[styles.goldLabel, fontRegular, { color: theme.colors.textTertiary }]}>{t('calculate.goldPrice')}</Text>
            <Text style={[styles.goldPrice, fontBold, { color: theme.colors.primary }]}>{formatNumber(goldPrice.price)} {i18n.language === 'fa' ? 'تومان' : 'Toman'}</Text>
            <Text style={[styles.goldUnit, fontRegular, { color: theme.colors.textTertiary }]}>{t('calculate.perGram')}</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Coins size={48} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.errorText, fontRegular, { color: theme.colors.textSecondary }]}>{t('calculate.goldPriceError')}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }, !goldPrice && styles.addButtonDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={!goldPrice}
        >
          <Plus size={24} color={theme.colors.background} strokeWidth={2} />
          <Text style={[styles.addButtonText, fontBold, { color: theme.colors.background }]}>{t('calculate.addNewProduct')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        goldPrice={goldPrice?.price}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'left',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  goldCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  goldLabel: {
    fontSize: 16,
    marginTop: 12,
  },
  goldPrice: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 8,
  },
  goldUnit: {
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
