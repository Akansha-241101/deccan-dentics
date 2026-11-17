"use client";

import { AppointmentPatientSummary } from "@/components/admin/appointments/AppointmentPatientSummary";
import { APPOINTMENT_STATUS_LABELS } from "@/constants/admin/appointments/statuses";
import type { AppointmentInput } from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";
import { formatDateLabel } from "@/utils/admin/date";
import { formatTimeLabel } from "@/utils/admin/time";

type AppointmentReviewStepProps = {
  value: AppointmentInput;
  patient: Patient | undefined;
};

// The last step of a new appointment: who, when, what, before it is saved.
export function AppointmentReviewStep({ value, patient }: AppointmentReviewStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <AppointmentPatientSummary patient={patient} />

      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-border px-3.5 py-3 text-sm">
        <dt className="text-muted-foreground">When</dt>
        <dd className="m-0 text-foreground">
          {value.date ? formatDateLabel(value.date) : "—"}
          {value.time ? ` · ${formatTimeLabel(value.time)}` : ""}
        </dd>
        <dt className="text-muted-foreground">Service</dt>
        <dd className="m-0 text-foreground">{value.service || "—"}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd className="m-0 text-foreground">{APPOINTMENT_STATUS_LABELS[value.status]}</dd>
        {value.notes ? (
          <>
            <dt className="text-muted-foreground">Notes</dt>
            <dd className="m-0 whitespace-pre-line text-foreground">{value.notes}</dd>
          </>
        ) : null}
      </dl>
    </div>
  );
}
