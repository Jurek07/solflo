import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaymentLink, Payment } from '@/types';
import { nanoid } from 'nanoid';

interface Store {
  // Payment links by merchant wallet
  links: Record<string, PaymentLink[]>;
  
  // Actions
  createLink: (merchantWallet: string, data: {
    amount: number;
    currency: 'SOL' | 'USDC';
    title: string;
    description?: string;
  }) => PaymentLink;
  
  getLink: (linkId: string) => PaymentLink | undefined;
  getLinksByWallet: (wallet: string) => PaymentLink[];
  
  recordPayment: (linkId: string, payment: Omit<Payment, 'id' | 'linkId'>) => void;
  deleteLink: (linkId: string, merchantWallet: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      links: {},

      createLink: (merchantWallet, data) => {
        const link: PaymentLink = {
          id: nanoid(10),
          merchantWallet,
          amount: data.amount,
          currency: data.currency,
          title: data.title,
          description: data.description,
          createdAt: new Date().toISOString(),
          payments: [],
        };

        set((state) => ({
          links: {
            ...state.links,
            [merchantWallet]: [...(state.links[merchantWallet] || []), link],
          },
        }));

        return link;
      },

      getLink: (linkId) => {
        const allLinks = Object.values(get().links).flat();
        return allLinks.find((l) => l.id === linkId);
      },

      getLinksByWallet: (wallet) => {
        return get().links[wallet] || [];
      },

      recordPayment: (linkId, paymentData) => {
        const payment: Payment = {
          id: nanoid(10),
          linkId,
          ...paymentData,
        };

        set((state) => {
          const newLinks = { ...state.links };
          for (const wallet in newLinks) {
            newLinks[wallet] = newLinks[wallet].map((link) =>
              link.id === linkId
                ? { ...link, payments: [...link.payments, payment] }
                : link
            );
          }
          return { links: newLinks };
        });
      },

      deleteLink: (linkId, merchantWallet) => {
        set((state) => ({
          links: {
            ...state.links,
            [merchantWallet]: state.links[merchantWallet]?.filter(
              (l) => l.id !== linkId
            ) || [],
          },
        }));
      },
    }),
    {
      name: 'solflo-storage',
    }
  )
);
