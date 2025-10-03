import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useProducts, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import {
  Heart,
  Calendar,
  DollarSign,
  Trash2,
  Plus,
  Coins,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function WishlistScreen() {
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { formatAmount } = useCurrency();

  const wishlistItems = products.filter(p => p.isWishlisted);
  const totalSavedForWishlist = wishlistItems.reduce((sum, item) => sum + item.savedAmount, 0);
  const totalSavedFromSkipping = products
    .filter(p => !p.isWishlisted)
    .reduce((sum, item) => sum + item.savedAmount, 0);

  const handleAddSavings = async (productId: string, currentAmount: number, monthlyAmount: number) => {
    const newAmount = currentAmount + monthlyAmount;
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: { savedAmount: newAmount },
      });
      Alert.alert(t('common.success'), t('wishlist.savingsUpdated'));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update savings';
      Alert.alert(t('common.error'), errorMessage);
    }
  };

  const handleDeleteItem = (productId: string, productName: string) => {
    Alert.alert(
      t('wishlist.removeItem'),
      t('wishlist.removeConfirm', { name: productName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct.mutateAsync(productId);
            } catch (error: any) {
              const errorMessage = error.response?.data?.error || 'Failed to delete product';
              Alert.alert(t('common.error'), errorMessage);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const calculateProgress = (saved: number, price: number) => {
    return Math.min((saved / price) * 100, 100);
  };

  const calculateRemainingTime = (price: number, saved: number, monthly: number) => {
    const remaining = price - saved;
    if (remaining <= 0) return t('wishlist.goalReached');
    if (monthly <= 0) return 'N/A';

    // Calculate based on daily income (monthly / 30 days)
    const dailyIncome = monthly / 30;
    const totalDays = remaining / dailyIncome;

    // Convert to readable format
    const months = Math.floor(totalDays / 30);
    const days = Math.floor(totalDays % 30);
    const hours = Math.floor((totalDays % 1) * 24);

    const parts: string[] = [];

    if (months > 0) {
      parts.push(`${months} ${months === 1 ? t('time.month') : t('time.months')}`);
    }
    if (days > 0 && months === 0) {
      parts.push(`${days} ${days === 1 ? t('time.day') : t('time.days')}`);
    }
    if (hours > 0 && months === 0 && days === 0) {
      parts.push(`${hours} ${hours === 1 ? t('time.hour') : t('time.hours')}`);
    }

    const timeLeft = parts.length > 0 ? parts.join(' ') : t('wishlist.lessThanHour');
    return `${timeLeft} ${t('wishlist.timeLeft')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('wishlist.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('wishlist.subtitle')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('wishlist.savedForWishlist')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatAmount(totalSavedForWishlist)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('wishlist.savedBySkipping')}</Text>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {formatAmount(totalSavedFromSkipping)}
            </Text>
          </View>
        </View>

        {wishlistItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={64} color={theme.colors.border} strokeWidth={2} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{t('wishlist.noItems')}</Text>
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              {t('wishlist.noItemsDescription')}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {wishlistItems.map((item) => {
              const progress = calculateProgress(item.savedAmount, item.price);
              const remainingTime = calculateRemainingTime(
                item.price,
                item.savedAmount,
                item.monthlySavings
              );
              const isComplete = item.savedAmount >= item.price;

              return (
                <View key={item._id} style={[styles.itemCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item._id, item.name)}
                    >
                      <Trash2 size={20} color={theme.colors.error} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemPrice}>
                    <Coins size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                    <Text style={[styles.itemPriceText, { color: theme.colors.textSecondary }]}>
                      {formatAmount(item.price)}
                    </Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.backgroundSecondary }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: isComplete ? theme.colors.success : theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                      {formatAmount(item.savedAmount)} / {formatAmount(item.price)}
                    </Text>
                  </View>

                  {!isComplete && (
                    <View style={styles.itemFooter}>
                      <View style={styles.timeInfo}>
                        <Calendar size={16} color={theme.colors.textSecondary} strokeWidth={2} />
                        <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                          {remainingTime}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.addSavingsButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() =>
                          handleAddSavings(
                            item._id,
                            item.savedAmount,
                            item.monthlySavings
                          )
                        }
                      >
                        <Plus size={16} color={theme.colors.background} strokeWidth={2} />
                        <Text style={[styles.addSavingsText, { color: theme.colors.background }]}>
                          {t('wishlist.addSavings', { amount: formatAmount(item.monthlySavings) })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {isComplete && (
                    <View style={[styles.completeBadge, { backgroundColor: theme.colors.success }]}>
                      <Text style={[styles.completeText, { color: theme.colors.background }]}>{t('wishlist.goalReached')}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
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
  subtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  listContainer: {
    padding: 24,
    paddingTop: 0,
  },
  itemCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemPriceText: {
    fontSize: 16,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  addSavingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addSavingsText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  completeBadge: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completeText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
