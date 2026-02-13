import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PaymentLink, Payment } from '@/types';

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (supabase) return supabase;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

// Payment Links
export async function createPaymentLink(data: {
  merchantWallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  title: string;
  description?: string;
  singleUse: boolean;
  privatePayment: boolean;
}): Promise<PaymentLink | null> {
  const { data: link, error } = await getSupabase()
    .from('payment_links')
    .insert({
      merchant_wallet: data.merchantWallet,
      amount: data.amount,
      currency: data.currency,
      title: data.title,
      description: data.description,
      single_use: data.singleUse,
      private_payment: data.privatePayment,
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
  const { data: link, error } = await getSupabase()
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
  const { data: links, error } = await getSupabase()
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
  const { error } = await getSupabase()
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
  isPrivate?: boolean;
  merchantWallet?: string;
}): Promise<Payment | null> {
  const { data: payment, error } = await getSupabase()
    .from('payments')
    .insert({
      link_id: data.linkId,
      payer_wallet: data.isPrivate ? 'private' : data.payerWallet,
      amount: data.amount,
      currency: data.currency,
      signature: data.signature,
      is_private: data.isPrivate || false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error recording payment:', error);
    return null;
  }

  // Log transaction for admin stats (persists even if link is deleted)
  if (data.merchantWallet) {
    await getSupabase()
      .from('transaction_log')
      .insert({
        link_id: data.linkId,
        merchant_wallet: data.merchantWallet,
        payer_wallet: data.isPrivate ? 'private' : data.payerWallet,
        amount: data.amount,
        currency: data.currency,
        signature: data.signature,
        is_private: data.isPrivate || false,
      });
  }

  // If single-use, mark the link as used
  await getSupabase()
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
    privatePayment: record.private_payment || false,
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
    isPrivate: record.is_private || false,
    confirmedAt: record.created_at,
  };
}
