import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/placeholder-page';
export const metadata: Metadata = { title: 'Telemetry' };
export default function Page() {
  return (
    <PlaceholderPage
      title="Telemetry"
      description="Explore historical readings, time windows, and aggregated metrics."
      phase="Phase 4"
    />
  );
}
