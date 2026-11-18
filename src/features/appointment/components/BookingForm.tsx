"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateBooking } from "@/features/appointment/utils/validateBooking";
import { useBooking } from "@/features/appointment/hooks/useBooking";
import { useShowToast } from "@/hooks/useShowToast";
import type { BookingSlot } from "@/features/appointment/types/booking";
import type { PatientGender } from "@/types/admin/patient";
import { SlotDialog } from "./SlotDialog";
import { SlotTrigger } from "./SlotTrigger";
import { ConsentCheckbox } from "@/components/shared/ConsentCheckbox";

const GENDERS: PatientGender[] = ["Female", "Male"];
const EMPTY = { service: "", name: "", email: "", age: "", gender: "", phone: "" };

// The website booking form. The details are checked here, then useBooking saves the booking.
type BookingFormProps = {
  visitMinutes: number;
  /** Working hours as a sentence, from dd_schedule_slots. */
  hours: string;
  /** From dd_services. */
  services: string[];
};

export function BookingForm({ visitMinutes, hours, services }: BookingFormProps) {
  const { book, busy, error } = useBooking();
  const showToast = useShowToast();
  const [fields, setFields] = useState(EMPTY);
  const [slot, setSlot] = useState<BookingSlot | null>(null);
  const [slotOpen, setSlotOpen] = useState(false);
  // The calendar reads today's date, so it first renders on click, not during prerender.
  const [calendarUsed, setCalendarUsed] = useState(false);
  // Consent is never pre-ticked (brief §5.1, DPDP).
  const [consent, setConsent] = useState(false);
  const update = (key: keyof typeof EMPTY) => (value: string) => setFields((f) => ({ ...f, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!consent) {
      showToast({ title: "Please tick the consent box", description: "We need your consent to use your details for this booking.", type: "error" });
      return;
    }
    const checked = validateBooking({ ...fields, ...slot }, services);
    if (typeof checked === "string") {
      showToast({ title: "Please check your details", description: checked, type: "error" });
      return;
    }
    book(checked);
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-4">
      {error ? <p role="alert" className="m-0 rounded-lg bg-alert-bg px-4 py-3 text-sm text-alert-text">{error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="booking-service">Service</Label>
        <Select items={services.map((s) => ({ label: s, value: s }))} value={fields.service || null} onValueChange={(v) => update("service")(String(v ?? ""))}>
          <SelectTrigger id="booking-service" className="w-full"><SelectValue placeholder="Select a service" /></SelectTrigger>
          <SelectContent>
            {services.map((s) => <SelectItem key={s} value={s} className="whitespace-normal">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="booking-name">Full name</Label>
          <Input id="booking-name" autoComplete="name" maxLength={80} placeholder="Your name" value={fields.name} onChange={(e) => update("name")(e.target.value)} />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="booking-email">Email address</Label>
          <Input id="booking-email" type="email" autoComplete="email" maxLength={120} placeholder="you@example.com" value={fields.email} onChange={(e) => update("email")(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="booking-age">Age</Label>
          <Input id="booking-age" type="number" inputMode="numeric" min={1} max={120} placeholder="Years" value={fields.age} onChange={(e) => update("age")(e.target.value)} />
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="booking-gender">Gender</Label>
          <Select items={GENDERS.map((g) => ({ label: g, value: g }))} value={fields.gender || null} onValueChange={(v) => update("gender")(String(v ?? ""))}>
            <SelectTrigger id="booking-gender" className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="booking-mobile">Mobile number</Label>
        <Input id="booking-mobile" type="tel" inputMode="numeric" autoComplete="tel" maxLength={13} placeholder="10-digit number" value={fields.phone} onChange={(e) => update("phone")(e.target.value)} />
      </div>
      <SlotTrigger slot={slot} onOpen={() => { setCalendarUsed(true); setSlotOpen(true); }} />
      <p className="m-0 text-sm leading-relaxed text-muted-foreground">
        Each visit is booked for {visitMinutes} minutes. Clinic hours (IST): {hours}.
      </p>
      <ConsentCheckbox id="booking-consent" checked={consent} onChange={setConsent} />
      <Button type="submit" size="xl" disabled={busy} className="w-full sm:w-auto">
        {busy ? "Booking…" : "Book appointment"}
      </Button>
      <p className="m-0 text-sm leading-relaxed text-muted-foreground">You&apos;ll get a confirmation by email. Our team may call to confirm your visit.</p>
      {calendarUsed ? <SlotDialog open={slotOpen} onOpenChange={setSlotOpen} onConfirm={setSlot} /> : null}
    </form>
  );
}
