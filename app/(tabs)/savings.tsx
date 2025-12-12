import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useSavingsLogs, useDeleteSavingsLog } from '@/lib/hooks/useSavingsLogs';
import { useGoals } from '@/lib/hooks/useGoals';
import { use18KGoldPrice } from '@/lib/hooks/useGold';
import { History as HistoryIcon, Plus, Trash2, DollarSign, Coins } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/lib/toast';
import { TEXT, formatNumber, formatDate, formatDecimal } from '@/constants/text';
import { formatGoldWeight } from '@/lib/utils/goldUnits';
import AddSavingsModal from '@/components/AddSavingsModal';
import DepthButton from '@/components/ui/DepthButton';
import AppHeader from '@/components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';

export default function SavingsScreen() {
  const { data: savingsLogs = [], isLoading } = useSavingsLogs();
  const deleteSavingsLog = useDeleteSavingsLog();
  const { data: _goals = [] } = useGoals();
  const { data: goldPrice } = use18KGoldPrice();
  const { theme } = useTheme();

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'money' | 'gold';
  } | null>(null);

  const handleDeleteLog = (logId: string, logType: 'money' | 'gold') => {
    setDeleteConfirm({ id: logId, type: logType });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteSavingsLog.mutateAsync(deleteConfirm.id);
      showToast.success(TEXT.common.save, TEXT.history.deleted);
      setDeleteConfirm(null);
    } catch {
      showToast.error(TEXT.common.error, TEXT.history.deleteError);
    }
  };

  const getTotalSavings = () => {
    const totals = { money: 0, gold: 0 };
    savingsLogs.forEach((log) => {
      if (log.type === 'money') {
        totals.money += log.amount;
      } else {
        totals.gold += log.amount;
      }
    });
    return totals;
  };

  const totals = getTotalSavings();

  // Memoized styles for conditional rendering
  const containerStyle = useMemo(
    () => ({ flex: 1, backgroundColor: theme.colors.background }),
    [theme.colors.background]
  );

  const deleteButtonBackgroundStyle = useMemo(() => ({ backgroundColor: '#DC2626' }), []);

  const addButtonStyle = useMemo(() => ({ marginBottom: 20 }), []);
  const confirmButtonStyle = useMemo(() => ({ flex: 1 }), []);

  const summaryRowBorderStyle = useMemo(
    () => ({
      marginBottom: 0,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    }),
    [theme.colors.border]
  );

  // Helper function for log icon background
  const getLogIconBackground = (logType: 'money' | 'gold') => ({
    backgroundColor:
      logType === 'money' ? theme.colors.success + '20' : theme.colors.primary + '20',
  });

  const dynamicStyles = StyleSheet.create({
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
      fontFamily: 'Vazirmatn_400Regular',
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
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 20,
      marginBottom: 12,
      textAlign: 'right',
    },
    deleteButton: {
      padding: 8,
    },
    emptyContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 16,
      marginTop: 16,
      textAlign: 'center',
    },
    loading: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    logAmount: {
      color: theme.colors.text,
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 18,
      marginBottom: 2,
      textAlign: 'right',
    },
    logCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row-reverse',
      marginBottom: 12,
      padding: 16,
    },
    logContent: {
      flex: 1,
    },
    logDate: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 12,
      textAlign: 'right',
    },
    logIcon: {
      alignItems: 'center',
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      marginLeft: 12,
      width: 48,
    },
    logNote: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 13,
      marginTop: 4,
      textAlign: 'right',
    },
    logType: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 12,
      marginBottom: 4,
      textAlign: 'right',
    },
    logsList: {
      flex: 1,
      paddingHorizontal: 24,
    },
    summaryCard: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 20,
      marginTop: 24,
      padding: 20,
    },
    summaryLabel: {
      color: theme.colors.textSecondary,
      fontFamily: 'Vazirmatn_400Regular',
      fontSize: 14,
    },
    summaryRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    summaryValue: {
      color: theme.colors.text,
      fontFamily: 'Vazirmatn_700Bold',
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundSecondary]}
        style={StyleSheet.absoluteFillObject}
      />
      <AppHeader />
      <ScrollView
        style={dynamicStyles.logsList}
        showsVerticalScrollIndicator={false}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{ paddingBottom: 180 }}
      >
        {/* Summary Card */}
        <View style={dynamicStyles.summaryCard}>
          <View style={dynamicStyles.summaryRow}>
            <Text style={dynamicStyles.summaryValue}>
              {formatNumber(totals.money)} {TEXT.common.toman}
            </Text>
            <Text style={dynamicStyles.summaryLabel}>{TEXT.history.totalMoney}</Text>
          </View>
          <View style={dynamicStyles.summaryRow}>
            <View>
              <Text style={dynamicStyles.summaryValue}>
                {formatDecimal(totals.gold)} {TEXT.common.gram}
              </Text>
              {goldPrice && (
                <Text style={dynamicStyles.summaryLabel}>
                  ({formatNumber(totals.gold * goldPrice.price)} {TEXT.common.toman})
                </Text>
              )}
            </View>
            <Text style={dynamicStyles.summaryLabel}>{TEXT.history.gold}</Text>
          </View>
          <View style={[dynamicStyles.summaryRow, summaryRowBorderStyle]}>
            <Text style={dynamicStyles.summaryValue}>{formatNumber(savingsLogs.length)}</Text>
            <Text style={dynamicStyles.summaryLabel}>{TEXT.history.totalEntries}</Text>
          </View>
        </View>

        {/* Add Button */}
        <DepthButton
          onPress={() => setAddModalVisible(true)}
          variant="primary"
          size="large"
          style={addButtonStyle}
          icon={<Plus size={20} color={theme.isDark ? '#0A0A0A' : '#FFFFFF'} strokeWidth={2.5} />}
          iconPosition="left"
        >
          {TEXT.history.addSavings}
        </DepthButton>

        {/* Logs List */}
        {isLoading ? (
          <View style={dynamicStyles.loading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : savingsLogs.length === 0 ? (
          <View style={dynamicStyles.emptyContainer}>
            <HistoryIcon size={64} color={theme.colors.textSecondary} />
            <Text style={dynamicStyles.emptyText}>{TEXT.history.noLogs}</Text>
          </View>
        ) : (
          savingsLogs.map((log) => {
            const goldFormatted = formatGoldWeight(log.amount);

            return (
              <View key={log._id} style={dynamicStyles.logCard}>
                <View style={[dynamicStyles.logIcon, getLogIconBackground(log.type)]}>
                  {log.type === 'money' ? (
                    <DollarSign size={24} color={theme.colors.success} strokeWidth={2.5} />
                  ) : (
                    <Coins size={24} color={theme.colors.primary} strokeWidth={2.5} />
                  )}
                </View>
                <View style={dynamicStyles.logContent}>
                  <Text style={dynamicStyles.logType}>
                    {log.type === 'money' ? TEXT.history.moneySaved : TEXT.history.goldSaved}
                  </Text>
                  <Text style={dynamicStyles.logAmount}>
                    {log.type === 'money'
                      ? `${formatNumber(log.amount)} ${TEXT.common.toman}`
                      : `${formatDecimal(goldFormatted.primary.value)} ${goldFormatted.primary.unit}`}
                  </Text>
                  {log.type === 'gold' && goldPrice && (
                    <Text style={dynamicStyles.logNote}>
                      {formatNumber(log.amount * goldPrice.price)} {TEXT.common.toman}
                    </Text>
                  )}
                  {log.note && (
                    <Text style={dynamicStyles.logNote} numberOfLines={1}>
                      {log.note}
                    </Text>
                  )}
                  {log.goalId && (
                    <Text style={dynamicStyles.logNote} numberOfLines={1}>
                      {TEXT.history.for}: {log.goalId.name}
                    </Text>
                  )}
                  <Text style={dynamicStyles.logDate}>{formatDate(log.date)}</Text>
                </View>
                <TouchableOpacity
                  style={dynamicStyles.deleteButton}
                  onPress={() => handleDeleteLog(log._id, log.type)}
                >
                  <Trash2 size={20} color={theme.colors.error} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <AddSavingsModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />

      <Modal
        visible={deleteConfirm !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteConfirm(null)}
      >
        <View style={dynamicStyles.confirmOverlay}>
          <View style={[dynamicStyles.confirmContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[dynamicStyles.confirmTitle, { color: theme.colors.text }]}>
              {TEXT.history.deleteTitle}
            </Text>
            <Text style={[dynamicStyles.confirmMessage, { color: theme.colors.textSecondary }]}>
              {TEXT.history.deleteConfirm}
            </Text>
            <View style={dynamicStyles.confirmButtons}>
              <DepthButton
                onPress={() => setDeleteConfirm(null)}
                variant="outline"
                size="medium"
                style={confirmButtonStyle}
              >
                {TEXT.common.cancel}
              </DepthButton>
              <DepthButton
                onPress={confirmDelete}
                variant="primary"
                size="medium"
                style={[confirmButtonStyle, deleteButtonBackgroundStyle]}
              >
                {TEXT.common.delete}
              </DepthButton>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (styles are same as before, no changes needed in styles object usually unless class names changed)
  // But wait, I need to make sure I didn't lose the styles.
  // The previous file content had styles defined at the bottom.
  // I will copy them back or use the same styles.
  // Since I am rewriting the file, I must include the styles.
  // I'll assume the styles are the same as in the read file.
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
