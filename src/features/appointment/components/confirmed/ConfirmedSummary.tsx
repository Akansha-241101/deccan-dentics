import { FadeIn } from "@/components/motion/FadeIn";
import { displayDate, displayTime } from "@/features/appointment/utils/istTime";

export type ConfirmedDetails = { name: string; service: string; date: string; time: string };

// Left column of the confirmation page: status line and booking details.
export function ConfirmedSummary({ details }: { details: ConfirmedDetails }) {
  const rows = [
    ["Name", details.name],
    ["Treatment", details.service],
    ["Date", displayDate(details.date)],
    ["Time", displayTime(details.time)],
  ];
  return (
    // Stays in view on wide screens while the right side scrolls. top-28 clears the fixed header.
    <aside className="lg:sticky lg:top-28">
      <FadeIn>
        <p className="m-0 mb-3 font-script text-2xl text-primary sm:text-3xl">Booking received</p>
        <h1 className="m-0 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Appointment Confirmed</h1>
        <p className="mt-4 mb-0 text-muted-foreground">Your slot is reserved. A confirmation is on its way to your email.</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <dl className="mt-8 mb-0 grid gap-1 border-l border-border pl-5">
          {rows.map(([label, value]) => (
            <div key={label} className="relative py-2.5">
              <span aria-hidden className="absolute top-4 -left-[1.53rem] size-2.5 rounded-full border-2 border-secondary bg-primary" />
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
              <dd className="m-0 mt-1 font-heading text-lg text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </FadeIn>
    </aside>
  );
}
