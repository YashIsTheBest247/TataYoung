import { Link, useLocation } from 'react-router-dom';
import { Waves, ArrowRight } from 'lucide-react';

const LINKS = [
  { to: '/map', label: 'Live map' },
  { to: '/report', label: 'Report' },
  { to: '/family', label: 'Family' },
];

export default function NavBar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber2-500 text-ink-900 shadow-card">
            <Waves size={17} strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="serif text-xl text-ink-900">Pravaah</span>
            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-ink-400 sm:inline">
              प्रवाह
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                  active
                    ? 'bg-ink-900 text-paper-50'
                    : 'text-ink-600 hover:bg-ink-100'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/map"
            className="flex items-center gap-1 rounded-full btn-amber px-4 py-2 text-sm"
          >
            Open live map <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
