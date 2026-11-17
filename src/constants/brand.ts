import { CLINIC } from "@/data/clinic";

// Brand facts in one place, built from the clinic data (brand-manifest.json): the admin sign-in
// screens, the emails and the web app manifest read them.
export const BRAND = {
  name: CLINIC.name,
  tagline: "Healthy smiles. Happier lives.",
  description: "Family dental care in Hyderabad. Calm, precise, and patient-first, for checkups through complex treatment.",
  url: CLINIC.website,
  phone: CLINIC.phone,
  phoneHref: CLINIC.phoneHref,
  email: CLINIC.email,
  emailHref: CLINIC.emailHref,
  logo: "/images/brand/logo.png",
  logoMark: "/images/brand/logo-mark.png",
  /** Forest green primary and soft background from globals.css (light theme). */
  themeColor: "#287a52",
  backgroundColor: "#f7faf7",
} as const;
