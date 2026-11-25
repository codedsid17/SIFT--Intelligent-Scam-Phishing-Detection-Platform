import { ArrowRight, BarChart3, Play, Search, ShieldCheck } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { validateScanInput } from '../engine/detectionEngine';
import { ScamCategory, ScanResult, ScanType } from '../engine/types';
import { RiskStatusInline } from './RiskVisuals';
import { AppView } from './TopNav';

interface DashboardViewProps {
  history: ScanResult[];
  onQuickScan: (input: string, type: ScanType) => void;
  onRunSampleBatch: () => void;
  onSelectResult: (result: ScanResult) => void;
  onNavigate: (view: AppView) => void;
}

export function DashboardView({
  history,
  onQuickScan,
  onRunSampleBatch,
  onSelectResult,
  onNavigate,
}: DashboardViewProps) {
  const [quickInput, setQuickInput] = useState('');
  const [quickType, setQuickType] = useState<ScanType>('message');
  const [quickError, setQuickError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = history.length;
    const high = history.filter((h) => h.riskLevel === 'High Risk').length;
    const suspicious = history.filter((h) => h.riskLevel === 'Suspicious').length;
    const low = history.filter((h) => h.riskLevel === 'Low Risk').length;

    const categoryCounts = new Map<ScamCategory, number>();
    for (const item of history) {
      const cat = item.primaryCategory;
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    }

    const categoriesSorted = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1]);
    return { total, high, suspicious, low, categoriesSorted };
  }, [history]);

  const handleQuickSubmit = (e: FormEvent) => {
    e.preventDefault();
    const check = validateScanInput(quickInput, quickType);
    if (!check.valid) {
      setQuickError(check.error || 'Please enter content to scan.');
      return;
    }
    setQuickError(null);
    onQuickScan(check.normalizedInput, quickType);
    setQuickInput('');
  };

  // SVG donut geometry for Risk Distribution
  const donutSize = 148;
  const strokeWidth = 16;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const highDash = stats.total > 0 ? (stats.high / stats.total) * circumference : 0;
  const suspiciousDash = stats.total > 0 ? (stats.suspicious / stats.total) * circumference : 0;
  const lowDash = stats.total > 0 ? (stats.low / stats.total) * circumference : 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Security Overview Dashboard
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Live metrics calculated exclusively from your local browser scan history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('scanner')}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
        >
          <span>Open Full Scanner</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* 4-Column KPI Summary Strip */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5">
          <p className="text-xs font-medium text-slate-400">Total Scans Analyzed</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-slate-50">
            {stats.total}
          </p>
          <p className="mt-1 text-xs text-slate-500">Stored locally</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5">
          <p className="text-xs font-medium text-slate-400">High-Risk Detections</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-rose-400">
            {stats.high}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 60–100</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5">
          <p className="text-xs font-medium text-slate-400">Suspicious Detections</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-amber-400">
            {stats.suspicious}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 30–59</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5">
          <p className="text-xs font-medium text-slate-400">Low-Risk Verified</p>
          <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-emerald-400">
            {stats.low}
          </p>
          <p className="mt-1 text-xs text-slate-500">Score 0–29</p>
        </div>
      </div>

      {/* Quick Scanner Access Bar */}
      <form
        onSubmit={handleQuickSubmit}
        className="mt-6 rounded-xl border border-slate-800 bg-[#0A1122] p-5"
        noValidate
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="dashboard-quick-scan" className="text-sm font-semibold text-slate-100">
            Quick Scanner
          </label>
          <div className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-[#060B16] p-0.5">
            <button
              type="button"
              onClick={() => {
                setQuickType('message');
                setQuickError(null);
              }}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                quickType === 'message'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Message
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickType('url');
                setQuickError(null);
              }}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                quickType === 'url'
                  ? 'bg-slate-800 text-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              URL
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="dashboard-quick-scan"
            type="text"
            value={quickInput}
            onChange={(e) => {
              setQuickInput(e.target.value);
              if (quickError) setQuickError(null);
            }}
            placeholder={
              quickType === 'url'
                ? 'Paste a suspicious URL to inspect immediately...'
                : 'Paste a suspicious SMS, email, or chat snippet to analyze...'
            }
            className="flex-1 rounded-lg border border-slate-700 bg-[#060B16] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Analyze</span>
          </button>
        </div>

        {quickError && <p className="mt-2 text-xs text-rose-400">{quickError}</p>}
      </form>

      {/* Live Analytics Charts or Populated Empty State */}
      {stats.total === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/70 p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400" aria-hidden="true" />
          <h2 className="mt-4 font-display text-lg font-semibold text-slate-100">
            No scans recorded yet
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
            Your dashboard charts update in real time from local browser scans. Analyze a message
            above or run our realistic sample suite through the detection engine to inspect how
            SIFT classifies threats.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onRunSampleBatch}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400 whitespace-nowrap shrink-0"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              <span>Analyze Sample Suite</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 whitespace-nowrap shrink-0"
            >
              <span>Go to Scanner</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Risk Classification Distribution Donut */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Risk Classification Breakdown
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Proportional distribution across all {stats.total} scans
            </p>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative shrink-0" style={{ width: donutSize, height: donutSize }}>
                <svg
                  width={donutSize}
                  height={donutSize}
                  viewBox={`0 0 ${donutSize} ${donutSize}`}
                  className="-rotate-90"
                  role="img"
                  aria-label="Risk distribution chart"
                >
                  <circle
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth={strokeWidth}
                  />
                  {lowDash > 0 && (
                    <circle
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${lowDash} ${circumference}`}
                      strokeDashoffset={0}
                    />
                  )}
                  {suspiciousDash > 0 && (
                    <circle
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${suspiciousDash} ${circumference}`}
                      strokeDashoffset={-lowDash}
                    />
                  )}
                  {highDash > 0 && (
                    <circle
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${highDash} ${circumference}`}
                      strokeDashoffset={-(lowDash + suspiciousDash)}
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold tabular-nums text-slate-50">
                    {stats.total}
                  </span>
                  <span className="text-[11px] text-slate-400">Scans</span>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-medium">High Risk</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {stats.high} ({Math.round((stats.high / stats.total) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-medium">Suspicious</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {stats.suspicious} ({Math.round((stats.suspicious / stats.total) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-medium">Low Risk</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {stats.low} ({Math.round((stats.low / stats.total) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scam Category Breakdown Bars */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-100">
                  Detected Category Breakdown
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Primary classification frequency across local scans
                </p>
              </div>
              <BarChart3 className="h-4 w-4 text-violet-400" aria-hidden="true" />
            </div>

            <div className="mt-5 space-y-3.5">
              {stats.categoriesSorted.slice(0, 6).map(([category, count]) => {
                const pct = Math.round((count / stats.total) * 100);
                const isBenign = category === 'General / Benign';
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{category}</span>
                      <span className="font-mono tabular-nums text-slate-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          isBenign ? 'bg-emerald-500' : 'bg-violet-500'
                        }`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Scan History Table */}
      {history.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-slate-100">
              Recent Scan History
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View All ({history.length})
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="pb-3 font-medium">Content Snippet</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Classification</th>
                  <th className="pb-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {history.slice(0, 5).map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectResult(item)}
                    className="cursor-pointer transition-colors hover:bg-slate-800/40"
                  >
                    <td className="py-3 pr-4 max-w-xs truncate text-slate-200">
                      {item.input}
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400 uppercase font-mono">
                      {item.type}
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-300 whitespace-nowrap">
                      {item.primaryCategory}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      <RiskStatusInline level={item.riskLevel} />
                    </td>
                    <td className="py-3 text-right font-mono font-semibold tabular-nums text-slate-100">
                      {item.riskScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
