"use client";

import { cn } from "@/lib/utils";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="overflow-x-auto -mx-px">{children}</div>
    </div>
  );
}
