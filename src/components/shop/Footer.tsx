export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>© 2017 Aiamaailm OÜ · Aadress: Idapõllu tee 5, 74001 Viimsi</div>
        <div className="flex gap-4">
          <a href="mailto:pillemataloja@gmail.com" className="hover:text-primary">pillemataloja@gmail.com</a>
          <a href="tel:+37255517070" className="hover:text-primary">+372 5551 7070</a>
        </div>
      </div>
    </footer>
  );
}
