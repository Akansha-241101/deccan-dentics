"use client";

import { DashboardAvatar } from "@/components/admin/dashboard/DashboardAvatar";
import type { Patient } from "@/types/admin/patient";
import type { DataTableColumn } from "@/types/admin/dataTable";

export const PATIENT_LIST_COLUMNS: DataTableColumn<Patient>[] = [
  {
    key: "name",
    header: "Name",
    width: 50,
    cell: (patient) => (
      <span className="flex min-w-0 items-center gap-3">
        <DashboardAvatar name={patient.name} className="size-8 text-[11px]" />
        <span className="truncate font-medium text-ink">{patient.name}</span>
      </span>
    ),
  },
  { key: "phone", header: "Phone", width: 50, cell: (patient) => <span className="text-text tabular-nums">{patient.phone}</span> },
];
