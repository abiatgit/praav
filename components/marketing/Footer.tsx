import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/shared/Container';

const footerLinks = {
  marketplace: [
    { href: '/browse', label: 'Browse' },
    { href: '/sell', label: 'Sell' },
    { href: '/how-it-works', label: 'How it works' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/cookies', label: 'Cookie policy' },
  ],
};

const socialLinks = [
  { href: '#', label: 'Instagram' },
  { href: '#', label: 'Facebook' },
  { href: '#', label: 'TikTok' },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <div className="relative w-7 h-7">
                  <Image
                    src="/praavlogo.png"
                    alt="praav"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-light tracking-wider">PRAAV</span>
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed">
                A trusted UK marketplace for pre-loved Indian ethnic fashion.
              </p>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-4">MARKETPLACE</h3>
              <ul className="space-y-2">
                {footerLinks.marketplace.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-4">COMPANY</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider mb-4">LEGAL</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 praav. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
