import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../contexts/WalletContext';
import { createPaymentLink } from '../lib/supabase';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeftIcon, LinkIcon, LockIcon } from '../components/Icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function CreateLinkScreen({ navigation }: Props) {
  const { publicKey } = useWallet();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'SOL' | 'USDC'>('SOL');
  const [description, setDescription] = useState('');
  const [singleUse, setSingleUse] = useState(true);
  const [privatePayment, setPrivatePayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!publicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await createPaymentLink({
        merchant_wallet: publicKey.toBase58(),
        amount: amountNum,
        currency,
        title: title.trim(),
        description: description.trim() || undefined,
        single_use: singleUse,
        private_payment: privatePayment,
      });

      Alert.alert('Success!', 'Payment link created!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to create link:', error);
      Alert.alert('Error', 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeftIcon size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Payment Link</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Dinner, Invoice #123"
                placeholderTextColor={COLORS.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <View style={styles.currencyPicker}>
                  <TouchableOpacity
                    style={[
                      styles.currencyOption,
                      currency === 'SOL' && styles.currencyOptionActive,
                    ]}
                    onPress={() => setCurrency('SOL')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        currency === 'SOL' && styles.currencyTextActive,
                      ]}
                    >
                      SOL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.currencyOption,
                      currency === 'USDC' && styles.currencyOptionActive,
                    ]}
                    onPress={() => setCurrency('USDC')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        currency === 'USDC' && styles.currencyTextActive,
                      ]}
                    >
                      USDC
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Description (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a note for the payer..."
                placeholderTextColor={COLORS.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Options Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Options</Text>

            <View style={styles.option}>
              <View style={styles.optionIcon}>
                <LinkIcon size={22} color={COLORS.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Single-use link</Text>
                <Text style={styles.optionDesc}>
                  Expires after one payment
                </Text>
              </View>
              <Switch
                value={singleUse}
                onValueChange={setSingleUse}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={singleUse ? COLORS.primary : COLORS.textSecondary}
                ios_backgroundColor={COLORS.border}
              />
            </View>

            <View style={[styles.option, styles.optionLast]}>
              <View style={styles.optionIcon}>
                <LockIcon size={22} color={COLORS.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Private Payment</Text>
                <Text style={styles.optionDesc}>
                  Hide sender & receiver (ZK)
                </Text>
              </View>
              <Switch
                value={privatePayment}
                onValueChange={setPrivatePayment}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={privatePayment ? COLORS.primary : COLORS.textSecondary}
                ios_backgroundColor={COLORS.border}
              />
            </View>

            {privatePayment && (
              <View style={styles.privacyNote}>
                <Text style={styles.privacyNoteText}>
                  Privacy fee: 0.008 SOL + 0.35% (paid by sender)
                </Text>
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Link</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
  },
  currencyPicker: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    padding: 4,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  currencyOptionActive: {
    backgroundColor: COLORS.primary,
  },
  currencyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  currencyTextActive: {
    color: COLORS.white,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
    marginRight: 12,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  privacyNote: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  privacyNoteText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
