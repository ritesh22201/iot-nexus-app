'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  ['Dashboard', '/dashboard'],
  ['Devices', '/devices'],
  ['Telemetry', '/telemetry'],
  ['Alerts', '/alerts'],
  ['Authentication', '/auth'],
] as const;
export function AppNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex flex-wrap gap-1">
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? 'page' : undefined}
          className={cn(
            'rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring',
            pathname === href
              ? 'bg-muted font-semibold text-primary'
              : 'text-muted-foreground',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
