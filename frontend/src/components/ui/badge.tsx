import * as React from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type BadgeVariant = "default" | "secondary" | "success" | "destructive" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-nexus-600 text-white border-transparent",
  secondary: "bg-gray-100 text-gray-800 border-transparent",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  destructive: "bg-red-50 text-red-700 border-red-200",
  outline: "bg-transparent text-gray-700 border-gray-200",
};

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeVariant };
