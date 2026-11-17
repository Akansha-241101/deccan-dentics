import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageShell } from "@/components/layout/PageShell";
import { FadeIn } from "@/components/motion/FadeIn";
import { FloatingTools } from "@/components/motion/FloatingTools";
import { LoadingState } from "@/components/shared/LoadingState";
import { CLINIC } from "@/data/clinic";
import { SECTION_TOOLS } from "@/data/section-tools";
import { BookingForm } from "@/features/appointment/components/BookingForm";
import { getBookingSettings, getServices, getWeeklyHours } from "@/features/appointment/services/bookingConfig";
import { hoursNote } from "@/features/appointment/utils/hours";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: `Book a dental appointment at ${CLINIC.name}, Hyderabad. Pick a treatment, a date and a time that suits you.`,
};

// The visit length, hours and services come from the database, read per request.
async function BookingCard() {
  await connection();
  const [settings, services, weekly] = await Promise.all([getBookingSettings(), getServices(), getWeeklyHours()]);
  return (
    <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
      <p className="font-script text-2xl text-primary sm:text-3xl">Reserve your slot</p>
      <h3 className="mt-2 mb-6 font-heading text-xl font-bold text-foreground">Appointment booking</h3>
      <BookingForm visitMinutes={settings.visitMinutes} hours={hoursNote(weekly)} services={services} />
    </div>
  );
}

export default function BookPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-card py-[var(--section-padding-y)]">
        <FloatingTools tools={[...SECTION_TOOLS.contact]} />
        <div className="relative z-10 mx-auto grid max-w-[var(--container-max)] items-start gap-10 px-[var(--container-padding)] lg:grid-cols-[2fr_3fr] lg:gap-12">
          <FadeIn className="max-w-xl">
            <p className="text-xs font-semibold uppercase text-primary sm:text-sm" style={{ letterSpacing: "var(--tracking-wider)" }}>
              Book appointment
            </p>
            <p className="mt-3 font-script text-2xl text-primary sm:text-3xl">Your smile, your time</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Book your dental visit
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose a treatment and a slot that suits you. We&apos;ll email your confirmation, and our team may call
              to confirm the details. Prefer to talk? Call us on {CLINIC.phone}.
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="min-w-0">
            <Suspense fallback={<LoadingState label="Loading booking details…" className="min-h-96" />}>
              <BookingCard />
            </Suspense>
          </FadeIn>
        </div>
      </section>
    </PageShell>
  );
}
