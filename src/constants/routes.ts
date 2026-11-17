// App routes used by the booking flow and the admin, kept in one place.
export const ROUTES = {
  home: "/",
  contact: "/contact",
  appointment: "/book",
  appointmentConfirmed: "/appointment-confirmed",
} as const;

export const confirmedPath = (appointmentId: string) =>
  `${ROUTES.appointmentConfirmed}?appointmentId=${appointmentId}`;
