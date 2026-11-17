import { deleteAppointmentAction, deletePatientAction, savePatientAction } from "@/features/admin/services/adminActions";
import { completeAppointmentsAction, deleteAppointmentsAction, deletePatientsAction } from "@/features/admin/services/bulkActions";
import { saveOrRevert, type SaveNotice } from "@/stores/saveOrRevert";
import { canBulkComplete, type Appointment } from "@/types/admin/appointment";
import type { Patient, PatientInput } from "@/types/admin/patient";
import { createId } from "@/utils/admin/id";

type EntitySlice = {
  patients: Patient[];
  appointments: Appointment[];
};

type SetState = (partial: Partial<EntitySlice> | ((state: EntitySlice) => Partial<EntitySlice>)) => void;
type GetState = () => EntitySlice;

// Patients and appointment deletes: shown at once, saved to Neon, undone if saving fails.
export function createEntityActions(set: SetState, get: GetState) {
  return {
    getPatient: (id: string) => get().patients.find((patient) => patient.id === id),

    addPatient: (input: PatientInput, notice: SaveNotice) => {
      const now = new Date().toISOString();
      const patient: Patient = { ...input, id: createId(), createdAt: now, updatedAt: now };
      set((s) => ({ patients: [patient, ...s.patients] }));
      saveOrRevert(savePatientAction(patient), () => set((s) => ({ patients: s.patients.filter((item) => item.id !== patient.id) })), notice);
      return patient;
    },

    updatePatient: (id: string, input: PatientInput, notice: SaveNotice) => {
      const before = get().patients;
      const current = before.find((item) => item.id === id);
      if (!current) return;
      const next: Patient = { ...current, ...input, updatedAt: new Date().toISOString() };
      set({ patients: before.map((item) => (item.id === id ? next : item)) });
      saveOrRevert(savePatientAction(next), () => set({ patients: before }), notice);
    },

    // Deleting a patient deletes their appointments too, as the database does.
    deletePatient: (id: string, notice: SaveNotice) => {
      const { patients, appointments } = get();
      set({ patients: patients.filter((item) => item.id !== id), appointments: appointments.filter((item) => item.patientId !== id) });
      saveOrRevert(deletePatientAction(id), () => set({ patients, appointments }), notice);
    },

    deleteAppointment: (id: string, notice: SaveNotice) => {
      const before = get().appointments;
      set({ appointments: before.filter((item) => item.id !== id) });
      saveOrRevert(deleteAppointmentAction(id), () => set({ appointments: before }), notice);
    },

    deletePatients: (ids: string[], notice: SaveNotice) => {
      const { patients, appointments } = get();
      const gone = new Set(ids);
      set({ patients: patients.filter((item) => !gone.has(item.id)), appointments: appointments.filter((item) => !gone.has(item.patientId)) });
      saveOrRevert(deletePatientsAction(ids), () => set({ patients, appointments }), notice);
    },

    deleteAppointments: (ids: string[], notice: SaveNotice) => {
      const before = get().appointments;
      const gone = new Set(ids);
      set({ appointments: before.filter((item) => !gone.has(item.id)) });
      saveOrRevert(deleteAppointmentsAction(ids), () => set({ appointments: before }), notice);
    },

    // Same rule as the server: only upcoming and not-attended ones change.
    completeAppointments: (ids: string[], notice: SaveNotice) => {
      const before = get().appointments;
      const picked = new Set(ids);
      const now = new Date().toISOString();
      set({
        appointments: before.map((item) =>
          picked.has(item.id) && canBulkComplete(item.status) ? { ...item, status: "completed", updatedAt: now } : item,
        ),
      });
      saveOrRevert(completeAppointmentsAction(ids), () => set({ appointments: before }), notice);
    },

  };
}
