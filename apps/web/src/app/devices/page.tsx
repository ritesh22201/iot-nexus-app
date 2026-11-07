import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/placeholder-page';
export const metadata: Metadata = { title: 'Devices' };
export default function Page() {
  return (
    <PlaceholderPage
      title="Devices"
      description="Register, assign, and manage devices within your organization."
      phase="Phase 1"
    />
  );
}
