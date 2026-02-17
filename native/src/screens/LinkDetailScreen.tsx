import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { getPaymentLink, getPaymentsForLink, deletePaymentLink } from '../lib/supabase';
import { PaymentLink, Payment } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  ClockIcon, 
  ShareIcon, 
  TrashIcon,
  ChevronDownIcon,
} from '../components/Icons';

const LogoIcon = require('../../assets/logo-icon.png');

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ LinkDetail: { linkId: string } }, 'LinkDetail'>;
};

export function LinkDetailScreen({ navigation, route }: Props) {
  const { linkId } = route.params;
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [linkId]);

  const fetchData = async () => {
    try {
      const [linkData, paymentsData] = await Promise.all([
        getPaymentLink(linkId),
        getPaymentsForLink(linkId),
      ]);
      setLink(linkData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      Alert.alert('Error', 'Could not load payment link');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!link) return;
    const url = `https://solflolab.com/pay/${link.id}`;
    try {
      await Share.share({
        message: `Pay ${link.amount} ${link.currency} - ${link.title}\n${url}`,
        url,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Link?',
      'Are you sure you want to delete this payment link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentLink(linkId);
              navigation.goBack();
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Error', 'Could not delete payment link');
            }
          },
        },
      ]
    );
  };

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </LinearGradient>
    );
  }

  if (!link) {
    return (
      <LinearGradient
        colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Payment link not found</Text>
        </View>
      </LinearGradient>
    );
  }

  const payUrl = `https://solflolab.com/pay/${link.id}`;
  const isExpired = link.used && link.single_use;

  return (
    <LinearGradient
      colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeftIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{link.title}</Text>
          <Text style={styles.subtitle}>
            Payment link for {link.amount} {link.currency}
          </Text>
          
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            {payments.length > 0 ? (
              <CheckIcon size={20} color={COLORS.primary} />
            ) : (
              <ClockIcon size={20} color={COLORS.textSecondary} />
            )}
            <Text style={[styles.statusText, payments.length > 0 && styles.statusTextPaid]}>
              {payments.length > 0 
                ? `Paid ${payments.length}x${isExpired ? ' - expired' : ''}`
                : 'Pending'
              }
            </Text>
          </View>
        </View>

        {/* Total Paid Section */}
        {payments.length > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total received</Text>
            <Text style={styles.totalAmount}>{totalPaid} {link.currency}</Text>
          </View>
        )}

        {/* Payments List */}
        {payments.length > 0 && (
          <View style={styles.paymentsSection}>
            {payments.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onPress={() => setExpandedPayment(
                  expandedPayment === payment.id ? null : payment.id
                )}
                activeOpacity={0.8}
              >
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentWallet}>
                    {formatWallet(payment.payer_wallet)}
                  </Text>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>
                      {payment.amount} {payment.currency}
                    </Text>
                    <ChevronDownIcon 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </View>
                </View>
                
                {expandedPayment === payment.id && (
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDetailLabel}>Transaction:</Text>
                    <Text style={styles.paymentDetailValue} numberOfLines={1}>
                      {payment.signature}
                    </Text>
                    <Text style={styles.paymentDetailLabel}>Date:</Text>
                    <Text style={styles.paymentDetailValue}>
                      {new Date(payment.created_at).toLocaleString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrContainer}>
            <QRCode
              value={payUrl}
              size={220}
              backgroundColor={COLORS.white}
              color={COLORS.backgroundDark}
            />
            <Image source={LogoIcon} style={styles.qrLogo} resizeMode="contain" />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          {link.single_use && (
            <Text style={styles.infoText}>
              Single-use link • {isExpired ? 'Expired' : 'Valid until paid'}
            </Text>
          )}
          <Text style={styles.infoText}>
            Receiving to: {formatWallet(link.merchant_wallet)}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>Share Link</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <TrashIcon size={20} color={COLORS.text} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.text,
    fontSize: 18,
  },
  header: {
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
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    fontWeight: '600',
  },
  statusTextPaid: {
    color: COLORS.text,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paymentsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  paymentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentWallet: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
    marginRight: 8,
  },
  paymentDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  paymentDetailValue: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    backgroundColor: COLORS.backgroundLight,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
