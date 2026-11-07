import type { Metadata } from 'next';
import { PlaceholderPage } from '@/components/placeholder-page';
export const metadata: Metadata = { title: 'Authentication' };
export default function Page() {
  return (
    <PlaceholderPage
      title="Authentication"
      description="Firebase email/password sign-in and organization membership will be added here."
      phase="Phase 1"
    />
  );
}
