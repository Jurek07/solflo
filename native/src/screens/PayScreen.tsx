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
      Alert.alert('Connection Failed', 'Could not connect to wallet');
    }
  };

  const handlePay = async () => {
    if (!link || !publicKey) return;

    setPaying(true);

    try {
      // Import transaction builder
      const { buildPaymentTransaction } = await import('../lib/transactions');
      
      // Build the transaction
      const transaction = await buildPaymentTransaction({
        payerPublicKey: publicKey,
        recipientAddress: link.merchant_wallet,
        amount: link.amount,
        currency: link.currency,
      });

      // Sign and send
      const signature = await signAndSendTransaction(transaction);

      // Record payment in database
      await recordPayment({
        link_id: link.id,
        payer_wallet: publicKey.toBase58(),
        amount: link.amount,
        currency: link.currency,
        signature: signature,
        is_private: false,
      });

      // Mark link as used if single-use
      if (link.single_use) {
        await markLinkAsUsed(link.id);
      }

      setPaid(true);
    } catch (err: any) {
      console.error('Payment failed:', err);
      Alert.alert('Payment Failed', err.message || 'Transaction could not be completed');
    } finally {
      setPaying(false);
    }
  };

  const viewOnExplorer = (signature: string) => {
    Linking.openURL(`https://solscan.io/tx/${signature}`);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Success state
  if (paid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Complete!</Text>
          <Text style={styles.successSubtitle}>
            {link?.amount} {link?.currency} sent successfully
          </Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Payment form
  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.cardLabel}>Payment Request</Text>
          <Text style={styles.cardTitle}>{link?.title}</Text>
          
          {link?.description && (
            <Text style={styles.cardDescription}>{link.description}</Text>
          )}

          <View style={styles.amountContainer}>
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
            <Text style={styles.recipientLabel}>To:</Text>
            <Text style={styles.recipientAddress}>
              {link?.merchant_wallet.slice(0, 8)}...{link?.merchant_wallet.slice(-8)}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        {!connected ? (
          <TouchableOpacity
            style={[styles.button, connecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={connecting}
          >
            <Text style={styles.buttonText}>
              {connecting ? 'Connecting...' : 'Connect Wallet to Pay'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, paying && styles.buttonDisabled]}
            onPress={handlePay}
            disabled={paying}
          >
            {paying ? (
              <ActivityIndicator color={COLORS.background} />
            ) : (
              <Text style={styles.buttonText}>
                Pay {link?.amount} {link?.currency}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {connected && (
          <Text style={styles.connectedAs}>
            Connected: {publicKey?.toBase58().slice(0, 8)}...
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by SolFloLab • Non-custodial
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
    padding: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 32,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 16 : 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  cardLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  amount: {
    color: COLORS.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  currency: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 8,
  },
  privacyBadge: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  privacyBadgeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  privacyFee: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  recipient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  recipientAddress: {
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  connectedAs: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
