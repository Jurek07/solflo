import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { getPaymentLink, markLinkAsUsed, recordPayment } from '../lib/supabase';
import { PaymentLink } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ Pay: { linkId: string } }, 'Pay'>;
};

export function PayScreen({ navigation, route }: Props) {
  const { linkId } = route.params;
  const { publicKey, connected, connecting, connect, signAndSendTransaction } = useWallet();
  
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLink();
  }, [linkId]);

  const fetchLink = async () => {
    try {
      const data = await getPaymentLink(linkId);
      if (!data) {
        setError('Betaallink niet gevonden 🔍');
      } else if (data.used && data.single_use) {
        setError('Deze link is al gebruikt ✓');
      } else {
        setLink(data);
      }
    } catch (err) {
      setError('Kon de link niet laden 😢');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      Alert.alert('Oeps! 😅', 'Kon niet verbinden met wallet');
    }
  };

  const handlePay = async () => {
    if (!link || !publicKey) return;

    setPaying(true);

    try {
      const { buildPaymentTransaction } = await import('../lib/transactions');
      
      const transaction = await buildPaymentTransaction({
        payerPublicKey: publicKey,
        recipientAddress: link.merchant_wallet,
        amount: link.amount,
        currency: link.currency,
      });

      const signature = await signAndSendTransaction(transaction);

      await recordPayment({
        link_id: link.id,
        payer_wallet: publicKey.toBase58(),
        amount: link.amount,
        currency: link.currency,
        signature: signature,
        is_private: false,
      });

      if (link.single_use) {
        await markLinkAsUsed(link.id);
      }

      setPaid(true);
    } catch (err: any) {
      console.error('Payment failed:', err);
      Alert.alert('Oeps! 😢', err.message || 'Betaling mislukt');
    } finally {
      setPaying(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Even laden... ⏳</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Terug</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (paid) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.center}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Betaald!</Text>
          <Text style={styles.successSubtitle}>
            {link?.amount} {link?.currency} verstuurd
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Top! 👍</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Payment form
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={styles.logoSol}>Sol</Text>
          <Text style={styles.logoFlo}>Flo</Text>
          <Text style={styles.logoLab}>Lab</Text>
        </Text>
      </View>

      {/* Payment Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>💸</Text>
            <Text style={styles.cardLabel}>Betaalverzoek</Text>
          </View>
          
          <Text style={styles.cardTitle}>{link?.title}</Text>
          
          {link?.description && (
            <Text style={styles.cardDescription}>{link.description}</Text>
          )}

          <View style={styles.amountBox}>
            <Text style={styles.amount}>{link?.amount}</Text>
            <Text style={styles.currency}>{link?.currency}</Text>
          </View>

          {link?.private_payment && (
            <View style={styles.privacyBadge}>
              <Text style={styles.privacyBadgeText}>🔒 Privé betaling</Text>
              <Text style={styles.privacyFee}>
                +0.008 SOL + 0.35% privacy fee
              </Text>
            </View>
          )}

          <View style={styles.recipient}>
            <Text style={styles.recipientLabel}>Naar</Text>
            <Text style={styles.recipientAddress}>
              {link?.merchant_wallet.slice(0, 8)}...{link?.merchant_wallet.slice(-8)}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {!connected ? (
          <TouchableOpacity
            style={[styles.primaryButton, connecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={connecting}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {connecting ? 'Verbinden...' : '🔗 Verbind wallet om te betalen'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, paying && styles.buttonDisabled]}
            onPress={handlePay}
            disabled={paying}
            activeOpacity={0.8}
          >
            {paying ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Betaal {link?.amount} {link?.currency} 💳
              </Text>
            )}
          </TouchableOpacity>
        )}

        {connected && (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>
              👛 {publicKey?.toBase58().slice(0, 8)}...
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by SolFloLab ⚡ Non-custodial
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  successEmoji: {
    fontSize: 100,
    marginBottom: 20,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  logoSol: {
    color: COLORS.text,
  },
  logoFlo: {
    color: COLORS.primary,
  },
  logoLab: {
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: COLORS.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  amount: {
    color: COLORS.text,
    fontSize: 52,
    fontWeight: 'bold',
  },
  currency: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 10,
  },
  privacyBadge: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  privacyBadgeText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  privacyFee: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  recipient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  recipientLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  recipientAddress: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 160,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  connectedBadge: {
    alignItems: 'center',
    marginTop: 20,
  },
  connectedText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
