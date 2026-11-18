import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { DemoAccountNotice } from "@/features/auth/components/DemoAccountNotice";

export const metadata: Metadata = { title: "Admin log in | Deccan Dentics" };

export default function AdminLoginPage() {
  return (
    <>
      <DemoAccountNotice />
      <AuthForm mode="login" />
    </>
  );
}
