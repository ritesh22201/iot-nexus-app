import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/placeholder-page';
export const metadata: Metadata = { title: 'Dashboard' };
export default function Page() {
  return (
    <PlaceholderPage
      title="Dashboard"
      description="Device status, live telemetry, and operational metrics will appear here once authorized data subscriptions are implemented."
      phase="Phase 3"
    />
  );
}
