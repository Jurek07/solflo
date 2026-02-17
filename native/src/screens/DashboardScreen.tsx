import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { getPaymentLinks, deletePaymentLink } from '../lib/supabase';
import { PaymentLink } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const handleShare = async (link: PaymentLink) => {
    const url = `https://solflolab.com/pay/${link.id}`;
    try {
      await Share.share({
        message: `💸 Betaal ${link.amount} ${link.currency} - ${link.title}\n${url}`,
        url,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDelete = (link: PaymentLink) => {
    Alert.alert(
      'Link verwijderen? 🗑️',
      `Weet je zeker dat je "${link.title}" wilt verwijderen?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentLink(link.id);
              setLinks(links.filter(l => l.id !== link.id));
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Oeps!', 'Kon de link niet verwijderen');
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Uitloggen? 👋',
      'Weet je zeker dat je wilt uitloggen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Uitloggen',
          style: 'destructive',
          onPress: () => {
            disconnect();
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  const renderLink = ({ item }: { item: PaymentLink }) => (
    <View style={styles.linkCard}>
      <View style={styles.linkHeader}>
        <View style={styles.linkTitleRow}>
          <Text style={styles.linkEmoji}>{item.private_payment ? '🔒' : '💳'}</Text>
          <Text style={styles.linkTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={[styles.badge, item.used && styles.badgeUsed]}>
          <Text style={[styles.badgeText, item.used && styles.badgeTextUsed]}>
            {item.used ? 'Betaald ✓' : 'Actief'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.linkAmount}>
        {item.amount} <Text style={styles.linkCurrency}>{item.currency}</Text>
      </Text>
      
      {item.description && (
        <Text style={styles.linkDescription} numberOfLines={2}>{item.description}</Text>
      )}
      
      <View style={styles.linkFooter}>
        <View style={styles.linkTags}>
          {item.single_use && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Eenmalig</Text>
            </View>
          )}
        </View>
        
        <View style={styles.linkActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.shareButtonText}>Delen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const walletAddress = publicKey?.toBase58() || '';
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hoi! 👋</Text>
          <Text style={styles.logo}>
            <Text style={styles.logoSol}>Sol</Text>
            <Text style={styles.logoFlo}>Flo</Text>
            <Text style={styles.logoLab}>Lab</Text>
          </Text>
        </View>
        
        <TouchableOpacity style={styles.walletButton} onPress={handleDisconnect} activeOpacity={0.7}>
          <Text style={styles.walletText}>{shortAddress}</Text>
          <Text style={styles.walletIcon}>👛</Text>
        </TouchableOpacity>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateLink')}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonIcon}>➕</Text>
        <Text style={styles.createButtonText}>Nieuwe betaallink</Text>
      </TouchableOpacity>

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
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Laden...' : 'Nog geen betaallinks'}
            </Text>
            <Text style={styles.emptySubtext}>
              Maak je eerste link en deel 'm!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : 20,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  logo: {
    fontSize: 26,
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
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  walletText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  walletIcon: {
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  linkCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  linkEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  linkTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeUsed: {
    backgroundColor: COLORS.textSecondary + '15',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextUsed: {
    color: COLORS.textSecondary,
  },
  linkAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  linkCurrency: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  linkDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  linkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  linkTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  linkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shareButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});
