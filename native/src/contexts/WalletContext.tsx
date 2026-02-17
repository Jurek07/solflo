import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_NAME, APP_CLUSTER } from '../lib/constants';

interface WalletContextType {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<PublicKey>;
  disconnect: () => void;
  signAndSendTransaction: (transaction: Transaction) => Promise<string>;
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

      const pubkey = new PublicKey(authResult.accounts[0].address);
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

  const signAndSendTransaction = useCallback(async (transaction: Transaction) => {
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
