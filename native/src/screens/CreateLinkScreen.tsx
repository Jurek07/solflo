import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { createPaymentLink } from '../lib/supabase';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

      Alert.alert('Success', 'Payment link created!', [
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Payment Link</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Invoice #123"
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Amount */}
          <View style={styles.field}>
            <Text style={styles.label}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Currency */}
          <View style={styles.field}>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.currencyRow}>
              <TouchableOpacity
                style={[
                  styles.currencyButton,
                  currency === 'SOL' && styles.currencyButtonActive,
                ]}
                onPress={() => setCurrency('SOL')}
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
                  styles.currencyButton,
                  currency === 'USDC' && styles.currencyButtonActive,
                ]}
                onPress={() => setCurrency('USDC')}
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

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add a note for the payer..."
              placeholderTextColor={COLORS.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Options */}
          <View style={styles.optionsSection}>
            <Text style={styles.sectionTitle}>Options</Text>

            <View style={styles.option}>
              <View>
                <Text style={styles.optionLabel}>Single-use link</Text>
                <Text style={styles.optionDesc}>
                  Expires after one payment
                </Text>
              </View>
              <Switch
                value={singleUse}
                onValueChange={setSingleUse}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.text}
              />
            </View>

            <View style={styles.option}>
              <View>
                <Text style={styles.optionLabel}>🔒 Private Payment</Text>
                <Text style={styles.optionDesc}>
                  Hide sender & receiver (ZK privacy)
                </Text>
              </View>
              <Switch
                value={privatePayment}
                onValueChange={setPrivatePayment}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.text}
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
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.createButtonText}>Create Link</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    color: COLORS.primary,
    fontSize: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  currencyButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  currencyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  currencyTextActive: {
    color: COLORS.primary,
  },
  optionsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  privacyNote: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
  },
  privacyNoteText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
  },
});
