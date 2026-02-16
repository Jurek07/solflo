export interface PaymentLink {
  id: string;
  merchant_wallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  title: string;
  description?: string;
  single_use: boolean;
  private_payment: boolean;
  used: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  link_id: string;
  payer_wallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  signature: string;
  is_private: boolean;
  created_at: string;
}
