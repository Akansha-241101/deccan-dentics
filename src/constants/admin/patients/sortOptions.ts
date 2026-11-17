/** Order of the Patients list, by the day the patient was added. */
export const PATIENT_SORT_OPTIONS = [
  { value: "newest", label: "Newest first", short: "Sort: Newest first" },
  { value: "oldest", label: "Oldest first", short: "Sort: Oldest first" },
] as const;
