"use client";

import { CircleCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

/** After a password reset the login page opens with ?reset=done. */
export function PasswordResetNotice() {
  if (useSearchParams().get("reset") !== "done") return null;
  return (
    <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-beige px-3 py-2 text-sm text-primary">
      <CircleCheck aria-hidden className="size-4 shrink-0" />
      Your password is updated. Log in with the new one.
    </p>
  );
}
