import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    tiktok: "#000000",
    youtube: "#FF0000",
    instagram: "#E4405F",
    facebook: "#1877F2",
    twitter: "#1DA1F2",
    linkedin: "#0A66C2",
  }
  return colors[platform.toLowerCase()] ?? "#666"
}
