import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useWallet } from '../contexts/WalletContext';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function HomeScreen({ navigation }: Props) {
  const { connected, connecting, connect, publicKey } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  React.useEffect(() => {
    if (connected) {
      navigation.navigate('Dashboard');
    }
  }, [connected, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          <Text style={styles.logoSol}>Sol</Text>
          <Text style={styles.logoFlo}>Flo</Text>
          <Text style={styles.logoLab}>Lab</Text>
        </Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>
          Payment links for{' '}
          <Text style={styles.highlight}>Solana</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Accept SOL & USDC. No fees. Direct to wallet.
        </Text>

        <TouchableOpacity
          style={[styles.button, connecting && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={connecting}
        >
          <Text style={styles.buttonText}>
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0%</Text>
          <Text style={styles.statLabel}>Fees</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>&lt;1s</Text>
          <Text style={styles.statLabel}>Settlement</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>$0.001</Text>
          <Text style={styles.statLabel}>Network cost</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>⚡</Text>
          <View>
            <Text style={styles.featureTitle}>Instant</Text>
            <Text style={styles.featureDesc}>Create links in seconds</Text>
          </View>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <View>
            <Text style={styles.featureTitle}>Non-custodial</Text>
            <Text style={styles.featureDesc}>Funds go directly to your wallet</Text>
          </View>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔗</Text>
          <View>
            <Text style={styles.featureTitle}>Single-use links</Text>
            <Text style={styles.featureDesc}>Auto-expire after payment</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 16 : 20,
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
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  features: {
    padding: 20,
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  featureDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
