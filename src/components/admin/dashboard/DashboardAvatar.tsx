import { ICON_TONES } from "@/constants/admin/tones";
import { getInitials } from "@/utils/admin/initials";
import { cn } from "cn";

type DashboardAvatarProps = {
  name: string;
  className?: string;
  /** Optional override. Defaults to the shared teal chip for every name. */
  toneClass?: string;
};

export function DashboardAvatar({ name, className, toneClass }: DashboardAvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold ring-2 ring-white shadow-xs",
        toneClass ?? ICON_TONES.teal,
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  );
}
