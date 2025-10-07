import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useProducts, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { Heart, Trash2, Plus, Coins, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalizedFont } from '@/hooks/useLocalizedFont';
import { showToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';

export default function WishlistScreen() {
  const { data: products = [], isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { theme } = useTheme();
  const fontRegular = useLocalizedFont('regular');
  const fontBold = useLocalizedFont('bold');
  const { t, i18n } = useTranslation();

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [goldAmount, setGoldAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const formatNumber = (num: number) => {
    const locale = i18n.language === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.NumberFormat(locale).format(Math.round(num));
  };

  const wishlistItems = products.filter(p => p.isWishlisted);

  const calculateProgress = (saved: number, total: number) => {
    return Math.min((saved / total) * 100, 100);
  };

  const handleAddGold = async (productId: string, currentAmount: number) => {
    const addAmount = parseFloat(goldAmount);

    if (isNaN(addAmount) || addAmount <= 0) {
      showToast.error(t('common.error'), t('wishlist.enterValidAmount'));
      return;
    }

    const newAmount = currentAmount + addAmount;

    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: { savedGoldAmount: newAmount },
      });
      showToast.success(t('common.success'), t('wishlist.goldUpdated'));
      setEditingProductId(null);
      setGoldAmount('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('wishlist.updateError');
      showToast.error(t('common.error'), errorMessage);
    }
  };

  const handleDeleteItem = (productId: string, productName: string) => {
    setDeleteConfirm({ id: productId, name: productName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProduct.mutateAsync(deleteConfirm.id);
      showToast.success(t('common.success'), t('common.delete'));
      setDeleteConfirm(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || t('wishlist.deleteError');
      showToast.error(t('common.error'), errorMessage);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, fontBold, { color: theme.colors.text }]}>{t('wishlist.title')}</Text>
        <Text style={[styles.subtitle, fontRegular, { color: theme.colors.textSecondary }]}>
          {t('wishlist.subtitle')}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {wishlistItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={48} color={theme.colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.emptyText, fontRegular, { color: theme.colors.textSecondary }]}>
              {t('wishlist.noItems')}
            </Text>
          </View>
        ) : (
          wishlistItems.map((item) => {
            const progress = calculateProgress(item.savedGoldAmount, item.goldEquivalent);
            const remaining = Math.max(0, item.goldEquivalent - item.savedGoldAmount);

            return (
              <View key={item._id} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.productName, fontBold, { color: theme.colors.text }]}>{item.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item._id, item.name)}
                  >
                    <Trash2 size={20} color={theme.colors.error} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <View style={styles.priceRow}>
                  <Text style={[styles.price, fontRegular, { color: theme.colors.textSecondary }]}>{formatNumber(item.price)} {t('wishlist.toman')}</Text>
                </View>

                <View style={styles.goldInfo}>
                  <View style={styles.goldRow}>
                    <Text style={[styles.goldLabel, fontRegular, { color: theme.colors.textSecondary }]}>{t('wishlist.goldEquivalent')}</Text>
                    <Text style={[styles.goldValue, fontBold, { color: theme.colors.primary }]}>
                      {(item.goldEquivalent * 1000).toFixed(0)} {t('wishlist.milligrams')}
                    </Text>
                  </View>
                  <View style={styles.goldRow}>
                    <Text style={[styles.goldLabel, fontRegular, { color: theme.colors.textSecondary }]}>{t('wishlist.savedGold')}</Text>
                    <Text style={[styles.goldValueSaved, fontBold, { color: theme.colors.success }]}>
                      {(item.savedGoldAmount * 1000).toFixed(0)} {t('wishlist.milligrams')}
                    </Text>
                  </View>
                  <View style={styles.goldRow}>
                    <Text style={[styles.goldLabel, fontRegular, { color: theme.colors.textSecondary }]}>{t('wishlist.remaining')}</Text>
                    <Text style={[styles.goldValueRemaining, fontBold, { color: theme.colors.textTertiary }]}>
                      {(remaining * 1000).toFixed(0)} {t('wishlist.milligrams')}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View
                      style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]}
                    />
                  </View>
                  <Text style={[styles.progressText, fontBold, { color: theme.colors.primary }]}>{progress.toFixed(1)}%</Text>
                </View>

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    setEditingProductId(item._id);
                    setGoldAmount('');
                  }}
                >
                  <Plus size={20} color={theme.colors.background} strokeWidth={2} />
                  <Text style={[styles.addButtonText, fontBold, { color: theme.colors.background }]}>{t('wishlist.addGold')}</Text>
                </TouchableOpacity>

                {progress >= 100 && (
                  <View style={[styles.completedBadge, { backgroundColor: theme.colors.success + '26' }]}>
                    <Text style={[styles.completedText, fontBold, { color: theme.colors.success }]}>{t('wishlist.goalReached')}</Text>
                  </View>
                )}
              </View>
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, fontBold, { color: theme.colors.text }]}>{t('wishlist.addGold')}</Text>
              <TouchableOpacity onPress={() => setEditingProductId(null)}>
                <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={[styles.modalLabel, fontRegular, { color: theme.colors.text }]}>{t('wishlist.goldAmount')}</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: theme.colors.background, borderColor: theme.colors.cardBorder }]}>
                <Coins size={20} color={theme.colors.textSecondary} strokeWidth={2} />
                <TextInput
                  style={[styles.inputText, fontRegular, { color: theme.colors.text }]}
                  placeholder="0"
                  value={goldAmount}
                  onChangeText={setGoldAmount}
                  keyboardType="decimal-pad"
                  placeholderTextColor={theme.colors.textTertiary}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  const product = products.find(p => p._id === editingProductId);
                  if (product) {
                    handleAddGold(editingProductId!, product.savedGoldAmount);
                  }
                }}
              >
                <Text style={[styles.saveButtonText, fontBold, { color: theme.colors.background }]}>{t('wishlist.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteConfirm !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.confirmTitle, fontBold, { color: theme.colors.text }]}>{t('wishlist.removeProduct')}</Text>
            <Text style={[styles.confirmMessage, fontRegular, { color: theme.colors.textSecondary }]}>
              {t('wishlist.removeConfirm', { name: deleteConfirm?.name })}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel, { backgroundColor: theme.colors.background, borderColor: theme.colors.cardBorder }]}
                onPress={() => setDeleteConfirm(null)}
              >
                <Text style={[styles.confirmButtonText, fontBold, { color: theme.colors.text }]}>{t('wishlist.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonDelete, { backgroundColor: '#DC2626' }]}
                onPress={confirmDelete}
              >
                <Text style={[styles.confirmButtonText, fontBold, { color: '#FFFFFF' }]}>{t('wishlist.remove')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    flex: 1,
    textAlign: 'left',
  },
  priceRow: {
    marginBottom: 16,
  },
  price: {
    fontSize: 18,
    textAlign: 'left',
  },
  goldInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goldRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goldLabel: {
    fontSize: 14,
  },
  goldValue: {
    fontSize: 14,
  },
  goldValueSaved: {
    fontSize: 14,
  },
  goldValueRemaining: {
    fontSize: 14,
  },
  progressBarContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
  },
  addButton: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    marginRight: 8,
  },
  completedBadge: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
  },
  modalContent: {
    padding: 24,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'left',
  },
  inputWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  inputText: {
    flex: 1,
    fontSize: 18,
    marginRight: 12,
    textAlign: 'left',
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'left',
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    borderWidth: 1,
  },
  confirmButtonDelete: {},
  confirmButtonText: {
    fontSize: 16,
  },
});
