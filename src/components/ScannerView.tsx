import { AlertCircle, Eraser, Link2, Lock, MessageSquareText, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { SAMPLE_MESSAGES, SAMPLE_URLS } from '../data/samples';
import { validateScanInput } from '../engine/detectionEngine';
import { ScanType } from '../engine/types';

interface ScannerViewProps {
  initialType?: ScanType;
  prefill?: { content: string; type: ScanType } | null;
  onClearPrefill?: () => void;
  onRunScan: (input: string, type: ScanType) => void;
  isScanning: boolean;
}

export function ScannerView({
  initialType = 'message',
  prefill,
  onClearPrefill,
  onRunScan,
  isScanning,
}: ScannerViewProps) {
  const [scanType, setScanType] = useState<ScanType>(initialType);
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');

  useEffect(() => {
    if (prefill) {
      setScanType(prefill.type);
      setInputText(prefill.content);
      setErrorMessage(null);
      setWarningMessage(null);
      setSelectedSampleId('');
      onClearPrefill?.();
    }
  }, [prefill, onClearPrefill]);

  const samples = scanType === 'message' ? SAMPLE_MESSAGES : SAMPLE_URLS;

  const handleTabChange = (nextType: ScanType) => {
    if (nextType === scanType) return;
    setScanType(nextType);
    setInputText('');
    setErrorMessage(null);
    setWarningMessage(null);
    setSelectedSampleId('');
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const match = samples.find((s) => s.id === sampleId);
    if (match) {
      setInputText(match.content);
      setErrorMessage(null);
      setWarningMessage(null);
    }
  };

  const handleClear = () => {
    setInputText('');
    setErrorMessage(null);
    setWarningMessage(null);
    setSelectedSampleId('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateScanInput(inputText, scanType);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please provide valid input.');
      setWarningMessage(null);
      return;
    }
    setErrorMessage(null);
    setWarningMessage(validation.warning || null);
    onRunScan(validation.normalizedInput, scanType);
  };

  const charCount = inputText.length;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            Threat & Phishing Scanner
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Analyze SMS, email, WhatsApp messages, or standalone URLs locally in your browser.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div
          role="tablist"
          aria-label="Scanner Mode"
          className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0A1122] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={scanType === 'message'}
            onClick={() => handleTabChange('message')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              scanType === 'message'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-slate-100'
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Message Scanner</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scanType === 'url'}
            onClick={() => handleTabChange('url')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
              scanType === 'url'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-300 hover:text-slate-100'
            }`}
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>URL Scanner</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Surface */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-5 sm:p-7"
        noValidate
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <label
            htmlFor="sift-scan-input"
            className="text-sm font-semibold text-slate-100"
          >
            {scanType === 'message'
              ? 'Paste SMS, email, or chat content'
              : 'Enter suspicious URL to dissect (never opened)'}
          </label>

          {/* Sample Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="sift-sample-select" className="text-xs text-slate-400 whitespace-nowrap">
              Load example:
            </label>
            <select
              id="sift-sample-select"
              value={selectedSampleId}
              onChange={(e) => handleSelectSample(e.target.value)}
              className="rounded-lg border border-slate-700 bg-[#060B16] px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[260px]"
            >
              <option value="">Choose a realistic sample...</option>
              {samples.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {scanType === 'message' ? (
            <textarea
              id="sift-scan-input"
              rows={7}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Paste the full message here—including any links, sender claims, or payment instructions..."
              className="w-full rounded-lg border border-slate-700/90 bg-[#060B16] p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={isScanning}
            />
          ) : (
            <input
              id="sift-scan-input"
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. http://paypal.com.account-verify-alert.xyz/login"
              className="w-full rounded-lg border border-slate-700/90 bg-[#060B16] px-4 py-3.5 font-mono text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={isScanning}
              autoComplete="off"
              spellCheck={false}
            />
          )}
        </div>

        {/* Input metadata & length counter */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              {scanType === 'url'
                ? 'Passive lexical check only—SIFT never visits or fetches the URL.'
                : 'Runs 100% locally in your browser. Zero content leaves your device.'}
            </span>
          </div>
          <span className="font-mono tabular-nums">
            {charCount.toLocaleString()} / 10,000 chars
          </span>
        </div>

        {charCount > 10000 && (
          <p className="mt-3 text-xs text-amber-400">
            Message exceeds 10,000 characters; only the first 10,000 characters will be analyzed.
          </p>
        )}

        {warningMessage && (
          <div
            role="status"
            className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{warningMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading indicator */}
        {isScanning && (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300"
          >
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"
              aria-hidden="true"
            />
            <span>Inspecting lexical patterns, URL structure, and contextual signals locally...</span>
          </div>
        )}

        {/* Action Row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isScanning || (!inputText && !errorMessage)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            <span>Clear</span>
          </button>

          <button
            type="submit"
            disabled={isScanning}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>{isScanning ? 'Analyzing...' : 'Analyze Now'}</span>
          </button>
        </div>
      </form>

      {/* Quick Sample Cards for 1-click Testing */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-200">
          Quick Test Scenarios ({scanType === 'message' ? 'Messages' : 'URLs'})
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Select any scenario to populate the scanner and run it through the live rule engine.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample.id)}
              className={`text-left rounded-lg border p-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                selectedSampleId === sample.id
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : 'border-slate-800 bg-[#0A1122] hover:border-slate-700 hover:bg-[#0F172A]'
              }`}
            >
              <p className="text-xs font-semibold text-slate-100 line-clamp-1">
                {sample.label}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">{sample.categoryHint}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
