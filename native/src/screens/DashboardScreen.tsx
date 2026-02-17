import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../contexts/WalletContext';
import { getPaymentLinks } from '../lib/supabase';
import { PaymentLink } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  LinkIcon, 
  PlusIcon, 
  CheckIcon, 
  ClockIcon, 
  SearchIcon, 
  WalletIcon,
  CameraIcon,
  LockIcon,
} from '../components/Icons';
import * as Linking from 'expo-linking';

const LogoHeader = require('../../assets/logo-header.png');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function DashboardScreen({ navigation }: Props) {
  const { publicKey, disconnect } = useWallet();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLinks = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      const data = await getPaymentLinks(publicKey.toBase58());
      setLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLinks();
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect?',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            disconnect();
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    return `${day} ${month}`;
  };

  const renderLink = ({ item }: { item: PaymentLink }) => {
    // Count payments (we'll need to fetch this - for now show based on 'used' flag)
    const paymentCount = item.used ? 1 : 0;
    const isExpired = item.used && item.single_use;

    return (
      <TouchableOpacity 
        style={styles.linkCard}
        onPress={() => navigation.navigate('LinkDetail', { linkId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.linkIcon}>
          {item.private_payment ? (
            <LockIcon size={28} color={COLORS.textSecondary} />
          ) : (
            <LinkIcon size={28} color={COLORS.textSecondary} />
          )}
        </View>
        
        <View style={styles.linkContent}>
          <View style={styles.linkTop}>
            <Text style={styles.linkTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.linkDate}>{formatDate(item.created_at)}</Text>
          </View>
          
          <View style={styles.linkBottom}>
            <View style={styles.statusBadge}>
              {paymentCount > 0 ? (
                <CheckIcon size={18} color={COLORS.primary} />
              ) : (
                <ClockIcon size={18} color={COLORS.textSecondary} />
              )}
              <Text style={[styles.statusText, paymentCount > 0 && styles.statusTextPaid]}>
                {paymentCount > 0 
                  ? `Paid ${paymentCount}x${isExpired ? ' - expired' : ''}`
                  : 'Pending'
                }
              </Text>
            </View>
            <Text style={styles.linkAmount}>
              {item.amount} {item.currency}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const walletAddress = publicKey?.toBase58() || '';

  return (
    <LinearGradient
      colors={[COLORS.backgroundDark, COLORS.backgroundLight]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => Linking.openURL('camera://')}
          >
            <CameraIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <Image source={LogoHeader} style={styles.headerLogo} resizeMode="contain" />
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Search')}
          >
            <SearchIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDisconnect}>
            <WalletIcon size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Links List */}
      <FlatList
        data={links}
        renderItem={renderLink}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinkIcon size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No payment links yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Create your first link and share it!
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLink')}
        activeOpacity={0.9}
      >
        <PlusIcon size={28} color={COLORS.white} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 16,
    position: 'relative',
  },
  headerLeft: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    flexDirection: 'row',
  },
  headerLogo: {
    height: 55,
    width: 170,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  linkCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  linkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  linkContent: {
    flex: 1,
  },
  linkTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  linkDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  statusTextPaid: {
    color: COLORS.text,
  },
  linkAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
