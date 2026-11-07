import type { Metadata } from 'next';
import Link from 'next/link';
import { RadioTower } from 'lucide-react';
import { AppNavigation } from '@/components/app-navigation';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'IoT Nexus', template: '%s | IoT Nexus' },
  description:
    'Real-time IoT device management and monitoring. Project foundation.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:absolute focus:z-50"
        >
          Skip to content
        </a>
        <header className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-5">
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold tracking-tight"
            >
              <RadioTower aria-hidden="true" className="size-6 text-primary" />
              IoT Nexus
            </Link>
            <AppNavigation />
          </div>
        </header>
        <main id="main" className="mx-auto min-h-[75vh] max-w-6xl px-6 py-12">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl border-t border-border px-6 py-6 text-sm text-muted-foreground">
          IoT Nexus · Project foundation · Phase 0
        </footer>
      </body>
    </html>
  );
}
