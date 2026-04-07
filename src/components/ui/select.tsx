import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type SelectOption = {
  disabled?: boolean;
  label: React.ReactNode;
  value: string;
};

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "children" | "onChange"
> & {
  children: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: string) => void;
};

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ children, className, disabled, id, onChange, onValueChange, value }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const options = React.useMemo(() => getOptions(children), [children]);

    const selectedOption =
      options.find((option) => option.value === String(value ?? "")) ?? options[0] ?? null;

    React.useEffect(() => {
      function handlePointerDown(event: PointerEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }

      window.addEventListener("pointerdown", handlePointerDown);
      return () => window.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    function commitValue(nextValue: string) {
      if (disabled) {
        return;
      }

      onValueChange?.(nextValue);

      if (onChange) {
        const syntheticEvent = {
          target: { value: nextValue },
          currentTarget: { value: nextValue },
        } as React.ChangeEvent<HTMLSelectElement>;

        onChange(syntheticEvent);
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
      if (disabled || options.length === 0) {
        return;
      }

      const currentIndex = options.findIndex((option) => option.value === selectedOption?.value);

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = findNextEnabledIndex(options, currentIndex, direction);
        if (nextIndex >= 0) {
          commitValue(options[nextIndex]!.value);
        }
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen((current) => !current);
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    return (
      <div className="relative" ref={containerRef}>
        <button
          aria-controls={id ? `${id}-listbox` : undefined}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-left text-sm text-slate-950 shadow-sm outline-none transition hover:border-slate-300 hover:bg-white focus-visible:border-slate-300 focus-visible:ring-4 focus-visible:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60",
            isOpen && "border-sky-300 ring-4 ring-sky-100",
            className,
          )}
          disabled={disabled}
          id={id}
          onClick={() => setIsOpen((current) => !current)}
          onKeyDown={handleKeyDown}
          ref={ref}
          type="button"
        >
          <span className="truncate">{selectedOption?.label ?? "Select an option"}</span>
          <span
            className={cn(
              "ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition",
              isOpen && "bg-sky-100 text-sky-700",
            )}
          >
            <ChevronDown className={cn("h-4 w-4 transition", isOpen && "rotate-180")} />
          </span>
        </button>

        <select aria-hidden className="sr-only" disabled={disabled} tabIndex={-1} value={value}>
          {children}
        </select>

        {isOpen ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur"
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
          >
            <div className="space-y-1">
              {options.map((option) => {
                const selected = option.value === selectedOption?.value;

                return (
                  <button
                    aria-selected={selected}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-sm transition",
                      option.disabled
                        ? "cursor-not-allowed text-slate-300"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                      selected && "bg-sky-50 text-sky-900",
                    )}
                    disabled={option.disabled}
                    key={option.value}
                    onClick={() => commitValue(option.value)}
                    role="option"
                    type="button"
                  >
                    <span className="truncate">{option.label}</span>
                    <Check
                      className={cn(
                        "h-4 w-4 transition",
                        selected ? "opacity-100 text-sky-700" : "opacity-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

function getOptions(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement(child)) {
      return [];
    }

    if (child.type !== "option") {
      return [];
    }

    return [
      {
        disabled: child.props.disabled as boolean | undefined,
        label: child.props.children as React.ReactNode,
        value: String(child.props.value ?? ""),
      },
    ];
  });
}

function findNextEnabledIndex(
  options: SelectOption[],
  currentIndex: number,
  direction: 1 | -1,
): number {
  if (options.length === 0) {
    return -1;
  }

  let nextIndex = currentIndex;

  for (let step = 0; step < options.length; step += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length;
    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return currentIndex;
}
