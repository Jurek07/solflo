export type Currency = 'SOL' | 'USDC';

export interface PaymentLink {
  id: string;
  merchantWallet: string;
  amount: number;
  currency: Currency;
  title: string;
  description?: string;
  singleUse: boolean;
  privatePayment: boolean;
  used: boolean;
  createdAt: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  linkId: string;
  payerWallet: string;
  amount: number;
  currency: Currency;
  signature: string;
  isPrivate: boolean;
  confirmedAt: string;
}
