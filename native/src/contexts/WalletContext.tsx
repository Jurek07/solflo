import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_NAME, APP_CLUSTER } from '../lib/constants';

// Helper to convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<PublicKey>;
  disconnect: () => void;
  signAndSendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connected = publicKey !== null;

  const connect = useCallback(async () => {
    setConnecting(true);
    
    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        const authorizationResult = await wallet.authorize({
          cluster: APP_CLUSTER,
          identity: {
            name: APP_NAME,
            uri: 'https://solflolab.com',
            icon: 'favicon.ico',
          },
        });
        return authorizationResult;
      });

      // The address may come as base64 bytes or base58 string
      const addressData = authResult.accounts[0].address;
      let pubkey: PublicKey;
      
      if (typeof addressData === 'string' && addressData.length === 44) {
        // Likely base64 encoded (44 chars = 32 bytes in base64)
        try {
          const bytes = base64ToBytes(addressData);
          pubkey = new PublicKey(bytes);
        } catch {
          // Fallback to treating as base58
          pubkey = new PublicKey(addressData);
        }
      } else if (addressData instanceof Uint8Array) {
        pubkey = new PublicKey(addressData);
      } else {
        // Assume base58 string
        pubkey = new PublicKey(addressData);
      }
      setPublicKey(pubkey);
      setConnecting(false);
      
      return pubkey;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setConnecting(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const signAndSendTransaction = useCallback(async (transaction: Transaction | VersionedTransaction) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const signature = await transact(async (wallet: Web3MobileWallet) => {
      await wallet.authorize({
        cluster: APP_CLUSTER,
        identity: {
          name: APP_NAME,
          uri: 'https://solflolab.com',
          icon: 'favicon.ico',
        },
      });

      const signedTransactions = await wallet.signAndSendTransactions({
        transactions: [transaction],
      });

      return signedTransactions[0];
    });

    return signature;
  }, [publicKey]);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        connect,
        disconnect,
        signAndSendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
