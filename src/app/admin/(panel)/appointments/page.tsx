"use client";

import { Suspense } from "react";
import { AdminMotion, AdminPage } from "@/components/admin/AdminPage";
import { AddRecordButton } from "@/components/admin/AddRecordButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminStore } from "@/stores/useAdminStore";
import { AppointmentsTable } from "@/components/admin/appointments/AppointmentsTable";

export default function AdminAppointmentsPage() {
  // An appointment needs a patient, so Add waits for the first one.
  const hasPatients = useAdminStore((s) => s.patients.length > 0);
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Appointments"
        title="Appointment schedule"
        description="Every appointment belongs to a patient. Bookings made on the website appear here straight away."
        compactActions
      >
        <AddRecordButton kind="appointment" label="Add appointment" disabled={!hasPatients} />
      </AdminPageHeader>
      <AdminMotion>
        <Suspense fallback={null}>
          <AppointmentsTable />
        </Suspense>
      </AdminMotion>
    </AdminPage>
  );
}
