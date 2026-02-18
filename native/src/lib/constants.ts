import { PublicKey } from '@solana/web3.js';

// Exact colors from solflolab.com globals.css
export const COLORS = {
  primary: '#00D26A',          // --green
  primaryDark: '#00B35A',      // --green-dark

  background: '#000000',       // --bg
  card: '#0A0A0A',             // --card
  cardLight: '#111111',        // slightly lighter card
  border: '#1A1A1A',           // --border

  text: '#FFFFFF',             // --text
  textSecondary: '#6B6B6B',    // --text-secondary
  textMuted: '#444444',        // extra muted

  error: '#E85454',            // --red
  success: '#00D26A',          // --green

  white: '#FFFFFF',
  black: '#000000',
  shadow: '#000000',
};

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const RPC_ENDPOINT = 'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY';

export const APP_NAME = 'SolFloLab';
export const APP_CLUSTER = 'mainnet-beta';
