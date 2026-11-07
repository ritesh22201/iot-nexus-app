import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function HomePage() {
  return (
    <section className="max-w-3xl py-12">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-primary">
        Real-time device management
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        A foundation for your connected world.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
        IoT Nexus brings device management, telemetry, and operational
        monitoring into one workspace. The project foundation is ready for
        incremental development.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/dashboard">Open dashboard shell</Link>
        </Button>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Authentication and device connections are planned for upcoming phases.
      </p>
    </section>
  );
}
