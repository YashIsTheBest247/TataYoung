import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-12">
        <div className="sm:col-span-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber2-500 text-ink-900">
              <Waves size={17} strokeWidth={2.5} />
            </div>
            <span className="serif text-xl text-ink-900">Pravaah</span>
          </div>
          <p className="mt-4 max-w-md text-sm text-ink-600">
            Pravaah is a public safety fabric. Open data, open methods, open to every city that needs
            to know which road is still a road.
          </p>
        </div>
        <div className="sm:col-span-3">
          <div className="text-[11px] uppercase tracking-widest text-ink-400">Product</div>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li><Link to="/map">Live map</Link></li>
            <li><Link to="/report">Report flooding</Link></li>
            <li><Link to="/family">Family registry</Link></li>
          </ul>
        </div>
        <div className="sm:col-span-4">
          <div className="text-[11px] uppercase tracking-widest text-ink-400">Partners</div>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>NDMA, SDMA state cells</li>
            <li>BMC, GCC, KMC urban bodies</li>
            <li>112 ERSS, 1930 cybercrime</li>
            <li>Tata Trusts, Tata Communications</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 text-xs text-ink-500">
          <span>Pravaah, the flow of safe passage.</span>
          <span>Built for the Tata Young Hackathon 2026.</span>
        </div>
      </div>
    </footer>
  );
}
