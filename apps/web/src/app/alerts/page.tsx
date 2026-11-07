import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/placeholder-page';
export const metadata: Metadata = { title: 'Alerts' };
export default function Page() {
  return (
    <PlaceholderPage
      title="Alerts"
      description="Review threshold alerts, device health, and acknowledgments."
      phase="Phase 5"
    />
  );
}
