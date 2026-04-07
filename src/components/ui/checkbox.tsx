import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "type"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Checkbox({ checked, className, disabled, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        checked={checked}
        className="peer sr-only"
        disabled={disabled}
        type="checkbox"
        onChange={(event) => onCheckedChange(event.target.checked)}
        {...props}
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white shadow-sm transition",
          "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-100 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
          checked
            ? "border-sky-500 bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
            : "text-transparent",
          className,
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </span>
  );
}
