"use client";

import Image from "next/image";
import { Repeat } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionLogoProps {
  name: string;
  logoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function SubscriptionLogo({
  name,
  logoUrl,
  size = "md",
  className,
}: SubscriptionLogoProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (logoUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg border bg-muted shadow-sm",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={logoUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-sm",
        sizeMap[size],
        className
      )}
      title={name}
    >
      {initials.length >= 2 ? (
        <span className="text-xs font-semibold">{initials}</span>
      ) : (
        <Repeat className={cn(iconSizeMap[size], "opacity-70")} />
      )}
    </div>
  );
}
