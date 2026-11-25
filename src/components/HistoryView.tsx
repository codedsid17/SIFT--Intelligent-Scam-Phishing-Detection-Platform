import { Eye, Lock, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { RiskLevel, ScanResult, ScanType } from '../engine/types';
import { RiskStatusInline } from './RiskVisuals';
import { AppView } from './TopNav';

interface HistoryViewProps {
  history: ScanResult[];
  onSelectResult: (result: ScanResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (view: AppView) => void;
}

export function HistoryView({
  history,
  onSelectResult,
  onDeleteRecord,
  onClearAll,
  onNavigate,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ScanType>('all');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return history.filter((item) => {
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (q) {
        const hay = `${item.input} ${item.primaryCategory} ${item.summary}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [history, searchQuery, riskFilter, typeFilter]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Local Analysis History
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Stored exclusively in your browser’s local storage. Nothing is ever sent to a server.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {!confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-rose-500/60 hover:text-rose-300 whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear All History</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs">
                <span className="text-rose-200">Erase all {history.length} records?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                  }}
                  className="font-semibold text-rose-300 hover:text-rose-200 underline"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="text-slate-300 hover:text-white ml-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy Notice Banner */}
      <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-slate-800 bg-[#0A1122] px-4 py-3 text-xs text-slate-300">
        <Lock className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
        <span>
          Privacy Guarantee: History stays inside your browser. Deleting a record or clearing
          history permanently removes it from local storage.
        </span>
      </div>

      {/* Search & Segmented Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages, URLs, or categories..."
            aria-label="Search history"
            className="w-full rounded-lg border border-slate-800 bg-[#0F172A] py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Risk Level Filter */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0A1122] p-1">
            {(['all', 'High Risk', 'Suspicious', 'Low Risk'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setRiskFilter(level)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  riskFilter === level
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0A1122] p-1">
            {(['all', 'message', 'url'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  typeFilter === t
                    ? 'bg-slate-800 text-violet-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'url' ? 'URLs' : 'Messages'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Records */}
      {history.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-[#0F172A]/70 p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Your local scan history is empty
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Analyze a message or URL in the Scanner to save its risk breakdown here.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Start First Scan
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-[#0F172A]/70 p-10 text-center">
          <p className="text-sm text-slate-300">No scans match your current search or filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setRiskFilter('all');
              setTypeFilter('all');
            }}
            className="mt-4 text-xs font-medium text-emerald-400 hover:text-emerald-300"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#0F172A]/90">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-800/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                  <RiskStatusInline level={item.riskLevel} score={item.riskScore} />
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-300">{item.primaryCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono uppercase">{item.type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 truncate text-sm text-slate-100 font-medium">{item.input}</p>
                <p className="mt-1 text-xs text-slate-400 line-clamp-1">{item.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectResult(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-emerald-500/60 hover:text-emerald-300 whitespace-nowrap"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Inspect</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRecord(item.id)}
                  aria-label="Delete scan record"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-800 p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
