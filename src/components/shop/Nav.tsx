import { ChevronDown } from "lucide-react";

const items = [
  { label: "Firmast" },
  { label: "Tootekataloog", hasMenu: true },
  { label: "Müügitingimused" },
  { label: "Uudised" },
  { label: "Abikäsi" },
  { label: "Kontakt" },
  { label: "Kasvatajatele" },
];

export function Nav() {
  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ul className="flex flex-wrap items-center gap-1 text-sm">
          {items.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className="flex items-center gap-1 px-3 py-3 font-medium text-foreground/80 hover:text-primary transition-colors relative group"
              >
                {item.label}
                {item.hasMenu && <ChevronDown className="h-3.5 w-3.5" />}
                <span className="absolute left-3 right-3 bottom-1.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
