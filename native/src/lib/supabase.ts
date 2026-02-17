import { createClient } from '@supabase/supabase-js';
import { PaymentLink, Payment } from '../types';

const SUPABASE_URL = 'https://oraqsjmlbyhouaontlab.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yYXFzam1sYnlob3Vhb250bGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NzQ2ODcsImV4cCI6MjA4NjU1MDY4N30.2f0hgV7yksSO2MA0nZFyWuUDR4G_36y9jCTiYNvc9hY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getPaymentLinks(walletAddress: string): Promise<PaymentLink[]> {
  const { data, error } = await supabase
    .from('payment_links')
    .select('*')
    .eq('merchant_wallet', walletAddress)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPaymentLink(id: string): Promise<PaymentLink | null> {
  const { data, error } = await supabase
    .from('payment_links')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createPaymentLink(link: Omit<PaymentLink, 'id' | 'created_at' | 'used'>): Promise<PaymentLink> {
  const { data, error } = await supabase
    .from('payment_links')
    .insert([{ ...link, used: false }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markLinkAsUsed(id: string): Promise<void> {
  const { error } = await supabase
    .from('payment_links')
    .update({ used: true })
    .eq('id', id);

  if (error) throw error;
}

export async function recordPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPaymentsForLink(linkId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
