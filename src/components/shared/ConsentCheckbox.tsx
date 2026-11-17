import { BRAND } from "@/constants/brand";

type ConsentCheckboxProps = { id: string; checked: boolean; onChange: (checked: boolean) => void };

// The consent tick box for every form: never pre-ticked.
export function ConsentCheckbox({ id, checked, onChange }: ConsentCheckboxProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-5 shrink-0 accent-primary"
      />
      <label htmlFor={id} className="text-sm leading-relaxed text-muted-foreground">
        I agree that {BRAND.name} may use my details to arrange my appointment and contact me about it.
      </label>
    </div>
  );
}
