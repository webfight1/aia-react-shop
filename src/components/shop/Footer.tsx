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
      <div className="mt-4 flex justify-center items-center gap-2 text-xs text-cream/40">
        <span>Made by</span>
        <a href="https://webfight.ee" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:opacity-80 transition" aria-label="Webfight">
          <svg width="80" height="10" viewBox="0 0 246.06 31.75" xmlns="http://www.w3.org/2000/svg" className="fill-current text-cream/60 hover:text-cream transition-colors">
            <g transform="translate(113.83 -79.625)">
              <path d="m-107.48 98.675h-6.35v-19.05h6.35zm6.35 0v-19.05h6.35v19.05zm12.7 0v-19.05h6.35v19.05zm-12.7 12.7h-6.35v-12.7h6.35zm12.7 0h-6.35v-12.7h6.35zm38.365-6.35v6.35h-25.4v-31.75h25.4v6.35h-19.05v6.35h12.7v6.35h-12.7v6.35zm12.965 0h12.7v6.35h-19.05v-31.75h19.05v6.35h-12.7v6.35h12.7v6.35h-12.7zm19.05-12.7h-6.35v-6.35h6.35zm0 12.7h-6.35v-6.35h6.35zm28.575 6.35h-6.35v-31.75h25.4v6.35h-19.05v6.35h12.7v6.35h-12.7zm32.015 0h-6.35v-31.75h6.35zm12.965-25.4v-6.35h19.05v6.35zm0 25.4v-6.35h-6.35v-19.05h6.35v19.05h12.7v-6.35h-6.35v-6.35h12.7v19.05zm32.015 0h-6.35v-31.75h6.35v12.7h12.7v-12.7h6.35v31.75h-6.35v-12.7h-12.7zm38.365 0h-6.35v-25.4h-6.35v-6.35h19.05v6.35h-6.35z" stroke-linejoin="round" stroke-width=".21167"></path>
            </g>
          </svg>
        </a>
      </div>
    </footer>
  );
}
