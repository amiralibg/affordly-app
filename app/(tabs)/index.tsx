import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useProfile } from '@/lib/hooks/useProfile';
import { Plus, DollarSign, Coins } from 'lucide-react-native';
import AddProductModal from '@/components/AddProductModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CalculateScreen() {
  const { data: profile } = useProfile();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('calculate.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('calculate.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!profile || profile.monthlySalary === 0 ? (
          <View style={styles.noSalaryContainer}>
            <Coins size={48} color={theme.colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.noSalaryText, { color: theme.colors.textTertiary }]}>
              {t('calculate.noSalary')}
            </Text>
          </View>
        ) : (
          <View style={[styles.salaryCard, { backgroundColor: theme.colors.backgroundSecondary, borderColor: theme.colors.border }]}>
            <Text style={[styles.salaryLabel, { color: theme.colors.textSecondary }]}>{t('calculate.yourMonthlySalary')}</Text>
            <Text style={[styles.salaryAmount, { color: theme.colors.primaryLight }]}>{formatAmount(profile.monthlySalary)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.primary }, (!profile || profile.monthlySalary === 0) && styles.addButtonDisabled]}
          onPress={() => setModalVisible(true)}
          disabled={!profile || profile.monthlySalary === 0}
        >
          <Plus size={24} color={theme.colors.background} strokeWidth={2} />
          <Text style={[styles.addButtonText, { color: theme.colors.background }]}>{t('calculate.addNewProduct')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        monthlySalary={profile?.monthlySalary}
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
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  noSalaryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noSalaryText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  salaryCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
  },
  salaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  salaryAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  addButton: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
