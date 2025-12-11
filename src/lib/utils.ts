import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getIcon = (iconName: string): LucideIcon => {
  if (!iconName) return LucideIcons.HelpCircle;
  const name = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return icon || LucideIcons.HelpCircle;
};
