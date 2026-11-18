"use client";

import { startTransition, useActionState } from "react";
import { DEMO_ACCOUNT } from "@/constants/admin/demoAccount";
import { signInAction } from "@/features/auth/services/authActions";

/** Signs in with the shared demo admin account via the same server action as the login form. */
export function useDemoSignIn() {
  const [state, formAction, pending] = useActionState(signInAction, null);

  function continueWithDemo() {
    if (pending) return;
    const form = new FormData();
    form.set("email", DEMO_ACCOUNT.email);
    form.set("password", DEMO_ACCOUNT.password);
    startTransition(() => formAction(form));
  }

  return { error: state?.error ?? null, pending, continueWithDemo };
}
