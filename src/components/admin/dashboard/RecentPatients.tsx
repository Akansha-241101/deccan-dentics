"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { useMemo } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { DashboardAvatar } from "@/components/admin/dashboard/DashboardAvatar";
import {
  DashboardCard,
  DashboardCardHeader,
} from "@/components/admin/dashboard/DashboardCard";
import { buttonVariants } from "@/components/ui/button";
import { useAdminStore } from "@/stores/useAdminStore";
import { buildRecentPatientRows } from "@/utils/admin/dashboardRecentPatients";
import { cn } from "cn";

export function RecentPatients() {
  const patients = useAdminStore((s) => s.patients);
  const appointments = useAdminStore((s) => s.appointments);
  const rows = useMemo(
    () => buildRecentPatientRows(patients, appointments),
    [patients, appointments],
  );

  return (
    <DashboardCard>
      <DashboardCardHeader
        icon={<Users className="size-4" />}
        tone="coral"
        title="Recent patients"
        action={
          <Link
            href="/admin/patients"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full",
            )}
          >
            View all
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState size="sm" image="patients" title="No patients yet" description="New bookings and patients you add show up here." />
      ) : null}
      <ul className="divide-y divide-border">
        {rows.map((patient) => (
          <li key={patient.id}>
            <Link
              href={`/admin/patients?id=${patient.id}`}
              className="flex items-center gap-3 py-3.5 -mx-2 rounded-xl px-2 transition-[background-color,translate] duration-300 hover:translate-x-0.5 hover:bg-background"
            >
              <DashboardAvatar name={patient.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {patient.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  Last appointment • {patient.lastAppointmentLabel}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
