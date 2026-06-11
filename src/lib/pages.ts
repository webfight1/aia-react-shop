export const STORAGE_BASE = "https://aiamaailm.webfight.shop/storage";

export type BlockType =
  | "text"
  | "text_image"
  | "image"
  | "gallery"
  | "quote"
  | "cta"
  | "html";

export interface PageBlock {
  type: BlockType | string;
  data: Record<string, any>;
}

export interface PageResponse {
  slug: string;
  title: string;
  excerpt?: string | null;
  data?: any;
  blocks?: PageBlock[] | null;
}

export async function fetchPage(slug: string): Promise<PageResponse> {
  const res = await fetch(
    `https://aiamaailm.webfight.shop/api/v1/pages/${encodeURIComponent(slug)}`,
  );
  if (res.status === 404) {
    const err: Error & { status?: number } = new Error("Page not found");
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error(`Failed to fetch page ${slug}: ${res.status}`);
  return (await res.json()) as PageResponse;
}

export function storageUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE}/${path.replace(/^\/+/, "")}`;
}
