import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IconRef {
  icon?: string | null;
  text?: string | null;
}

export interface CtaRef {
  label?: string | null;
  href?: string | null;
  icon?: string | null;
}

export interface HomeContent {
  hero: {
    badge?: { icon?: string | null; text?: string | null } | null;
    title?: { before?: string | null; highlight?: string | null } | null;
    description?: string | null;
    primaryCta?: CtaRef | null;
    secondaryCta?: CtaRef | null;
    highlights?: IconRef[] | null;
  };
  valueProps?: Array<{
    icon?: string | null;
    title?: string | null;
    description?: string | null;
  }> | null;
  story?: {
    id?: string | null;
    eyebrow?: string | null;
    title?: string | null;
    paragraphs?: string[] | null;
    cta?: CtaRef | null;
    stat?: { value?: string | null; label?: string | null } | null;
  } | null;
  cta?: {
    title?: string | null;
    description?: string | null;
    button?: CtaRef | null;
  } | null;
}

export interface HomePageResponse {
  slug: string;
  title: string;
  data: HomeContent;
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const res = await fetch(
    "https://aiamaailm.webfight.shop/api/v1/pages/home",
  );
  if (!res.ok) throw new Error(`Failed to fetch home: ${res.status}`);
  const json = (await res.json()) as HomePageResponse;
  return json.data;
}

/** Convert "arrow-right" / "shield-check" → "ArrowRight" / "ShieldCheck" */
export function iconNameToPascal(name?: string | null): string | null {
  if (!name) return null;
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/** Resolve a kebab-case lucide name to a component, or null if unknown. */
export function getLucideIcon(name?: string | null): LucideIcon | null {
  const pascal = iconNameToPascal(name);
  if (!pascal) return null;
  const reg = Icons as unknown as Record<string, LucideIcon>;
  return reg[pascal] ?? null;
}
