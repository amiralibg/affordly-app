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

export default function CalculateScreen() {
  const { data: goldPrice, isLoading } = use18KGoldPrice();
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>محاسبه طلا</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>قیمت محصول را وارد کنید و معادل طلای آن را ببینید</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>در حال دریافت قیمت طلا...</Text>
          </View>
        ) : goldPrice ? (
          <View style={[styles.goldCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.primary }]}>
            <Coins size={32} color={theme.colors.primary} strokeWidth={2} />
            <Text style={[styles.goldLabel, { color: theme.colors.textTertiary }]}>قیمت طلای 18 عیار</Text>
            <Text style={[styles.goldPrice, { color: theme.colors.primary }]}>{formatNumber(goldPrice.price)} تومان</Text>
            <Text style={[styles.goldUnit, { color: theme.colors.textTertiary }]}>هر گرم</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Coins size={48} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>خطا در دریافت قیمت طلا</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }, !goldPrice && styles.addButtonDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={!goldPrice}
        >
          <Plus size={24} color={theme.colors.background} strokeWidth={2} />
          <Text style={[styles.addButtonText, { color: theme.colors.background }]}>افزودن محصول جدید</Text>
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
    textAlign: 'right',
    fontFamily: 'Vazirmatn_700Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'right',
    fontFamily: 'Vazirmatn_400Regular',
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
    fontFamily: 'Vazirmatn_400Regular',
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
    fontFamily: 'Vazirmatn_400Regular',
  },
  goldPrice: {
    fontSize: 36,
    fontWeight: '700',
    marginTop: 8,
    fontFamily: 'Vazirmatn_700Bold',
  },
  goldUnit: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Vazirmatn_400Regular',
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
    fontFamily: 'Vazirmatn_400Regular',
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
    fontFamily: 'Vazirmatn_700Bold',
  },
});
