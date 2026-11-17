import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/AuthForm";

export const metadata: Metadata = { title: "Admin log in | Deccan Dentics" };

export default function AdminLoginPage() {
  return <AuthForm mode="login" />;
}
