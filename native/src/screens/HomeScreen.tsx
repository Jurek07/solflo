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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
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
        <Text style={styles.emoji}>💸</Text>
        <Text style={styles.title}>
          Betalen met{'\n'}
          <Text style={styles.highlight}>Solana</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Maak betaallinks en ontvang SOL & USDC{'\n'}direct in je wallet. Geen fees! ✨
        </Text>

        <TouchableOpacity
          style={[styles.button, connecting && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={connecting}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {connecting ? 'Verbinden...' : '🔗 Verbind Wallet'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>0%</Text>
          <Text style={styles.statLabel}>Fees</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>&lt;1s</Text>
          <Text style={styles.statLabel}>Snelheid</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>$0.001</Text>
          <Text style={styles.statLabel}>Netwerk</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureText}>Instant betaallinks</Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>Direct naar je wallet</Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Eenmalig of herbruikbaar</Text>
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
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    paddingBottom: 32,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
