import { useState, useCallback } from 'react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { APP_NAME, APP_CLUSTER } from '../lib/constants';

export interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true }));
    
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
      setState({
        publicKey: pubkey,
        connected: true,
        connecting: false,
      });
      
      return pubkey;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setState(prev => ({ ...prev, connecting: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      publicKey: null,
      connected: false,
      connecting: false,
    });
  }, []);

  const signAndSendTransaction = useCallback(async (transaction: Transaction) => {
    if (!state.publicKey) {
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
  }, [state.publicKey]);

  return {
    ...state,
    connect,
    disconnect,
    signAndSendTransaction,
  };
}
