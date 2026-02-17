import { PublicKey } from '@solana/web3.js';

// SolFloLab Tikkie-style dark theme
export const COLORS = {
  // Main colors
  primary: '#00D26A',           // SolFloLab green
  primaryDark: '#00B55A',       // Darker green for pressed
  
  // Background gradient
  backgroundDark: '#1A1040',    // Dark purple
  backgroundLight: '#2D1B69',   // Lighter purple
  
  // Card colors
  card: '#3D2A7A',              // Purple cards
  cardLight: '#4A3590',         // Lighter card variant
  
  // Text
  text: '#FFFFFF',              // White text
  textSecondary: '#A8A0C0',     // Light purple/gray
  textMuted: '#6B6190',         // Muted text
  
  // Status
  success: '#00D26A',           // Green
  error: '#FF5252',             // Red
  warning: '#FFB74D',           // Orange
  
  // Other
  white: '#FFFFFF',
  black: '#000000',
  border: '#4A3590',
  overlay: 'rgba(26, 16, 64, 0.9)',
};

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY';

export const APP_NAME = 'SolFloLab';
export const APP_CLUSTER = 'mainnet-beta';
