import { after } from "next/server";
import { getServices } from "@/features/appointment/services/bookingConfig";
import { sendBookingEmails } from "@/features/appointment/services/bookingEmails";
import { createBooking, slotSource } from "@/features/appointment/services/bookingDb";
import { customerSlotError } from "@/features/appointment/utils/customerSlots";
import { validateBooking } from "@/features/appointment/utils/validateBooking";
import { fail, ok } from "@/utils/apiResponse";

// POST /api/appointments → checks the details and the slot, saves the patient and the
// appointment, then emails the patient and the clinic (after the answer is sent).
export async function POST(request: Request) {
  const input = validateBooking(await request.json().catch(() => ({})), await getServices());
  if (typeof input === "string") return fail(input);

  try {
    const problem = customerSlotError(input.date, input.time, await slotSource());
    if (problem) return fail(problem.message, problem.code === "taken" ? 409 : 400);

    const outcome = await createBooking(input);
    if (!outcome.ok) return fail(outcome.error, 409);
    after(() => sendBookingEmails(outcome.appointmentId));
    return ok({ appointmentId: outcome.appointmentId });
  } catch (error) {
    console.error("Create booking failed", error);
    return fail("We could not save your booking. Please try again or call us.", 500);
  }
}
