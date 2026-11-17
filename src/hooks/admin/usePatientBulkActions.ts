"use client";

import { useAdminStore } from "@/stores/useAdminStore";
import type { ConfirmDialogRequest } from "@/hooks/admin/useConfirmDialog";
import type { Patient } from "@/types/admin/patient";
import { plural } from "@/utils/admin/plural";

// Bulk delete for the Patients list. Says how many appointments go with the patients, before asking.
export function usePatientBulkActions(ask: (request: ConfirmDialogRequest) => void, done: () => void) {
  const appointments = useAdminStore((s) => s.appointments);
  const deletePatients = useAdminStore((s) => s.deletePatients);

  const deleteAll = (patients: Patient[]) => {
    const ids = new Set(patients.map((patient) => patient.id));
    const linked = appointments.filter((item) => ids.has(item.patientId)).length;
    const what = plural(patients.length, "patient");
    ask({
      title: `Delete ${what}?`,
      description:
        (linked > 0
          ? `This permanently removes ${what} and their ${plural(linked, "appointment")}. `
          : `This permanently removes ${what}. `) + "This cannot be undone.",
      confirmLabel: `Delete ${what}`,
      confirmVariant: "destructive",
      onConfirm: () => {
        deletePatients([...ids], { title: `${what} deleted`, description: "They were removed from the patient list." });
        done();
      },
    });
  };

  return { deleteAll };
}
