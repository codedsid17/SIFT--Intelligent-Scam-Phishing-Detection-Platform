import { ScanResult } from '../engine/types';

const STORAGE_KEY = 'sift_scan_history_v1';
const MAX_HISTORY_ITEMS = 100;

export function loadScanHistory(): ScanResult[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ScanResult =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.riskScore === 'number' &&
        typeof item.input === 'string'
    );
  } catch {
    return [];
  }
}

export function saveScanHistory(items: ScanResult[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const trimmed = items.slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function appendScanToHistory(result: ScanResult): ScanResult[] {
  const existing = loadScanHistory();
  const updated = [result, ...existing].slice(0, MAX_HISTORY_ITEMS);
  saveScanHistory(updated);
  return updated;
}

export function deleteScanFromHistory(id: string): ScanResult[] {
  const existing = loadScanHistory();
  const updated = existing.filter((item) => item.id !== id);
  saveScanHistory(updated);
  return updated;
}

export function clearAllScanHistory(): ScanResult[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  return [];
}
