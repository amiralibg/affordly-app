import { useState, useMemo } from 'react';
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
import { DollarSign, Coins, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateSavingsLog } from '@/lib/hooks/useSavingsLogs';
import { useTheme } from '@/contexts/ThemeContext';
import { showToast } from '@/lib/toast';
import { TEXT } from '@/constants/text';
import { persianToEnglish, englishToPersian } from '@/utils/numbers';
import GlassInput from './ui/GlassInput';
import DepthButton from './ui/DepthButton';

interface AddSavingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddSavingsModal({ visible, onClose }: AddSavingsModalProps) {
  const createSavingsLog = useCreateSavingsLog();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedType, setSelectedType] = useState<'money' | 'gold'>('money');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();

  // Memoized styles for dynamic theming and RTL support
  const keyboardAvoidingViewStyle = useMemo(() => ({ flex: 1 }), []);

  const modalContainerStyle = useMemo(
    () => ({ flex: 1, backgroundColor: theme.colors.background }),
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

  const moneyTypeButtonStyle = useMemo(
    () => ({
      borderColor: selectedType === 'money' ? theme.colors.success : theme.colors.border,
      backgroundColor: selectedType === 'money' ? theme.colors.success + '10' : 'transparent',
    }),
    [selectedType, theme.colors.success, theme.colors.border]
  );

  const goldTypeButtonStyle = useMemo(
    () => ({
      borderColor: selectedType === 'gold' ? theme.colors.primary : theme.colors.border,
      backgroundColor: selectedType === 'gold' ? theme.colors.primary + '10' : 'transparent',
    }),
    [selectedType, theme.colors.primary, theme.colors.border]
  );

  const moneyTypeTextStyle = useMemo(
    () => ({
      color: selectedType === 'money' ? theme.colors.success : theme.colors.textSecondary,
    }),
    [selectedType, theme.colors.success, theme.colors.textSecondary]
  );

  const goldTypeTextStyle = useMemo(
    () => ({
      color: selectedType === 'gold' ? theme.colors.primary : theme.colors.textSecondary,
    }),
    [selectedType, theme.colors.primary, theme.colors.textSecondary]
  );

  const handleAmountChange = (text: string) => {
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
    setAmount(final ? englishToPersian(final) : '');
  };

  const handleAddSavings = async () => {
    // Convert Persian to English before parsing
    const parsedAmount = parseFloat(persianToEnglish(amount));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast.error(TEXT.common.error, TEXT.history.enterValidAmount);
      return;
    }

    try {
      await createSavingsLog.mutateAsync({
        amount: parsedAmount,
        type: selectedType,
        productId: selectedProductId,
        note: note || undefined,
      });

      showToast.success(TEXT.common.success, TEXT.history.savingsAdded);
      resetForm();
      onClose();
    } catch {
      showToast.error(TEXT.common.error, TEXT.history.addError);
    }
  };

  const resetForm = () => {
    setAmount('');
    setNote('');
    setSelectedProductId(undefined);
    setSelectedType('money');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const dynamicStyles = StyleSheet.create({
    typeButton: {
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 2,
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      paddingVertical: 12,
    },
    typeButtonText: {
      fontFamily: 'Vazirmatn_500Medium',
      fontSize: 14,
    },
    typeSelector: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
  });

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
            <Text style={[styles.modalTitle, modalTitleStyle]}>{TEXT.history.addSavings}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color={theme.colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Type Selector */}
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
                {TEXT.history.savingsType}
              </Text>
              <View style={dynamicStyles.typeSelector}>
                <TouchableOpacity
                  style={[dynamicStyles.typeButton, moneyTypeButtonStyle]}
                  onPress={() => setSelectedType('money')}
                >
                  <DollarSign
                    size={18}
                    color={
                      selectedType === 'money' ? theme.colors.success : theme.colors.textSecondary
                    }
                  />
                  <Text style={[dynamicStyles.typeButtonText, moneyTypeTextStyle]}>
                    {TEXT.history.money}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.typeButton, goldTypeButtonStyle]}
                  onPress={() => setSelectedType('gold')}
                >
                  <Coins
                    size={18}
                    color={
                      selectedType === 'gold' ? theme.colors.primary : theme.colors.textSecondary
                    }
                  />
                  <Text style={[dynamicStyles.typeButtonText, goldTypeTextStyle]}>
                    {TEXT.history.gold}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Amount Input */}
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
                {selectedType === 'money' ? TEXT.history.amount : TEXT.history.goldAmount}
              </Text>
              <GlassInput
                icon={
                  selectedType === 'money' ? (
                    <DollarSign size={20} color={theme.colors.textSecondary} strokeWidth={2.5} />
                  ) : (
                    <Coins size={20} color={theme.colors.textSecondary} strokeWidth={2.5} />
                  )
                }
                placeholder={
                  selectedType === 'money'
                    ? TEXT.history.amountPlaceholder
                    : TEXT.history.goldAmountPlaceholder
                }
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
              />
            </View>

            {/* Note Input */}
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
                {TEXT.history.note} ({TEXT.history.optional})
              </Text>
              <GlassInput
                placeholder={TEXT.history.notePlaceholder}
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            {/* Save Button */}
            <View style={styles.buttonGroup}>
              <DepthButton
                onPress={handleAddSavings}
                disabled={createSavingsLog.isPending || !amount}
                variant="primary"
                size="large"
              >
                {createSavingsLog.isPending ? TEXT.common.loading : TEXT.common.save}
              </DepthButton>
            </View>
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
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Vazirmatn_500Medium',
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
