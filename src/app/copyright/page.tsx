import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'Copyright - SolFloLab',
  description: 'Copyright information for SolFloLab',
};

export default function CopyrightPage() {
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
        <h1 className="text-3xl font-bold mb-8">Copyright</h1>
        
        <div className="space-y-8 text-[#A0A0A0]">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Copyright Notice</h2>
            <p className="text-lg">
              © 2024-2026 SolFloLab. All rights reserved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Ownership</h2>
            <p>
              SolFloLab, including its name, logo, website design, and original content, 
              is owned by the project creators. The source code is released under the 
              MIT License (see <Link href="/license" className="text-[#00D26A] hover:underline">License</Link>).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Trademarks</h2>
            <p className="mb-3">
              The following are trademarks or service marks of SolFloLab:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>SolFloLab name and logo</li>
              <li>SolFlo name</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Third-Party Trademarks</h2>
            <p>
              Solana, SOL, and the Solana logo are trademarks of Solana Foundation. 
              USDC is a trademark of Circle Internet Financial. All other trademarks 
              are property of their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Open Source</h2>
            <p>
              The SolFloLab codebase is open source and available on{' '}
              <a 
                href="https://github.com/Jurek07/solflo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00D26A] hover:underline"
              >
                GitHub
              </a>
              . You are free to use, modify, and distribute the code under the terms 
              of the MIT License.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Content Usage</h2>
            <p>
              You may not use the SolFloLab name, logo, or branding in a way that 
              suggests endorsement or affiliation without permission. For press 
              inquiries or brand usage requests, contact us on{' '}
              <a 
                href="https://x.com/SolFloLab" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00D26A] hover:underline"
              >
                X/Twitter
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">DMCA</h2>
            <p>
              If you believe your copyrighted work has been used inappropriately, 
              please contact us with details and we will respond promptly.
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
