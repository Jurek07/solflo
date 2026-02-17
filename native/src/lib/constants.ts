import { PublicKey } from '@solana/web3.js';

// Tikkie-inspired light theme
export const COLORS = {
  primary: '#00C853',        // Tikkie green
  primaryDark: '#00A344',    // Darker green for pressed states
  background: '#F5F5F5',     // Light gray background
  white: '#FFFFFF',          // Pure white for cards
  card: '#FFFFFF',           // White cards
  border: '#E8E8E8',         // Subtle borders
  text: '#1A1A1A',           // Dark text
  textSecondary: '#757575',  // Gray secondary text
  error: '#FF5252',          // Friendly red
  success: '#00C853',        // Green for success
  shadow: '#000000',         // For shadows
};

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY';

export const APP_NAME = 'SolFloLab';
export const APP_CLUSTER = 'mainnet-beta';
