import { createClient } from '@supabase/supabase-js';
import { PaymentLink, Payment } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Payment Links
export async function createPaymentLink(data: {
  merchantWallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  title: string;
  description?: string;
  singleUse: boolean;
}): Promise<PaymentLink | null> {
  const { data: link, error } = await supabase
    .from('payment_links')
    .insert({
      merchant_wallet: data.merchantWallet,
      amount: data.amount,
      currency: data.currency,
      title: data.title,
      description: data.description,
      single_use: data.singleUse,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment link:', error);
    return null;
  }

  return transformLink(link);
}

export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  const { data: link, error } = await supabase
    .from('payment_links')
    .select('*, payments(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching payment link:', error);
    return null;
  }

  return transformLink(link);
}

export async function getPaymentLinksByWallet(wallet: string): Promise<PaymentLink[]> {
  const { data: links, error } = await supabase
    .from('payment_links')
    .select('*, payments(*)')
    .eq('merchant_wallet', wallet)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment links:', error);
    return [];
  }

  return links.map(transformLink);
}

export async function deletePaymentLink(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('payment_links')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment link:', error);
    return false;
  }

  return true;
}

// Payments
export async function recordPayment(data: {
  linkId: string;
  payerWallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  signature: string;
}): Promise<Payment | null> {
  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      link_id: data.linkId,
      payer_wallet: data.payerWallet,
      amount: data.amount,
      currency: data.currency,
      signature: data.signature,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    return null;
  }

  // If single-use, mark the link as used
  await supabase
    .from('payment_links')
    .update({ used: true })
    .eq('id', data.linkId)
    .eq('single_use', true);

  return transformPayment(payment);
}

// Transform database records to app types
function transformLink(record: any): PaymentLink {
  return {
    id: record.id,
    merchantWallet: record.merchant_wallet,
    amount: record.amount,
    currency: record.currency,
    title: record.title,
    description: record.description,
    singleUse: record.single_use,
    used: record.used,
    createdAt: record.created_at,
    payments: record.payments?.map(transformPayment) || [],
  };
}

function transformPayment(record: any): Payment {
  return {
    id: record.id,
    linkId: record.link_id,
    payerWallet: record.payer_wallet,
    amount: record.amount,
    currency: record.currency,
    signature: record.signature,
    confirmedAt: record.created_at,
  };
}
