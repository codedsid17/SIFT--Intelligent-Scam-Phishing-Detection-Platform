import { analyzeMessageContent } from './messageAnalyzer';
import { generateRecommendations } from './recommendations';
import {
  ScamCategory,
  ScanResult,
  ScanType,
  ValidationResult,
} from './types';
import { analyzeUrlStructure, classifyRiskLevel } from './urlAnalyzer';

const MAX_INPUT_LENGTH = 10000;

export const HEURISTIC_DISCLAIMER =
  'Automated heuristic risk assessment — not a guarantee. Always verify unexpected requests independently through official apps, websites, or phone numbers.';

export function validateScanInput(rawInput: string, type: ScanType): ValidationResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      valid: false,
      error:
        type === 'url'
          ? 'Please enter a URL to inspect before analyzing.'
          : 'Please paste a message (SMS, email, or chat text) before analyzing.',
      normalizedInput: '',
      truncated: false,
    };
  }

  if (type === 'url') {
    if (trimmed.length < 4 || !/[a-zA-Z0-9]/.test(trimmed) || !trimmed.includes('.')) {
      return {
        valid: false,
        error: 'Enter a valid domain or URL (for example: https://example.com/login or bit.ly/3xYz).',
        normalizedInput: trimmed,
        truncated: false,
      };
    }
    if (/\s/.test(trimmed)) {
      return {
        valid: false,
        error: 'URLs cannot contain spaces. Use the Message Scanner tab to analyze full messages.',
        normalizedInput: trimmed,
        truncated: false,
      };
    }
  }

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return {
      valid: true,
      warning: `Input exceeded ${MAX_INPUT_LENGTH.toLocaleString()} characters and was safely trimmed to the first ${MAX_INPUT_LENGTH.toLocaleString()} characters for analysis.`,
      normalizedInput: trimmed.slice(0, MAX_INPUT_LENGTH),
      truncated: true,
    };
  }

  return {
    valid: true,
    normalizedInput: trimmed,
    truncated: false,
  };
}

function createScanId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function analyzeMessage(rawInput: string): ScanResult {
  const validation = validateScanInput(rawInput, 'message');
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid message input');
  }

  const text = validation.normalizedInput;
  const analysis = analyzeMessageContent(text);
  const riskScore = Math.max(0, Math.min(100, Math.round(analysis.rawScore)));
  const riskLevel = classifyRiskLevel(riskScore);

  const detectedCategories: ScamCategory[] =
    riskScore < 20 && analysis.categories.length === 0
      ? ['General / Benign']
      : analysis.categories.length > 0
      ? analysis.categories
      : ['General / Benign'];

  const primaryCategory: ScamCategory =
    riskLevel === 'Low Risk' && riskScore < 20
      ? 'General / Benign'
      : detectedCategories[0];

  const recommendations = generateRecommendations(
    riskLevel,
    detectedCategories,
    analysis.extractedUrls.length > 0
  );

  const positiveCount = analysis.indicators.filter((i) => i.weight > 0).length;
  const summary =
    riskLevel === 'High Risk'
      ? `Detected ${positiveCount} high-confidence threat signals consistent with ${primaryCategory.toLowerCase()}.`
      : riskLevel === 'Suspicious'
      ? `Detected ${positiveCount} suspicious indicators associated with ${primaryCategory.toLowerCase()}. Independent verification recommended.`
      : positiveCount === 0
      ? 'No significant fraud or phishing patterns were detected in this message.'
      : 'Minor terms matched, but overall context appears low risk with no coercive demands.';

  return {
    id: createScanId(),
    type: 'message',
    input: text,
    truncatedInput: validation.truncated,
    timestamp: Date.now(),
    riskScore,
    rawScore: analysis.rawScore,
    riskLevel,
    primaryCategory,
    detectedCategories,
    indicators: analysis.indicators,
    suspiciousPhrases: analysis.suspiciousPhrases,
    highlightedSpans: analysis.highlightedSpans,
    extractedUrls: analysis.extractedUrls,
    recommendations,
    summary,
    disclaimer: HEURISTIC_DISCLAIMER,
  };
}

export function analyzeUrl(rawInput: string): ScanResult {
  const validation = validateScanInput(rawInput, 'url');
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid URL input');
  }

  const url = validation.normalizedInput;
  const finding = analyzeUrlStructure(url);
  const riskScore = finding.score;
  const riskLevel = finding.riskLevel;

  const categoriesSet = new Set<ScamCategory>();
  for (const ind of finding.indicators) {
    if (ind.group === 'Phishing' || ind.group === 'Credential Harvesting' || ind.group === 'URL Structure') {
      if (ind.weight > 0) categoriesSet.add('Phishing');
    } else if (ind.group === 'Impersonation') {
      if (ind.weight > 0) categoriesSet.add('Impersonation');
    }
  }

  const detectedCategories: ScamCategory[] =
    riskScore < 20 || categoriesSet.size === 0
      ? ['General / Benign']
      : Array.from(categoriesSet);

  const primaryCategory = detectedCategories[0];
  const recommendations = generateRecommendations(riskLevel, detectedCategories, true);
  const positiveCount = finding.indicators.filter((i) => i.weight > 0).length;

  const summary =
    riskLevel === 'High Risk'
      ? `URL structure exhibits ${positiveCount} high-risk phishing or obfuscation traits without opening the destination.`
      : riskLevel === 'Suspicious'
      ? `URL exhibits ${positiveCount} structural warning signs that warrant caution before visiting.`
      : 'URL structure appears nominal and uses clean domain formatting.';

  return {
    id: createScanId(),
    type: 'url',
    input: url,
    truncatedInput: validation.truncated,
    timestamp: Date.now(),
    riskScore,
    rawScore: riskScore,
    riskLevel,
    primaryCategory,
    detectedCategories,
    indicators: finding.indicators,
    suspiciousPhrases: finding.indicators
      .filter((i) => i.weight > 0 && i.matchedText)
      .map((i) => i.matchedText as string),
    highlightedSpans: [
      {
        text: url,
        isSuspicious: riskScore >= 30,
        severity: riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : undefined,
        ruleLabel: riskScore >= 30 ? `URL Risk Score ${riskScore}/100` : undefined,
        explanation: finding.indicators[0]?.explanation,
      },
    ],
    extractedUrls: [finding],
    urlAnatomy: finding.anatomy,
    recommendations,
    summary,
    disclaimer: HEURISTIC_DISCLAIMER,
  };
}

export function runScan(input: string, type: ScanType): ScanResult {
  return type === 'url' ? analyzeUrl(input) : analyzeMessage(input);
}
