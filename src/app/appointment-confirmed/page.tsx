import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { LoadingState } from "@/components/shared/LoadingState";
import { ROUTES } from "@/constants/routes";
import { ConfirmedNextSteps } from "@/features/appointment/components/confirmed/ConfirmedNextSteps";
import { ConfirmedSummary } from "@/features/appointment/components/confirmed/ConfirmedSummary";
import { getConfirmedBooking } from "@/features/appointment/services/confirmedDb";

export const metadata: Metadata = {
  title: "Appointment Confirmed",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ appointmentId?: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Reads the booking from the database. An unknown or cancelled one goes back to the booking form.
async function Confirmed({ searchParams }: Props) {
  const { appointmentId = "" } = await searchParams;
  const booking = UUID.test(appointmentId) ? await getConfirmedBooking(appointmentId) : null;
  if (!booking) redirect(ROUTES.appointment);
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1fr_2fr]">
      <ConfirmedSummary details={booking} />
      <ConfirmedNextSteps />
    </div>
  );
}

// Summary on the left, what happens next on the right.
export default function AppointmentConfirmedPage(props: Props) {
  return (
    <PageShell>
      <section className="border-b border-border bg-card py-[var(--section-padding-y)]">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
          <Suspense fallback={<LoadingState label="Loading your booking…" className="min-h-96" />}>
            <Confirmed {...props} />
          </Suspense>
        </div>
      </section>
    </PageShell>
  );
}
