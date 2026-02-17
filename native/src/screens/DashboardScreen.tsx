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
        message: `Pay ${link.amount} ${link.currency} - ${link.title}\n${url}`,
        url,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDelete = (link: PaymentLink) => {
    Alert.alert(
      'Delete Payment Link',
      `Are you sure you want to delete "${link.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentLink(link.id);
              setLinks(links.filter(l => l.id !== link.id));
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Error', 'Failed to delete payment link');
            }
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect?',
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

  const renderLink = ({ item }: { item: PaymentLink }) => (
    <View style={styles.linkCard}>
      <View style={styles.linkHeader}>
        <Text style={styles.linkTitle}>{item.title}</Text>
        <View style={[styles.badge, item.used && styles.badgeUsed]}>
          <Text style={styles.badgeText}>
            {item.used ? 'Used' : 'Active'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.linkAmount}>
        {item.amount} {item.currency}
      </Text>
      
      {item.description && (
        <Text style={styles.linkDescription}>{item.description}</Text>
      )}
      
      <View style={styles.linkFooter}>
        <View style={styles.linkTags}>
          {item.single_use && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>Single-use</Text>
            </View>
          )}
          {item.private_payment && (
            <View style={[styles.tag, styles.tagPrivate]}>
              <Text style={styles.tagText}>🔒 Private</Text>
            </View>
          )}
        </View>
        
        <View style={styles.linkActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const walletAddress = publicKey?.toBase58() || '';
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>
            <Text style={styles.logoSol}>Sol</Text>
            <Text style={styles.logoFlo}>Flo</Text>
            <Text style={styles.logoLab}>Lab</Text>
          </Text>
        </View>
        
        <TouchableOpacity style={styles.walletButton} onPress={handleDisconnect}>
          <Text style={styles.walletText}>{shortAddress}</Text>
        </TouchableOpacity>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateLink')}
      >
        <Text style={styles.createButtonText}>+ Create Payment Link</Text>
      </TouchableOpacity>

      {/* Links List */}
      <FlatList
        data={links}
        renderItem={renderLink}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No payment links yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              Create your first link to get started
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 48 : 60,
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
  walletButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  walletText: {
    color: COLORS.text,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  linkCard: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  linkHeader: {
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
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeUsed: {
    backgroundColor: COLORS.textSecondary + '20',
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  linkAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  linkDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  linkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPrivate: {
    backgroundColor: COLORS.primary + '20',
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
