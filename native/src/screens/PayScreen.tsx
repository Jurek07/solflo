import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../contexts/WalletContext';
import { getPaymentLink, markLinkAsUsed, recordPayment } from '../lib/supabase';
import { PaymentLink } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { WalletIcon, CheckIcon, ArrowLeftIcon } from '../components/Icons';

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
        setError('Payment link not found');
      } else if (data.used && data.single_use) {
        setError('This payment link has already been used');
      } else {
        setLink(data);
      }
    } catch (err) {
      setError('Failed to load payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      Alert.alert('Error', 'Could not connect to wallet');
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
      Alert.alert('Error', err.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payment...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <View style={styles.center}>
          <Text style={styles.errorIcon}>✕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Success state
  if (paid) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <View style={styles.center}>
          <View style={styles.successIcon}>
            <CheckIcon size={60} color={COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Payment Complete!</Text>
          <Text style={styles.successSubtitle}>
            {link?.amount} {link?.currency} sent successfully
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Payment form
  return (
    <LinearGradient
      colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>
            <Text style={styles.logoSol}>Sol</Text>
            <Text style={styles.logoFlo}>Flo</Text>
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Payment Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Payment Request</Text>
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
              <Text style={styles.privacyBadgeText}>🔒 Private Payment</Text>
              <Text style={styles.privacyFee}>
                +0.008 SOL + 0.35% privacy fee
              </Text>
            </View>
          )}

          <View style={styles.recipient}>
            <Text style={styles.recipientLabel}>To</Text>
            <Text style={styles.recipientAddress}>
              {link && formatWallet(link.merchant_wallet)}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {!connected ? (
          <TouchableOpacity
            style={[styles.primaryButton, connecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={connecting}
            activeOpacity={0.9}
          >
            <WalletIcon size={22} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {connecting ? 'Connecting...' : 'Connect Wallet to Pay'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, paying && styles.buttonDisabled]}
            onPress={handlePay}
            disabled={paying}
            activeOpacity={0.9}
          >
            {paying ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Pay {link?.amount} {link?.currency}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {connected && (
          <View style={styles.connectedBadge}>
            <WalletIcon size={16} color={COLORS.textSecondary} />
            <Text style={styles.connectedText}>
              {publicKey && formatWallet(publicKey.toBase58())}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by SolFloLab • Non-custodial
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorIcon: {
    fontSize: 60,
    color: COLORS.error,
    marginBottom: 20,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerSpacer: {
    width: 44,
  },
  logoContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSol: {
    color: COLORS.white,
  },
  logoFlo: {
    color: COLORS.backgroundDark,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 28,
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
    backgroundColor: COLORS.cardLight,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  amount: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: 'bold',
  },
  currency: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
  },
  privacyBadge: {
    backgroundColor: COLORS.primary + '15',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 20,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
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
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 160,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  connectedText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
