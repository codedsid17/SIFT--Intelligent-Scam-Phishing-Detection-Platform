import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Link2Off,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { DetectedIndicator, HighlightedSpan, ScanResult } from '../engine/types';
import { RiskGauge } from './RiskVisuals';
import { AppView } from './TopNav';

interface ResultsViewProps {
  result: ScanResult | null;
  onScanAgain: () => void;
  onNavigate: (view: AppView) => void;
}

function getIndicatorStyle(severity: DetectedIndicator['severity']) {
  switch (severity) {
    case 'high':
      return {
        textClass: 'text-rose-400',
        weightClass: 'text-rose-300',
        label: 'High',
        Icon: ShieldAlert,
      };
    case 'medium':
      return {
        textClass: 'text-amber-400',
        weightClass: 'text-amber-300',
        label: 'Medium',
        Icon: AlertTriangle,
      };
    case 'low':
      return {
        textClass: 'text-slate-300',
        weightClass: 'text-slate-300',
        label: 'Low',
        Icon: Info,
      };
    case 'mitigating':
    default:
      return {
        textClass: 'text-emerald-400',
        weightClass: 'text-emerald-300',
        label: 'Safe Context',
        Icon: ShieldCheck,
      };
  }
}

export function ResultsView({ result, onScanAgain, onNavigate }: ResultsViewProps) {
  const [selectedSpan, setSelectedSpan] = useState<HighlightedSpan | null>(null);

  if (!result) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl font-bold text-slate-100">No scan selected</h1>
        <p className="mt-2 text-sm text-slate-400">
          Run a new message or URL inspection to view detailed risk findings.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('scanner')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          Go to Scanner
        </button>
      </section>
    );
  }

  const positiveIndicators = result.indicators.filter((i) => i.weight > 0);
  const mitigatingIndicators = result.indicators.filter((i) => i.weight <= 0);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Action & Meta Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={onScanAgain}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Scanner</span>
          </button>
          <span aria-hidden="true">/</span>
          <span>{result.type === 'url' ? 'URL Analysis' : 'Message Analysis'}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View History</span>
          </button>
          <button
            type="button"
            onClick={onScanAgain}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Scan Again</span>
          </button>
        </div>
      </div>

      {/* Transparent Heuristic Disclaimer */}
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0A1122] px-4 py-3 text-xs text-slate-300">
        <Info className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
        <p>{result.disclaimer}</p>
      </div>

      {/* Primary Score & Classification Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Risk Score Gauge */}
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 flex flex-col items-center justify-center">
          <RiskGauge score={result.riskScore} level={result.riskLevel} />
          <div className="mt-5 w-full border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            <span>Scale: 0–29 Low Risk</span>
            <span aria-hidden="true"> · </span>
            <span>30–59 Suspicious</span>
            <span aria-hidden="true"> · </span>
            <span>60–100 High Risk</span>
          </div>
        </div>

        {/* Right: Category & Summary */}
        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Primary Classification</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {positiveIndicators.length} threat signal{positiveIndicators.length === 1 ? '' : 's'}
              </span>
              {mitigatingIndicators.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-mono tabular-nums">
                    {mitigatingIndicators.length} safety mitigation
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-2 font-display text-2xl font-bold text-slate-50">
              {result.primaryCategory}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{result.summary}</p>

            {result.detectedCategories.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">Related categories:</span>
                <span>{result.detectedCategories.join(' · ')}</span>
              </div>
            )}
          </div>

          {/* Recommended Next Steps */}
          <div className="mt-6 border-t border-slate-800 pt-5">
            <h2 className="text-sm font-semibold text-slate-100">Recommended Next Steps</h2>
            <ul className="mt-3 space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Highlighted Message Content */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-100">
              {result.type === 'url' ? 'Inspected URL String' : 'Inspected Content & Highlighted Phrases'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {result.suspiciousPhrases.length > 0
                ? 'Click any highlighted phrase below to view why the rule engine flagged it.'
                : 'No suspicious phrases were highlighted in the analyzed text.'}
            </p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {result.suspiciousPhrases.length} flagged span{result.suspiciousPhrases.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-slate-800 bg-[#060B16] p-4 text-sm leading-7 text-slate-200 whitespace-pre-wrap break-words">
          {result.highlightedSpans.map((span, idx) => {
            if (!span.isSuspicious) {
              return <span key={idx}>{span.text}</span>;
            }
            const highlightClass =
              span.severity === 'high'
                ? 'bg-rose-500/20 text-rose-200 underline decoration-rose-400 decoration-2 underline-offset-4'
                : span.severity === 'medium'
                ? 'bg-amber-500/20 text-amber-200 underline decoration-amber-400 decoration-2 underline-offset-4'
                : 'bg-violet-500/20 text-violet-200 underline decoration-violet-400 decoration-dotted underline-offset-4';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSpan(span)}
                className={`inline rounded px-1 py-0.5 font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${highlightClass}`}
                title={span.ruleLabel}
              >
                {span.text}
              </button>
            );
          })}
        </div>

        {selectedSpan && (
          <div className="mt-3 rounded-lg border border-slate-700 bg-[#0A1122] p-3.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-100">{selectedSpan.ruleLabel}</span>
              <button
                type="button"
                onClick={() => setSelectedSpan(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                Dismiss
              </button>
            </div>
            <p className="mt-1 text-slate-300">{selectedSpan.explanation}</p>
          </div>
        )}
      </div>

      {/* URL Structure & Extracted Links Anatomy (Non-clickable for safety) */}
      {result.extractedUrls.length > 0 && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Link2Off className="h-4 w-4 text-violet-400" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-slate-100">
                URL Structure Dissection (Links Disabled for Safety)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {result.extractedUrls.length} URL{result.extractedUrls.length === 1 ? '' : 's'} analyzed without opening
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {result.extractedUrls.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-[#060B16] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="text-xs text-slate-200 break-all">{item.url}</code>
                  <span
                    className={`text-xs font-mono font-semibold tabular-nums ${
                      item.score >= 60
                        ? 'text-rose-400'
                        : item.score >= 30
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {item.riskLevel} ({item.score}/100)
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Protocol</p>
                    <p className="mt-0.5 font-mono text-slate-200">
                      {item.anatomy.protocol === 'https'
                        ? 'https (TLS)'
                        : item.anatomy.protocol === 'http'
                        ? 'http (Unencrypted)'
                        : 'Unspecified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Subdomains</p>
                    <p className="mt-0.5 font-mono text-slate-200 break-all">
                      {item.anatomy.subdomains.length > 0
                        ? item.anatomy.subdomains.join('.')
                        : 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Registrable Domain</p>
                    <p className="mt-0.5 font-mono font-semibold text-emerald-300 break-all">
                      {item.anatomy.registrableDomain}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Path & Query</p>
                    <p className="mt-0.5 font-mono text-slate-300 truncate" title={item.anatomy.pathAndQuery}>
                      {item.anatomy.pathAndQuery || '/'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Explanations of All Triggered Rules */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6">
        <h2 className="font-display text-lg font-semibold text-slate-100">
          Detection Signal Breakdown
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Transparent list of every heuristic rule and contextual adjustment applied to calculate
          the {result.riskScore}/100 score.
        </p>

        {result.indicators.length === 0 ? (
          <div className="mt-4 rounded-lg border border-slate-800 bg-[#060B16] p-5 text-sm text-slate-300">
            No risk indicators or warning patterns matched in this input.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-800/80 border-t border-slate-800">
            {result.indicators.map((ind) => {
              const { textClass, weightClass, label, Icon } = getIndicatorStyle(ind.severity);
              return (
                <div key={ind.id} className="py-4 first:pt-4 last:pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 shrink-0 ${textClass}`} aria-hidden="true" />
                      <span className="text-sm font-semibold text-slate-100">{ind.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{ind.group}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className={textClass}>{label}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className={`font-mono font-semibold tabular-nums ${weightClass}`}>
                        {ind.weight > 0 ? `+${ind.weight}` : ind.weight} pts
                      </span>
                    </div>
                  </div>
                  {ind.matchedText && (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Matched:{' '}
                      <code className="rounded bg-[#060B16] px-1.5 py-0.5 text-slate-200">
                        {ind.matchedText}
                      </code>
                    </p>
                  )}
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{ind.explanation}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
