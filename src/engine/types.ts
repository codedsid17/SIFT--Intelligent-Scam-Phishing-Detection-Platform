export type ScanType = 'message' | 'url';

export type RiskLevel = 'Low Risk' | 'Suspicious' | 'High Risk';

export type ScamCategory =
  | 'Banking Fraud'
  | 'Phishing'
  | 'Fake Employment'
  | 'Investment Fraud'
  | 'Lottery Scam'
  | 'Delivery Scam'
  | 'Impersonation'
  | 'Social Engineering'
  | 'General / Benign';

export type IndicatorGroup =
  | ScamCategory
  | 'URL Structure'
  | 'Urgency & Pressure'
  | 'Credential Harvesting'
  | 'Financial Request'
  | 'Contextual Safety';

export type IndicatorSeverity = 'high' | 'medium' | 'low' | 'mitigating';

export interface DetectedIndicator {
  id: string;
  ruleId: string;
  label: string;
  group: IndicatorGroup;
  severity: IndicatorSeverity;
  weight: number;
  matchedText?: string;
  explanation: string;
}

export interface HighlightedSpan {
  text: string;
  isSuspicious: boolean;
  severity?: 'high' | 'medium' | 'low';
  ruleLabel?: string;
  explanation?: string;
}

export interface UrlAnatomy {
  raw: string;
  protocol: string;
  hasTls: boolean;
  usernameInfo?: string;
  hostname: string;
  subdomains: string[];
  registrableDomain: string;
  tld: string;
  port?: string;
  pathAndQuery: string;
  isIpAddress: boolean;
  isShortener: boolean;
  isOfficialTrustedDomain: boolean;
}

export interface ExtractedUrlFinding {
  url: string;
  score: number;
  riskLevel: RiskLevel;
  anatomy: UrlAnatomy;
  indicators: DetectedIndicator[];
}

export interface ScanResult {
  id: string;
  type: ScanType;
  input: string;
  truncatedInput: boolean;
  timestamp: number;
  riskScore: number;
  rawScore: number;
  riskLevel: RiskLevel;
  primaryCategory: ScamCategory;
  detectedCategories: ScamCategory[];
  indicators: DetectedIndicator[];
  suspiciousPhrases: string[];
  highlightedSpans: HighlightedSpan[];
  extractedUrls: ExtractedUrlFinding[];
  urlAnatomy?: UrlAnatomy;
  recommendations: string[];
  summary: string;
  disclaimer: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  normalizedInput: string;
  truncated: boolean;
}
