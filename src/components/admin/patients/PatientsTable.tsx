"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { PatientDetailsCard } from "@/components/admin/patients/PatientDetailsCard";
import { PatientFormDialog } from "@/components/admin/patients/PatientFormDialog";
import { PATIENT_LIST_COLUMNS } from "@/components/admin/patients/patientColumns";
import { PatientsToolbar } from "@/components/admin/patients/PatientsToolbar";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { StickyToolbar } from "@/components/admin/StickyToolbar";
import { Button } from "@/components/ui/button";
import { useBulkSelection } from "@/hooks/admin/useBulkSelection";
import { usePatientBulkActions } from "@/hooks/admin/usePatientBulkActions";
import { Trash2Icon } from "lucide-react";
import { useConfirmDialog } from "@/hooks/admin/useConfirmDialog";
import { useCreateRequest } from "@/hooks/admin/useCreateRequest";
import { useSelectedRow } from "@/hooks/admin/useSelectedRow";
import { DETAILS_PANEL_CLASS, useDetailsPanel } from "@/hooks/admin/useDetailsPanel";
import { useAdminStore } from "@/stores/useAdminStore";
import type { Patient, PatientInput } from "@/types/admin/patient";
import type { PatientListFilters } from "@/types/admin/patient";
import { patientSaveToast } from "@/utils/admin/describeRecordChanges";
import { filterPatients } from "@/utils/admin/filterPatients";

const INITIAL_FILTERS: PatientListFilters = {
  query: "",
  age: "all",
  date: "all",
  sort: "newest",
};

export function PatientsTable() {
  const patients = useAdminStore((s) => s.patients);
  const addPatient = useAdminStore((s) => s.addPatient);
  const updatePatient = useAdminStore((s) => s.updatePatient);
  const deletePatient = useAdminStore((s) => s.deletePatient);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const { ask, props: confirmProps } = useConfirmDialog();

  const rows = useMemo(() => filterPatients(patients, filters), [patients, filters]);
  const getId = useCallback((patient: Patient) => patient.id, []);
  const [selectedId, selectRow, selected] = useSelectedRow(rows, getId);
  const { ref: detailsRef, reveal: revealDetails } = useDetailsPanel();
  const bulk = useBulkSelection(rows, getId);
  const bulkActions = usePatientBulkActions(ask, bulk.clear);

  // "Add patient" in the page header opens the form here.
  useCreateRequest("patient", () => {
    setEditing(null);
    setOpen(true);
  });

  const startEdit = (patient: Patient) => {
    setEditing(patient);
    setOpen(true);
  };

  const save = (input: PatientInput) => {
    const { title, description } = patientSaveToast(editing, input);
    if (editing) updatePatient(editing.id, input, { title, description });
    else addPatient(input, { title, description });
  };

  const remove = (patient: Patient) => {
    ask({
      title: `Delete ${patient.name}?`,
      description:
        "This removes the patient and any linked appointments from the patient list.",
      confirmLabel: "Delete patient",
      onConfirm: () => {
        // The database removes the patient's appointments with it (on delete cascade).
        deletePatient(patient.id, {
          title: "Patient deleted",
          description: `${patient.name} was removed from the patient list.`,
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <StickyToolbar>
        <PatientsToolbar filters={filters} onChange={setFilters} />
      </StickyToolbar>
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <DataTable
          columns={PATIENT_LIST_COLUMNS}
          rows={rows}
          getRowId={getId}
          selectedRowId={selectedId}
          onRowSelect={(patient) => {
            selectRow(patient.id);
            revealDetails();
          }}
          resetKey={JSON.stringify(filters)}
          selection={bulk.selection}
          rowActions={(patient) => ({ onEdit: () => startEdit(patient), onDelete: () => remove(patient) })}
          rowLabel={(patient) => patient.name}
          minWidthClass="min-w-[18rem]"
          empty={
            patients.length === 0 ? (
              <EmptyState image="patients" title="No patients yet" description="Patients appear here when someone books on the website, or add one yourself." />
            ) : (
              <EmptyState image="search" title="No patients match" description="Try a different search or age filter." />
            )
          }
        />
        <div ref={detailsRef} className={DETAILS_PANEL_CLASS}>
          <PatientDetailsCard
            patient={selected}
            onEdit={() => selected && startEdit(selected)}
            onDelete={() => selected && remove(selected)}
          />
        </div>
      </div>
      <PatientFormDialog
        open={open}
        patient={editing}
        onClose={() => setOpen(false)}
        onSave={save}
      />
      <BulkActionBar count={bulk.selectedRows.length} noun={["patient", "patients"]} onClear={bulk.clear}>
        <Button type="button" variant="destructive" size="sm" onClick={() => bulkActions.deleteAll(bulk.selectedRows)}>
          <Trash2Icon data-icon="inline-start" />
          Delete all
        </Button>
      </BulkActionBar>
      {confirmProps ? <ConfirmationModal {...confirmProps} /> : null}
    </div>
  );
}
