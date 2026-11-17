"use client";

import { DatePicker } from "@/components/admin/forms/DatePicker";
import { ChoiceChips } from "@/components/admin/forms/ChoiceChips";
import { TimeSelect } from "@/components/admin/forms/TimeSelect";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/constants/admin/appointments/statuses";
import { useAdminStore } from "@/stores/useAdminStore";
import type { AppointmentInput } from "@/types/admin/appointment";
import type { Patient } from "@/types/admin/patient";

type AppointmentBasicsFieldsProps = {
  value: AppointmentInput;
  patients: Patient[];
  onChange: (next: AppointmentInput) => void;
  onPatientChange: (patientId: string) => void;
  onDateChange: (date: string) => void;
  /** Start times the schedule allows on the chosen date. */
  timeOptions: string[];
  slotError: string | null;
};

export function AppointmentBasicsFields({
  value,
  patients,
  onChange,
  onPatientChange,
  onDateChange,
  timeOptions,
  slotError,
}: AppointmentBasicsFieldsProps) {
  const set = <K extends keyof AppointmentInput>(
    key: K,
    next: AppointmentInput[K],
  ) => onChange({ ...value, [key]: next });
  const patient = patients.find((item) => item.id === value.patientId);
  const services = useAdminStore((s) => s.services);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label>Patient</Label>
        <Select
          value={value.patientId || null}
          onValueChange={(patientId) => {
            if (patientId) onPatientChange(patientId);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose who this is for">
              {patient?.name ?? "Choose who this is for"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {patients.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
                <span className="ml-2 text-xs text-muted-foreground">{item.phone}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {patient ? (
          <p className="m-0 text-xs text-muted-foreground">
            {[patient.gender, patient.age ? `${patient.age} years` : "age and gender not added yet"].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="apt-date">Date</Label>
        <DatePicker id="apt-date" value={value.date} onChange={onDateChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="apt-time">Time</Label>
        <TimeSelect id="apt-time" value={value.time} options={timeOptions} disabled={!value.date || timeOptions.length === 0} onChange={(time) => set("time", time)} />
        {value.date && timeOptions.length === 0 ? (
          <p className="m-0 text-xs text-muted-foreground">Closed or fully booked on this day.</p>
        ) : slotError ? (
          <p className="m-0 text-xs text-alert-text">{slotError}</p>
        ) : null}
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label>Service</Label>
        <Select
          items={services.map((s) => ({ label: s, value: s }))}
          value={value.service || null}
          onValueChange={(service) => {
            if (service) set("service", service);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a service">
              {value.service || "Select a service"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service} value={service} className="whitespace-normal">
                {service}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label>Status</Label>
        <ChoiceChips
          options={APPOINTMENT_STATUSES}
          value={[value.status]}
          labelFor={(status) => APPOINTMENT_STATUS_LABELS[status as AppointmentInput["status"]]}
          onChange={([status]) => set("status", status as AppointmentInput["status"])}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="apt-notes">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="apt-notes"
          rows={3}
          placeholder="Anything to remember for this visit"
          value={value.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || undefined)}
        />
      </div>
    </div>
  );
}
