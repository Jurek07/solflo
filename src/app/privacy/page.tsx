import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Privacy Policy - SolFloLab',
  description: 'Privacy Policy for SolFloLab payment links service',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center">
        <Logo />
        <Link href="/" className="text-[#6B6B6B] hover:text-white transition text-sm">
          ← Back
        </Link>
      </header>

      {/* Content */}
      <section className="flex-1 px-5 py-12 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[#6B6B6B] mb-8">Last updated: February 2026</p>
        
        <div className="space-y-8 text-[#A0A0A0]">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              SolFloLab is a non-custodial payment link service for Solana. We are committed 
              to protecting your privacy. This policy explains what data we collect and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Wallet Addresses:</strong> Public wallet addresses 
                used to create and receive payments. These are public by nature on the Solana blockchain.
              </li>
              <li>
                <strong className="text-white">Payment Link Data:</strong> Amount, currency, title, 
                and description you provide when creating payment links.
              </li>
              <li>
                <strong className="text-white">Transaction Signatures:</strong> On-chain transaction 
                identifiers for completed payments.
              </li>
              <li>
                <strong className="text-white">Analytics:</strong> Anonymous usage data via Vercel 
                Analytics (page views, no personal data).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data We Do NOT Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Personal identification information (name, email, phone)</li>
              <li>IP addresses or precise location data</li>
              <li>Private keys or seed phrases (we never have access to these)</li>
              <li>Cookies for tracking purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Private Payments</h2>
            <p className="mb-3">
              When you enable the <span className="text-[#00D26A]">Private Payment</span> feature:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Payments are routed through the Privacy Cash ZK pool
              </li>
              <li>
                Neither sender nor receiver wallet addresses are visible on-chain
              </li>
              <li>
                We store a placeholder signature instead of the actual transaction
              </li>
              <li>
                Privacy Cash&apos;s own privacy policy applies to their service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Storage</h2>
            <p>
              Payment link data is stored in Supabase (PostgreSQL). We retain this data 
              to display your payment history and link status. You can delete your payment 
              links at any time from your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Non-Custodial</h2>
            <p>
              SolFloLab is fully non-custodial. We never hold, control, or have access to 
              your funds. All payments flow directly from payer to recipient on the Solana 
              blockchain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Supabase:</strong> Database hosting
              </li>
              <li>
                <strong className="text-white">Vercel:</strong> Website hosting and analytics
              </li>
              <li>
                <strong className="text-white">Helius:</strong> Solana RPC provider
              </li>
              <li>
                <strong className="text-white">Privacy Cash:</strong> ZK privacy infrastructure
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions about this policy? Reach out on{' '}
              <a 
                href="https://x.com/SolFloLab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00D26A] hover:underline"
              >
                X/Twitter @SolFloLab
              </a>
            </p>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 py-6 text-center text-sm text-[#6B6B6B] border-t border-[#1A1A1A]">
        <Link href="/" className="hover:text-white transition">
          SolFloLab
        </Link>
      </footer>
    </main>
  );
}
