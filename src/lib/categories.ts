export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  url_path: string;
  parent_id: number | null;
  position: number;
}

export interface CategoryNode extends ApiCategory {
  children: CategoryNode[];
}

const API_URL = "https://aiamaailm.webfight.shop/api/v1/category";

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json();
}

const sortFn = (a: ApiCategory, b: ApiCategory) =>
  a.position - b.position || a.name.localeCompare(b.name, "et");

export function buildTree(cats: ApiCategory[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>();
  cats.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else if (node.parent_id === 1) {
      roots.push(node);
    }
  });
  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort(sortFn);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}
