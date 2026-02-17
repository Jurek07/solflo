import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../contexts/WalletContext';
import { getPaymentLinks } from '../lib/supabase';
import { PaymentLink } from '../types';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  ArrowLeftIcon,
  SearchIcon,
  LinkIcon, 
  CheckIcon, 
  ClockIcon,
  LockIcon,
} from '../components/Icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type FilterType = 'all' | 'pending' | 'paid';

export function SearchScreen({ navigation }: Props) {
  const { publicKey } = useWallet();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<PaymentLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      const data = await getPaymentLinks(publicKey.toBase58());
      setLinks(data);
      setFilteredLinks(data);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    let result = links;

    // Apply filter
    if (filter === 'pending') {
      result = result.filter(link => !link.used);
    } else if (filter === 'paid') {
      result = result.filter(link => link.used);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(link => 
        link.title.toLowerCase().includes(query) ||
        link.amount.toString().includes(query) ||
        link.currency.toLowerCase().includes(query)
      );
    }

    setFilteredLinks(result);
  }, [links, filter, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    return `${day} ${month}`;
  };

  const renderLink = ({ item }: { item: PaymentLink }) => {
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
              {item.used ? (
                <CheckIcon size={18} color={COLORS.primary} />
              ) : (
                <ClockIcon size={18} color={COLORS.textSecondary} />
              )}
              <Text style={[styles.statusText, item.used && styles.statusTextPaid]}>
                {item.used 
                  ? `Paid${isExpired ? ' - expired' : ''}`
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
        <Text style={styles.headerTitle}>Search & Filter</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or amount"
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'pending' && styles.filterPillActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Not paid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'paid' && styles.filterPillActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            Paid
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <FlatList
        data={filteredLinks}
        renderItem={renderLink}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No results found'}
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
    paddingTop: 0,
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
