"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function Select({
  value,
  onValueChange,
  children,
  className,
  placeholder = "Select...",
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Extract options from children
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<SelectItemProps>(child) && child.type === SelectItem) {
      options.push({
        value: child.props.value,
        label:
          typeof child.props.children === "string"
            ? child.props.children
            : child.props.value,
      });
    }
  });

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-nexus-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate text-black">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-[100] mt-1 w-full min-w-[8rem] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
                  value === option.value
                    ? "bg-nexus-50 text-black font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

function SelectItem(_props: SelectItemProps) {
  // Rendered by Select parent — this is a data-only component
  return null;
}

export { Select, SelectItem };
