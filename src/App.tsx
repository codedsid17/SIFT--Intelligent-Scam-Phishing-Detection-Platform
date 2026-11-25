import { useCallback, useEffect, useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { LandingView } from './components/LandingView';
import { ResultsView } from './components/ResultsView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { ScannerView } from './components/ScannerView';
import { AppView, TopNav } from './components/TopNav';
import { SAMPLE_MESSAGES, SAMPLE_URLS } from './data/samples';
import { runScan } from './engine/detectionEngine';
import { ScanResult, ScanType } from './engine/types';
import {
  appendScanToHistory,
  clearAllScanHistory,
  deleteScanFromHistory,
  loadScanHistory,
  saveScanHistory,
} from './storage/historyStorage';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [history, setHistory] = useState<ScanResult[]>(() => loadScanHistory());
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerPrefill, setScannerPrefill] = useState<{
    content: string;
    type: ScanType;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const executeScan = useCallback((input: string, type: ScanType) => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const result = runScan(input, type);
        const updated = appendScanToHistory(result);
        setHistory(updated);
        setCurrentResult(result);
        setActiveView('results');
      } finally {
        setIsScanning(false);
      }
    }, 280);
  }, []);

  const handleQuickScan = useCallback((input: string, type: ScanType) => {
    const result = runScan(input, type);
    const updated = appendScanToHistory(result);
    setHistory(updated);
    setCurrentResult(result);
    setActiveView('results');
  }, []);

  const handleRunSampleBatch = useCallback(() => {
    const sampleBatch = [
      ...SAMPLE_MESSAGES.slice(0, 6),
      ...SAMPLE_URLS.slice(0, 3),
    ];
    const results = sampleBatch.map((item, idx) => {
      const res = runScan(item.content, item.type);
      return {
        ...res,
        timestamp: Date.now() - idx * 60000,
      };
    });
    const combined = [...results, ...loadScanHistory()].slice(0, 100);
    saveScanHistory(combined);
    setHistory(combined);
  }, []);

  const handleSelectResult = useCallback((result: ScanResult) => {
    setCurrentResult(result);
    setActiveView('results');
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    const updated = deleteScanFromHistory(id);
    setHistory(updated);
    setCurrentResult((prev) => (prev?.id === id ? null : prev));
  }, []);

  const handleClearAll = useCallback(() => {
    const updated = clearAllScanHistory();
    setHistory(updated);
    setCurrentResult(null);
  }, []);

  const handleTestExampleInScanner = useCallback((content: string, type: ScanType) => {
    setScannerPrefill({ content, type });
    setActiveView('scanner');
  }, []);

  const clearPrefill = useCallback(() => {
    setScannerPrefill(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060B16] text-slate-100">
      <TopNav activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1">
        {activeView === 'overview' && (
          <LandingView onNavigate={setActiveView} totalScansCount={history.length} />
        )}

        {activeView === 'dashboard' && (
          <DashboardView
            history={history}
            onQuickScan={handleQuickScan}
            onRunSampleBatch={handleRunSampleBatch}
            onSelectResult={handleSelectResult}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'scanner' && (
          <ScannerView
            prefill={scannerPrefill}
            onClearPrefill={clearPrefill}
            onRunScan={executeScan}
            isScanning={isScanning}
          />
        )}

        {activeView === 'results' && (
          <ResultsView
            result={currentResult}
            onScanAgain={() => setActiveView('scanner')}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'history' && (
          <HistoryView
            history={history}
            onSelectResult={handleSelectResult}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAll}
            onNavigate={setActiveView}
          />
        )}

        {activeView === 'safety' && (
          <SafetyCenterView onTestExampleInScanner={handleTestExampleInScanner} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060B16]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display font-semibold text-slate-200">SIFT</span>
            <span aria-hidden="true">·</span>
            <span>Think twice. Click once.</span>
            <span aria-hidden="true">·</span>
            <span>Client-side heuristic security analysis</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveView('scanner')}
              className="hover:text-slate-200 transition-colors"
            >
              Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="hover:text-slate-200 transition-colors"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="hover:text-slate-200 transition-colors"
            >
              Local History
            </button>
            <button
              type="button"
              onClick={() => setActiveView('safety')}
              className="hover:text-slate-200 transition-colors"
            >
              Safety Center
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
