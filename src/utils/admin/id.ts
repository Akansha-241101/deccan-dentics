/** Stable runtime ids for store entities (patients, appointments, etc.). */
export function createId() {
  return crypto.randomUUID();
}
