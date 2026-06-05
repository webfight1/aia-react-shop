export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} Aiamaailm OÜ · Tartu mnt 1, Tallinn</div>
        <div className="flex gap-4">
          <a href="mailto:info@aiamaailm.ee" className="hover:text-primary">info@aiamaailm.ee</a>
          <a href="tel:+3725000000" className="hover:text-primary">+372 500 0000</a>
        </div>
      </div>
    </footer>
  );
}
