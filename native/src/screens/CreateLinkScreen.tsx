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
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
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
      Alert.alert('Oeps! 😅', 'Wallet niet verbonden');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Oeps! 😅', 'Voer een titel in');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Oeps! 😅', 'Voer een geldig bedrag in');
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

      Alert.alert('Gelukt! 🎉', 'Je betaallink is aangemaakt!', [
        { text: 'Top!', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Failed to create link:', error);
      Alert.alert('Oeps! 😢', 'Kon de link niet aanmaken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
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
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nieuwe betaallink 💸</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Title */}
            <View style={styles.field}>
              <Text style={styles.label}>Waar is het voor? ✏️</Text>
              <TextInput
                style={styles.input}
                placeholder="bijv. Etentje, Cadeautje..."
                placeholderTextColor={COLORS.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>Bedrag 💰</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textSecondary}
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
              <Text style={styles.label}>Extra info (optioneel) 📝</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Voeg een beschrijving toe..."
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Options Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Opties ⚙️</Text>

            <View style={styles.option}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Eenmalige link 🎯</Text>
                <Text style={styles.optionDesc}>
                  Verloopt na één betaling
                </Text>
              </View>
              <Switch
                value={singleUse}
                onValueChange={setSingleUse}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                thumbColor={singleUse ? COLORS.primary : COLORS.white}
                ios_backgroundColor={COLORS.border}
              />
            </View>

            <View style={[styles.option, styles.optionLast]}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Privé betaling 🔒</Text>
                <Text style={styles.optionDesc}>
                  Verberg verzender & ontvanger
                </Text>
              </View>
              <Switch
                value={privatePayment}
                onValueChange={setPrivatePayment}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                thumbColor={privatePayment ? COLORS.primary : COLORS.white}
                ios_backgroundColor={COLORS.border}
              />
            </View>

            {privatePayment && (
              <View style={styles.privacyNote}>
                <Text style={styles.privacyNoteText}>
                  💡 Privacy fee: 0.008 SOL + 0.35% (betaald door verzender)
                </Text>
              </View>
            )}
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Maak betaallink aan ✨</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  privacyNote: {
    backgroundColor: COLORS.primary + '10',
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
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
