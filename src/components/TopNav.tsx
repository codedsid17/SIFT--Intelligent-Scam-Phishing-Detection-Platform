import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export type AppView = 'overview' | 'dashboard' | 'scanner' | 'results' | 'history' | 'safety';

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const NAV_ITEMS: Array<{ id: AppView; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'scanner', label: 'Scanner' },
  { id: 'history', label: 'History' },
  { id: 'safety', label: 'Safety Center' },
];

export function TopNav({ activeView, onNavigate }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060B16]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('overview')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-md py-1"
          aria-label="SIFT Home"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <path
              d="M14 2.5L24 6.8V13.6C24 19.6 19.7 24.4 14 26C8.3 24.4 4 19.6 4 13.6V6.8L14 2.5Z"
              stroke="#10B981"
              strokeWidth="1.75"
              fill="#0F172A"
            />
            <path
              d="M9 11.5H19M10.8 15H17.2M12.5 18.5H15.5"
              stroke="#8B5CF6"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-display text-lg font-bold tracking-tight text-slate-50">
            SIFT
          </span>
        </button>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeView === item.id || (item.id === 'scanner' && activeView === 'results');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded ${
                  isActive
                    ? 'text-slate-50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-emerald-400"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('scanner')}
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 whitespace-nowrap shrink-0"
          >
            Scan Now
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-300 hover:text-slate-100 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0A1122] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              activeView === item.id || (item.id === 'scanner' && activeView === 'results');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`block w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800/80 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSelect('scanner')}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Scan Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
