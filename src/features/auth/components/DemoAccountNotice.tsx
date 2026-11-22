"use client";

import { AnimatePresence, motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNT, DEMO_ACCOUNT_COPY } from "@/constants/admin/demoAccount";
import { useDemoSignIn } from "@/features/auth/hooks/useDemoSignIn";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Top-right slide-in on /admin/login for recruiters exploring the portfolio demo. */
export function DemoAccountNotice() {
  const [open, setOpen] = useState(true);
  const { continueWithDemo, pending, error } = useDemoSignIn();

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="demo-notice"
          role="dialog"
          aria-label={DEMO_ACCOUNT_COPY.title}
          initial={{ opacity: 0, x: 48, y: -16 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 32, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed top-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-card/95 p-4 shadow-[0_12px_40px_-12px_rgba(40,122,82,0.35)] backdrop-blur-md sm:top-6 sm:right-6 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="type-eyebrow">Demo access</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-foreground">{DEMO_ACCOUNT_COPY.title}</h2>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Dismiss demo notice" onClick={() => setOpen(false)} className="shrink-0 text-muted-foreground">
              <XIcon />
            </Button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DEMO_ACCOUNT_COPY.body}</p>
          <dl className="mt-3 space-y-1 rounded-lg bg-beige px-3 py-2 text-sm text-primary">
            <div className="flex flex-wrap gap-x-2"><dt className="font-medium">Email :-</dt><dd className="break-all">{DEMO_ACCOUNT.email}</dd></div>
            <div className="flex flex-wrap gap-x-2"><dt className="font-medium">Password :-</dt><dd>{DEMO_ACCOUNT.password}</dd></div>
          </dl>
          {error ? <p role="alert" className="mt-3 rounded-lg bg-alert-bg px-3 py-2 text-sm text-alert-text">{error}</p> : null}
          <Button type="button" size="lg" disabled={pending} onClick={continueWithDemo} className="mt-4 w-full">
            {pending ? "Signing in…" : DEMO_ACCOUNT_COPY.action}
          </Button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
