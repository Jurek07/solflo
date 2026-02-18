import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';

const LogoHeader = require('../../assets/logo-header.png');
import { useWallet } from '../contexts/WalletContext';
import { COLORS } from '../lib/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletIcon, LinkIcon, LockIcon } from '../components/Icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function HomeScreen({ navigation }: Props) {
  const { connected, connecting, connect } = useWallet();

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
    <View style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogoText}>
          <Text style={styles.headerLogoSol}>Sol</Text>
          <Text style={styles.headerLogoFlo}>Flo</Text>
          <Text style={styles.headerLogoLab}>Lab</Text>
        </Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>
          Payment links{'\n'}for <Text style={styles.highlight}>Solana</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Accept SOL & USDC. No fees.{'\n'}Direct to your wallet.
        </Text>

        <TouchableOpacity
          style={[styles.button, connecting && styles.buttonDisabled]}
          onPress={handleConnect}
          disabled={connecting}
          activeOpacity={0.9}
        >
          <WalletIcon size={22} color={COLORS.white} />
          <Text style={styles.buttonText}>
            {connecting ? 'Connecting...' : 'Connect Wallet'}
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
          <Text style={styles.statLabel}>Settlement</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>$0.001</Text>
          <Text style={styles.statLabel}>Network</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <LinkIcon size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Instant links</Text>
        </View>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <WalletIcon size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Non-custodial</Text>
        </View>
        
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <LockIcon size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>ZK Privacy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 60,
    paddingBottom: 16,
  },
  headerLogoText: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  headerLogoSol: {
    color: COLORS.text,
  },
  headerLogoFlo: {
    color: COLORS.primary,
  },
  headerLogoLab: {
    color: COLORS.text,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
  },
  highlight: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
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
    fontSize: 26,
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
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
