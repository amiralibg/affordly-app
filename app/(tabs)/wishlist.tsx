import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useProducts, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { Heart, Coins, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/lib/toast';
import { TEXT, formatNumber } from '@/constants/text';
import { formatGoldWeight } from '@/lib/utils/goldUnits';
import { persianToEnglish, englishToPersian } from '@/utils/numbers';
import type { SavingsTimeline } from '@/lib/api/products';
import WishlistCard from '@/components/ui/WishlistCard';
import GlassInput from '@/components/ui/GlassInput';
import DepthButton from '@/components/ui/DepthButton';
import AppHeader from '@/components/AppHeader';

export default function WishlistScreen() {
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { theme } = useTheme();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [goldAmount, setGoldAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Memoized styles
  const deleteButtonBackgroundStyle = useMemo(() => ({ backgroundColor: '#DC2626' }), []);
  const deleteButtonTextStyle = useMemo(() => ({ color: '#FFFFFF' }), []);

  const wishlistItems = products.filter((p) => p.isWishlisted);

  const calculateProgress = (saved: number, total: number) => {
    return Math.min((saved / total) * 100, 100);
  };

  const formatTimeline = (timeline: SavingsTimeline | null | undefined): string | null => {
    if (!timeline) return null;

    if (timeline.monthsToSave === 0) {
      return TEXT.timeline.goalReached;
    }

    const years = Math.floor(timeline.monthsToSave / 12);
    const months = Math.floor(timeline.monthsToSave % 12);

    if (years > 0) {
      return TEXT.timeline.yearsToSave(years, months);
    }

    if (months > 0) {
      return TEXT.timeline.monthsToSave(months);
    }

    return TEXT.timeline.daysToSave(timeline.daysToSave);
  };

  const handleGoldAmountChange = (text: string) => {
    // Convert Persian/Arabic digits to English
    const converted = persianToEnglish(text);

    // Allow only digits and one decimal point
    const cleaned = converted.replace(/[^0-9.]/g, '');

    // Handle multiple decimal points - keep only the first one
    const parts = cleaned.split('.');
    let final = parts[0];
    if (parts.length > 1) {
      final = parts[0] + '.' + parts.slice(1).join('');
    }

    // Convert back to Persian for display
    setGoldAmount(final ? englishToPersian(final) : '');
  };

  const handleAddGold = async (productId: string, currentAmount: number) => {
    // Convert Persian to English before parsing
    const addAmount = parseFloat(persianToEnglish(goldAmount));

    if (isNaN(addAmount) || addAmount <= 0) {
      showToast.error(TEXT.common.error, TEXT.wishlist.enterValidAmount);
      return;
    }

    const newAmount = currentAmount + addAmount;

    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: { savedGoldAmount: newAmount },
      });
      showToast.success(TEXT.common.success, TEXT.wishlist.goldUpdated);
      setEditingProductId(null);
      setGoldAmount('');
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        TEXT.wishlist.updateError;
      showToast.error(TEXT.common.error, errorMessage);
    }
  };

  const handleDeleteItem = (productId: string, productName: string) => {
    setDeleteConfirm({ id: productId, name: productName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProduct.mutateAsync(deleteConfirm.id);
      showToast.success(TEXT.common.success, TEXT.common.delete);
      setDeleteConfirm(null);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        TEXT.wishlist.deleteError;
      showToast.error(TEXT.common.error, errorMessage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <AppHeader />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : wishlistItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.emptyText, styles.fontRegular, { color: theme.colors.textSecondary }]}
            >
              {TEXT.wishlist.noItems}
            </Text>
          </View>
        ) : (
          wishlistItems.map((item) => {
            const progress = calculateProgress(item.savedGoldAmount, item.goldEquivalent);
            const remaining = Math.max(0, item.goldEquivalent - item.savedGoldAmount);

            const goldEquivalentFormatted = formatGoldWeight(item.goldEquivalent);
            const savedGoldFormatted = formatGoldWeight(item.savedGoldAmount);
            const remainingFormatted = formatGoldWeight(remaining);

            return (
              <WishlistCard
                key={item._id}
                productName={item.name}
                price={`${formatNumber(item.price)} ${TEXT.wishlist.toman}`}
                goldEquivalent={`${formatNumber(goldEquivalentFormatted.primary.value)} ${goldEquivalentFormatted.primary.unit}`}
                savedGold={`${formatNumber(savedGoldFormatted.primary.value)} ${savedGoldFormatted.primary.unit}`}
                remaining={`${formatNumber(remainingFormatted.primary.value)} ${remainingFormatted.primary.unit}`}
                progress={progress}
                timeline={formatTimeline(item.timeline)}
                onAddGold={() => {
                  setEditingProductId(item._id);
                  setGoldAmount('');
                }}
                onDelete={() => handleDeleteItem(item._id, item.name)}
                goalReached={progress >= 100}
              />
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={editingProductId !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingProductId(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.colors.card,
                borderTopLeftRadius: theme.radius.xl,
                borderTopRightRadius: theme.radius.xl,
              },
              theme.shadows.elevated,
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: 1,
                  padding: theme.spacing.lg,
                },
              ]}
            >
              <Text style={[styles.modalTitle, styles.fontBold, { color: theme.colors.text }]}>
                {TEXT.wishlist.addGold}
              </Text>
              <TouchableOpacity onPress={() => setEditingProductId(null)}>
                <X size={24} color={theme.colors.textSecondary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalContent, { padding: theme.spacing.lg }]}>
              <Text
                style={[
                  styles.modalLabel,
                  styles.fontBold,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    color: theme.colors.text,
                    marginBottom: theme.spacing.sm,
                    fontSize: 16,
                  },
                ]}
              >
                {TEXT.wishlist.goldAmount}
              </Text>

              <GlassInput
                icon={<Coins size={20} color={theme.colors.textSecondary} strokeWidth={2.5} />}
                placeholder="0"
                value={goldAmount}
                onChangeText={handleGoldAmountChange}
                keyboardType="decimal-pad"
                autoFocus
                containerStyle={{ marginBottom: theme.spacing.lg }}
              />

              <DepthButton
                onPress={() => {
                  const product = products.find((p) => p._id === editingProductId);
                  if (product) {
                    void handleAddGold(editingProductId!, product.savedGoldAmount);
                  }
                }}
                variant="primary"
                size="large"
              >
                {TEXT.wishlist.save}
              </DepthButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={deleteConfirm !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.confirmTitle, styles.fontBold, { color: theme.colors.text }]}>
              {TEXT.wishlist.removeProduct}
            </Text>
            <Text
              style={[
                styles.confirmMessage,
                styles.fontRegular,
                { color: theme.colors.textSecondary },
              ]}
            >
              {TEXT.wishlist.removeConfirm(deleteConfirm?.name || '')}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonCancel,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.cardBorder,
                  },
                ]}
                onPress={() => setDeleteConfirm(null)}
              >
                <Text
                  style={[styles.confirmButtonText, styles.fontBold, { color: theme.colors.text }]}
                >
                  {TEXT.wishlist.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonDelete,
                  deleteButtonBackgroundStyle,
                ]}
                onPress={confirmDelete}
              >
                <Text style={[styles.confirmButtonText, styles.fontBold, deleteButtonTextStyle]}>
                  {TEXT.wishlist.remove}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    padding: 14,
  },
  confirmButtonCancel: {
    borderWidth: 1,
  },
  confirmButtonDelete: {},
  confirmButtonText: {
    fontSize: 16,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmContainer: {
    borderRadius: 20,
    maxWidth: 400,
    padding: 24,
    width: '100%',
  },
  confirmMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'right',
  },
  confirmOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  confirmTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'right',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  fontBold: {
    fontFamily: 'Vazirmatn_700Bold',
  },
  fontRegular: {
    fontFamily: 'Vazirmatn_400Regular',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'right',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
  },
});
