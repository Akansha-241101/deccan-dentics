import { CalendarCheck2, Phone, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";

const STEPS = [
  { icon: CalendarCheck2, title: "Your slot is held", text: "No one else can book this time. The details are in your confirmation email." },
  { icon: Phone, title: "We may call you", text: "Our team may call to confirm the visit and the branch that suits you." },
  { icon: Stethoscope, title: "Your visit", text: "Arrive a few minutes early and bring any recent dental reports or X-rays." },
] as const;

// Right column of the confirmation page: what happens next, and how to reach the clinic.
export function ConfirmedNextSteps() {
  return (
    <div className="rounded-3xl border border-border bg-background p-6 md:p-8">
      <p className="m-0 font-script text-2xl text-primary sm:text-3xl">What happens next</p>
      <ol className="mt-6 grid list-none gap-5 p-0">
        {STEPS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon aria-hidden className="size-5" />
            </span>
            <div>
              <p className="m-0 font-heading font-bold text-foreground">{title}</p>
              <p className="m-0 mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
        <a href={BRAND.phoneHref}>
          <Button size="lg">Call {BRAND.phone}</Button>
        </a>
        <Link href={ROUTES.home}>
          <Button size="lg" variant="outline">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
