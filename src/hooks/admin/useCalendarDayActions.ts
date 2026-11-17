"use client";

import { useState } from "react";
import { useConfirmDialog } from "@/hooks/admin/useConfirmDialog";
import { useShowToast } from "@/hooks/useShowToast";
import { useAdminStore } from "@/stores/useAdminStore";
import type {
  Appointment,
  AppointmentInput,
} from "@/types/admin/appointment";
import { appointmentSaveToast } from "@/utils/admin/describeRecordChanges";

export function useCalendarDayActions(selectedKey: string) {
  const patients = useAdminStore((s) => s.patients);
  const getPatient = useAdminStore((s) => s.getPatient);
  const saveAppointment = useAdminStore((s) => s.saveAppointment);
  const deleteAppointment = useAdminStore((s) => s.deleteAppointment);
  const showToast = useShowToast();
  const { ask, props: confirmProps } = useConfirmDialog();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);
  // Keep only the id and read the appointment from the store, so the sheet shows the saved
  // changes straight away instead of the copy it had when it was opened.
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = useAdminStore((s) => s.appointments.find((item) => item.id === detailId) ?? null);
  const setDetail = (item: Appointment | null) => setDetailId(item?.id ?? null);
  const [defaults, setDefaults] = useState<Partial<AppointmentInput>>({});

  const patientName = (id: string) => getPatient(id)?.name ?? "Unknown";

  // Resolves true when saved, so the form closes only then and keeps the entries otherwise.
  const save = async (input: AppointmentInput): Promise<boolean> => {
    const nextName = getPatient(input.patientId)?.name ?? "Patient";
    const previousName = editing
      ? (getPatient(editing.patientId)?.name ?? "Patient")
      : nextName;
    const id = showToast({ title: "Saving appointment…", type: "pending" });
    const result = await saveAppointment(input, editing?.id);
    if (!result.ok) {
      showToast({ title: "Appointment not saved", description: result.error, type: "error", id });
      return false;
    }
    showToast({ ...appointmentSaveToast(editing, input, previousName, nextName), id });
    return true;
  };

  const remove = (item: Appointment) => {
    const name = patientName(item.patientId);
    ask({
      title: "Delete appointment?",
      description: `Removes the appointment for ${name} on ${item.date} at ${item.time}.`,
      confirmLabel: "Delete appointment",
      onConfirm: () => {
        deleteAppointment(item.id, {
          title: "Appointment deleted",
          description: `Appointment for ${name} on ${item.date} at ${item.time} was removed.`,
        });
        setDetail(null);
      },
    });
  };

  const openCreate = (extra?: Partial<AppointmentInput>) => {
    setEditing(null);
    setDefaults({ date: selectedKey, ...extra });
    setFormOpen(true);
  };

  const openEdit = (item: Appointment) => {
    setEditing(item);
    setDefaults({});
    setFormOpen(true);
  };

  return {
    patients,
    patientName,
    formOpen,
    setFormOpen,
    editing,
    detail,
    setDetail,
    defaults,
    confirmProps,
    save,
    remove,
    openCreate,
    openEdit,
  };
}
