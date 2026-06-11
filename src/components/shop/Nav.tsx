import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  buildTree,
  fetchCategories,
  type CategoryNode,
} from "@/lib/categories";

interface Props {
  onSelectCategory?: (slug: string, name: string) => void;
  selectedSlug?: string;
}

const staticItems = [
  { label: "Firmast" },
  { label: "Müügitingimused" },
  { label: "Uudised" },
  { label: "Abikäsi" },
  { label: "Kontakt" },
  { label: "Kasvatajatele" },
];

export function Nav({ onSelectCategory, selectedSlug }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const tree = buildTree(categories);

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          <li>
            <a
              href="#"
              className="flex items-center gap-1 px-3 py-3 font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Firmast
            </a>
          </li>

          <li className="relative group/cat">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-3 font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              Tootekataloog
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {tree.length > 0 && (
              <div className="absolute left-0 top-full z-40 hidden group-hover/cat:block pt-1">
                <div className="min-w-[260px] rounded-xl border border-border bg-popover shadow-lg">
                  <ul className="py-1">
                    {tree.map((node) => (
                      <CategoryItem
                        key={node.id}
                        node={node}
                        onSelect={onSelectCategory}
                        selectedSlug={selectedSlug}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>

          {staticItems.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className="flex items-center gap-1 px-3 py-3 font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function CategoryItem({
  node,
  onSelect,
  selectedSlug,
}: {
  node: CategoryNode;
  onSelect: (slug: string, name: string) => void;
  selectedSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const active = selectedSlug === node.slug;

  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => onSelect(node.slug, node.name)}
        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent/60 transition-colors ${
          active ? "text-primary font-semibold" : "text-foreground/85"
        }`}
      >
        <span className="truncate">{node.name}</span>
        {hasChildren && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
      </button>

      {hasChildren && open && (
        <div className="absolute left-full top-0 z-50 pl-1">
          <div className="min-w-[240px] rounded-xl border border-border bg-popover shadow-lg">
            <ul className="py-1">
              {node.children.map((child) => (
                <CategoryItem
                  key={child.id}
                  node={child}
                  onSelect={onSelect}
                  selectedSlug={selectedSlug}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
