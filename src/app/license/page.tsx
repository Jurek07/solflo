import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const metadata = {
  title: 'License - SolFloLab',
  description: 'MIT License for SolFloLab',
};

export default function LicensePage() {
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
        <h1 className="text-3xl font-bold mb-8">License</h1>
        
        <div className="prose prose-invert prose-sm">
          <h2 className="text-xl font-semibold text-[#00D26A] mb-4">MIT License</h2>
          
          <p className="text-[#6B6B6B] mb-4">Copyright (c) 2024-2026 SolFloLab</p>
          
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-6 text-sm text-[#A0A0A0] leading-relaxed">
            <p className="mb-4">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the &quot;Software&quot;), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            
            <p className="mb-4">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            
            <p>
              THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">Third-Party Licenses</h2>
          
          <p className="text-[#A0A0A0] mb-4">
            SolFloLab uses the following open-source libraries:
          </p>
          
          <ul className="text-[#A0A0A0] space-y-2">
            <li>
              <strong className="text-white">Next.js</strong> - MIT License
            </li>
            <li>
              <strong className="text-white">Solana Web3.js</strong> - MIT License
            </li>
            <li>
              <strong className="text-white">Privacy Cash SDK</strong> - See{' '}
              <a 
                href="https://privacycash.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#00D26A] hover:underline"
              >
                privacycash.org
              </a>
            </li>
            <li>
              <strong className="text-white">Supabase</strong> - Apache 2.0 License
            </li>
          </ul>
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
