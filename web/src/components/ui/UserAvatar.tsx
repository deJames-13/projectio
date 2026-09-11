"use client";

import React, { useState, useEffect, useMemo } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface UserAvatarProps {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  avatar?: string | null;
  size?: AvatarSize;
  className?: string;
  imgClassName?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
  alt?: string;
  onClick?: () => void;
}

const SIZE_CONFIG: Record<
  AvatarSize,
  {
    container: string;
    text: string;
    indicator: string;
    indicatorOffset: string;
    ring: string;
  }
> = {
  xs: {
    container: "w-5 h-5",
    text: "text-[10px] font-bold",
    indicator: "w-1.5 h-1.5",
    indicatorOffset: "-bottom-0.5 -right-0.5",
    ring: "ring-1",
  },
  sm: {
    container: "w-7 h-7",
    text: "text-xs font-bold",
    indicator: "w-2 h-2",
    indicatorOffset: "-bottom-0.5 -right-0.5",
    ring: "ring-1",
  },
  md: {
    container: "w-8 h-8",
    text: "text-xs font-bold",
    indicator: "w-2.5 h-2.5",
    indicatorOffset: "-bottom-0.5 -right-0.5",
    ring: "ring-1",
  },
  lg: {
    container: "w-10 h-10",
    text: "text-sm font-bold",
    indicator: "w-3 h-3",
    indicatorOffset: "-bottom-0.5 -right-0.5",
    ring: "ring-2",
  },
  xl: {
    container: "w-20 h-20",
    text: "text-2xl font-bold tracking-tight",
    indicator: "w-4 h-4",
    indicatorOffset: "-bottom-1 -right-1",
    ring: "ring-2",
  },
};

/**
 * Palette choices with high contrast (WCAG AA compliant with white text).
 */
const PALETTES = [
  "bg-indigo-600 dark:bg-indigo-500",
  "bg-blue-600 dark:bg-blue-500",
  "bg-violet-600 dark:bg-violet-500",
  "bg-emerald-600 dark:bg-emerald-500",
  "bg-teal-600 dark:bg-teal-500",
  "bg-cyan-700 dark:bg-cyan-600",
  "bg-rose-600 dark:bg-rose-500",
  "bg-amber-600 dark:bg-amber-500",
];

function getPaletteClass(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index] ?? PALETTES[0]!;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  username,
  email,
  avatar,
  size = "md",
  className = "",
  imgClassName = "",
  showOnlineIndicator = false,
  isOnline = true,
  alt,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error status if avatar URL changes
  useEffect(() => {
    setHasError(false);
  }, [avatar]);

  const displayName = useMemo(() => {
    const n = name?.trim();
    if (n) return n;
    const u = username?.trim();
    if (u) return u;
    const e = email?.trim();
    if (e) return e;
    return "User";
  }, [name, username, email]);

  const initial = useMemo(() => {
    const raw = displayName.replace(/^@/, "");
    return (raw.charAt(0) ? raw.charAt(0) : "U").toUpperCase();
  }, [displayName]);

  const paletteClass = useMemo(() => {
    return getPaletteClass(displayName.toLowerCase());
  }, [displayName]);

  const sizeCfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.md;
  const isImageValid = Boolean(avatar && avatar.trim().length > 0 && !hasError);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex shrink-0 select-none items-center justify-center rounded-full ${sizeCfg.container} ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      role={onClick ? "button" : "img"}
      aria-label={alt ?? `${displayName}'s avatar`}
    >
      {isImageValid ? (
        <img
          src={avatar!}
          alt={alt ?? displayName}
          onError={() => setHasError(true)}
          className={`h-full w-full rounded-full object-cover ring-slate-200 dark:ring-slate-700 ${sizeCfg.ring} ${imgClassName}`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full text-white shadow-2xs ${paletteClass} ${sizeCfg.text}`}
          aria-hidden="true"
        >
          {initial}
        </div>
      )}

      {showOnlineIndicator && (
        <span
          className={`absolute rounded-full border-2 border-white dark:border-slate-900 ${sizeCfg.indicator} ${sizeCfg.indicatorOffset} ${
            isOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-500"
          }`}
          title={isOnline ? "Online" : "Offline"}
          aria-label={isOnline ? "Online status: Active" : "Online status: Offline"}
        />
      )}
    </div>
  );
};
