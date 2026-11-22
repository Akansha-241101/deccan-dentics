import { CLINIC } from "@/data/clinic";

// Brand facts in one place, built from the clinic data (brand-manifest.json): the admin sign-in
// screens, the emails and the web app manifest read them.
export const BRAND = {
  name: CLINIC.name,
  tagline: "Healthy smiles. Happier lives.",
  description: "Family dental care in Hyderabad. Calm, precise, and patient-first, for checkups through complex treatment.",
  phone: CLINIC.phone,
  phoneHref: CLINIC.phoneHref,
  email: CLINIC.email,
  emailHref: CLINIC.emailHref,
  logo: "/images/brand/logo.png",
  logoMark: "/images/brand/logo-mark.png",
  /** Teal primary and warm paper background from the Eatrrite theme (light). */
  themeColor: "#014e4e",
  backgroundColor: "#f6f6f6",
} as const;
