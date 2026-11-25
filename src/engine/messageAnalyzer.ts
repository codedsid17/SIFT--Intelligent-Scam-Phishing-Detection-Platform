import {
  DetectedIndicator,
  ExtractedUrlFinding,
  HighlightedSpan,
  IndicatorGroup,
  IndicatorSeverity,
  ScamCategory,
} from './types';
import { analyzeUrlStructure, extractUrlsFromText } from './urlAnalyzer';

interface RuleDefinition {
  ruleId: string;
  label: string;
  group: IndicatorGroup;
  category?: ScamCategory;
  severity: Exclude<IndicatorSeverity, 'mitigating'>;
  weight: number;
  patterns: RegExp[];
  explanation: string;
  requiresCoSignalForHighRisk?: boolean;
}

interface SpanMatch {
  start: number;
  end: number;
  severity: 'high' | 'medium' | 'low';
  ruleLabel: string;
  explanation: string;
}

const MESSAGE_RULES: RuleDefinition[] = [
  // 1. Urgent account verification
  {
    ruleId: 'KW_URGENT_VERIFY',
    label: 'Urgent account verification demand',
    group: 'Urgency & Pressure',
    category: 'Phishing',
    severity: 'high',
    weight: 22,
    patterns: [
      /\bverify your (?:account|identity|details|information|email|card)\b/gi,
      /\bconfirm your (?:identity|account|details|payment)\b/gi,
      /\b(?:re-?activate|unlock|restore) your account\b/gi,
      /\baccount verification required\b/gi,
      /\bunusual (?:sign-?in|login|activity) detected\b/gi,
    ],
    explanation:
      'Phishing messages frequently manufacture urgent account verification prompts to push recipients into entering credentials on lookalike pages.',
  },

  // 2. Threatening account suspension / legal threats
  {
    ruleId: 'PAT_ACCOUNT_SUSPENSION',
    label: 'Threat of account suspension or closure',
    group: 'Urgency & Pressure',
    category: 'Social Engineering',
    severity: 'high',
    weight: 20,
    patterns: [
      /\b(?:account|card|access|service)\s+(?:has been|will be|is)\s+(?:suspended|locked|restricted|frozen|terminated|deactivated|closed)\b/gi,
      /\bpermanently (?:closed|disabled|suspended|blocked)\b/gi,
      /\bavoid (?:suspension|closure|deactivation|termination)\b/gi,
      /\bsuspension notice\b/gi,
    ],
    explanation:
      'Threatening immediate account lockouts is a classic fear tactic designed to bypass careful scrutiny.',
  },

  // 3. Urgency & time-pressure language
  {
    ruleId: 'PAT_TIME_PRESSURE',
    label: 'High-pressure urgency phrasing',
    group: 'Urgency & Pressure',
    category: 'Social Engineering',
    severity: 'medium',
    weight: 14,
    patterns: [
      /\b(?:act now|respond immediately|urgent action required|immediate attention)\b/gi,
      /\bwithin (?:24|12|6|2|48)\s*hours?\b/gi,
      /\b(?:final warning|final notice|last chance|expires today|expires in \d+)\b/gi,
      /\bfailure to (?:comply|verify|respond|update|pay)\b/gi,
    ],
    explanation:
      'Artificial deadlines pressure victims into acting quickly before verifying the claim through official channels.',
  },

  // 4. OTP / Verification Code Harvesting
  {
    ruleId: 'KW_OTP_HARVEST',
    label: 'Request to share a one-time passcode (OTP)',
    group: 'Credential Harvesting',
    category: 'Phishing',
    severity: 'high',
    weight: 34,
    patterns: [
      /\b(?:send|share|provide|reply with|forward|give me|enter)\s+(?:your|the)\s+(?:\d-digit\s+)?(?:otp|one-?time\s+(?:passcode|password|code)|verification code|security code|2fa code)\b/gi,
      /\bcode\s+to\s+(?:cancel|verify|stop|confirm)\s+(?:the\s+)?(?:transaction|order|transfer)\b/gi,
      /\bread (?:back|me) the code\b/gi,
    ],
    explanation:
      'Legitimate banks and services will never ask you to read, forward, or reply with a one-time verification code. Sharing an OTP lets attackers hijack accounts or authorize transfers.',
  },

  // 5. Password / PIN / Financial Credential Requests
  {
    ruleId: 'KW_CREDENTIAL_REQUEST',
    label: 'Request for password, PIN, CVV, or recovery phrase',
    group: 'Credential Harvesting',
    category: 'Phishing',
    severity: 'high',
    weight: 36,
    patterns: [
      /\b(?:enter|provide|confirm|submit|send|update)\s+(?:your\s+)?(?:password|pin\b|cvv|cvc|card number|routing number|social security|ssn\b|mother'?s maiden)\b/gi,
      /\b(?:seed phrase|recovery phrase|12-?word|24-?word|private key|secret recovery)\b/gi,
      /\blogin credentials\b/gi,
    ],
    explanation:
      'Messages asking directly for passwords, PINs, SSNs, or crypto recovery phrases are strong indicators of credential harvesting.',
  },

  // 6. Suspicious Payment Requests (Gift Cards, Crypto, Wire, Fees)
  {
    ruleId: 'KW_SUSPICIOUS_PAYMENT',
    label: 'High-risk payment method or upfront fee request',
    group: 'Financial Request',
    category: 'Social Engineering',
    severity: 'high',
    weight: 30,
    patterns: [
      /\b(?:gift card|apple card|itunes card|google play card|steam card|razer gold)\b/gi,
      /\b(?:pay (?:a )?(?:small )?(?:processing|customs|redelivery|release|clearance|verification|handling) fee)\b/gi,
      /\b(?:send|transfer)\s+(?:via\s+)?(?:bitcoin|btc|usdt|crypto|western union|moneygram|wire transfer)\b/gi,
      /\b(?:zelle|cashapp|venmo)\s+(?:immediately|now|to claim|to unlock)\b/gi,
      /\bupfront (?:fee|deposit|charge|payment)\b/gi,
    ],
    explanation:
      'Scammers favor irreversible payment methods (gift cards, crypto, wire transfers) or small "release fees" to extract money quickly.',
  },

  // 7. Bank Impersonation
  {
    ruleId: 'KW_BANK_IMPERSONATION',
    label: 'Financial institution or fraud-desk reference',
    group: 'Banking Fraud',
    category: 'Banking Fraud',
    severity: 'medium',
    weight: 10,
    requiresCoSignalForHighRisk: true,
    patterns: [
      /\b(?:chase|bank of america|wells fargo|citibank|capital one|hsbc|barclays|hdfc|icici|sbi|td bank|paypal|venmo)\b/gi,
      /\b(?:fraud department|security alert|debit card|credit card|bank account)\b/gi,
      /\bunauthorized (?:transaction|charge|purchase|wire)\b/gi,
    ],
    explanation:
      'References a major bank or payment brand. Safe when accompanied by official anti-phishing warnings, but risky when paired with urgency, links, or credential requests.',
  },

  // 8. Government / Law Enforcement / Tax / Toll Impersonation
  {
    ruleId: 'KW_GOV_IMPERSONATION',
    label: 'Government, tax, or legal-threat impersonation',
    group: 'Impersonation',
    category: 'Impersonation',
    severity: 'high',
    weight: 26,
    patterns: [
      /\b(?:irs|hmrc|social security administration|federal agent|department of treasury)\b/gi,
      /\b(?:arrest warrant|warrant issued|lawsuit filed|legal action will be taken|court summons)\b/gi,
      /\b(?:unpaid toll|toll violation|ezpass|fastrak|dmv suspension|license suspended)\b/gi,
      /\b(?:tax refund|stimulus claim|unclaimed tax)\b/gi,
    ],
    explanation:
      'Impersonating tax agencies, toll authorities, or law enforcement with threats of arrest or fines is a widespread intimidation scam.',
  },

  // 9. Lottery and Prize Scams
  {
    ruleId: 'KW_LOTTERY_SCAM',
    label: 'Unsolicited lottery, sweepstakes, or prize claim',
    group: 'Lottery Scam',
    category: 'Lottery Scam',
    severity: 'high',
    weight: 34,
    patterns: [
      /\b(?:congratulations[,!]?\s+you(?:'ve| have)? won|you are (?:our )?(?:a )?lucky winner|selected as (?:a )?winner)\b/gi,
      /\b(?:claim your (?:cash )?prize|claim your reward|lottery winnings|mega millions|sweepstakes winner)\b/gi,
      /\b(?:unclaimed inheritance|next of kin|million dollars|usd \d+[,\d]*)\b/gi,
      /\bwon a brand new\b/gi,
    ],
    explanation:
      'Unsolicited prize and lottery notifications are almost always advance-fee or credential-harvesting scams.',
  },

  // 10. Fake Job / Employment Offers (granular multi-signal rules)
  {
    ruleId: 'KW_FAKE_JOB_PAY',
    label: 'Unrealistic pay or zero-experience remote job claim',
    group: 'Fake Employment',
    category: 'Fake Employment',
    severity: 'high',
    weight: 26,
    patterns: [
      /\b(?:earn \$\d+[\d,]*\s*(?:per day|daily|a day|weekly|a week)|make \$\d{3,4}\+?\s*(?:daily|weekly))\b/gi,
      /\bno experience (?:needed|required)\b/gi,
      /\b(?:part-?time remote (?:task|data entry|rating|review) job|app optimization job)\b/gi,
    ],
    explanation:
      'Fake job offers lure applicants with inflated daily wages for simple data-entry or rating tasks requiring no prior experience.',
  },
  {
    ruleId: 'KW_FAKE_JOB_CHANNEL',
    label: 'Off-platform recruitment via WhatsApp or Telegram',
    group: 'Fake Employment',
    category: 'Fake Employment',
    severity: 'high',
    weight: 24,
    patterns: [
      /\b(?:contact|reply|message)\s+(?:our|the)?\s*(?:hr\s+manager|hiring\s+manager|hr|recruiter|manager)\s+(?:on|via)\s+(?:whatsapp|telegram)\b/gi,
      /\b(?:whatsapp|telegram)\s+(?:recruiter|interview|onboarding)\b/gi,
    ],
    explanation:
      'Legitimate employers conduct interviews through verified corporate channels rather than unverified Telegram or WhatsApp chats.',
  },
  {
    ruleId: 'KW_FAKE_CHECK_SUPPLIES',
    label: 'Fake check or upfront supplies deposit instruction',
    group: 'Financial Request',
    category: 'Fake Employment',
    severity: 'high',
    weight: 32,
    patterns: [
      /\b(?:deposit this check|mobile deposit.*check).*(?:supplies|equipment|laptop|software)\b/gi,
      /\b(?:equipment check|buy supplies from our vendor)\b/gi,
    ],
    explanation:
      'Check-overpayment employment scams send counterfeit checks and instruct victims to forward real funds for "home-office supplies" before the check bounces.',
  },

  // 11. Delivery / Parcel Scams
  {
    ruleId: 'KW_DELIVERY_SCAM',
    label: 'Parcel delivery or customs clearance alert',
    group: 'Delivery Scam',
    category: 'Delivery Scam',
    severity: 'medium',
    weight: 16,
    patterns: [
      /\b(?:usps|fedex|ups|dhl|royal mail|canada post)\b/gi,
      /\b(?:parcel|package|shipment|delivery)\s+(?:is\s+)?(?:on hold|held at (?:the )?warehouse|could not be delivered|suspended|returned)\b/gi,
      /\b(?:incomplete (?:shipping )?address|update your delivery address|reschedule delivery|redelivery fee|customs duty)\b/gi,
    ],
    explanation:
      'Delivery smishing texts pretend a package is stalled due to an invalid address or small customs fee to steal payment card details.',
  },

  // 12. Investment / Crypto Scams
  {
    ruleId: 'KW_INVESTMENT_SCAM',
    label: 'High-yield or guaranteed investment / crypto promise',
    group: 'Investment Fraud',
    category: 'Investment Fraud',
    severity: 'high',
    weight: 30,
    patterns: [
      /\b(?:guaranteed (?:returns?|profit|roi)|risk-?free (?:profit|investment|trading))\b/gi,
      /\b(?:double your (?:bitcoin|crypto|eth|money|investment))\b/gi,
      /\b(?:forex signals|vip trading group|whatsapp investment|exclusive crypto platform|ai trading bot)\b/gi,
      /\b(?:withdraw your profits|unlock your trading balance)\b/gi,
    ],
    explanation:
      'No legitimate investment offers guaranteed or risk-free returns. These phrases are hallmarks of advance-fee crypto and pig-butchering scams.',
  },

  // 13. Loan Scams
  {
    ruleId: 'KW_LOAN_SCAM',
    label: 'Guaranteed or no-credit-check loan solicitation',
    group: 'Financial Request',
    category: 'Investment Fraud',
    severity: 'high',
    weight: 26,
    patterns: [
      /\b(?:guaranteed loan approval|instant loan approved|pre-?approved for \$\d+)\b/gi,
      /\b(?:no credit check required|bad credit ok)\b/gi,
      /\b(?:pay insurance fee to release loan|processing charge to disburse)\b/gi,
    ],
    explanation:
      'Advance-fee loan scams promise guaranteed approval regardless of credit history, then demand upfront insurance or processing fees.',
  },

  // 14. Fake Customer Support & Remote Access
  {
    ruleId: 'KW_FAKE_SUPPORT',
    label: 'Unsolicited tech support or remote-access request',
    group: 'Impersonation',
    category: 'Impersonation',
    severity: 'high',
    weight: 30,
    patterns: [
      /\b(?:microsoft support|apple support|geek squad|norton|mcafee|amazon customer care)\b/gi,
      /\b(?:install|download)\s+(?:anydesk|teamviewer|ultraviewer|quicksupport)\b/gi,
      /\b(?:your (?:computer|device|pc) is infected|virus detected|trojan alert)\b/gi,
      /\bcall (?:our )?toll-?free (?:support|helpline)\b/gi,
    ],
    explanation:
      'Tech-support scammers pretend to be well-known companies and convince victims to install remote-desktop tools or call fake helplines.',
  },

  // 15. Suspicious Refund / Auto-Renewal Scams
  {
    ruleId: 'KW_REFUND_SCAM',
    label: 'Unsolicited refund or fake subscription renewal notice',
    group: 'Social Engineering',
    category: 'Social Engineering',
    severity: 'high',
    weight: 24,
    patterns: [
      /\b(?:accidental overcharge|claim your refund|refund is pending|reimbursement link)\b/gi,
      /\b(?:auto-?renew(?:ed|al) for \$\d+|charged \$\d+.*to cancel call)\b/gi,
      /\b(?:cancel this subscription immediately|dispute this \$\d+ charge)\b/gi,
    ],
    explanation:
      'Fake invoice and refund scams trick victims into calling a scammer helpline or entering bank details to "cancel" a non-existent charge.',
  },

  // 16. Pressure to Click Links
  {
    ruleId: 'PAT_CLICK_PRESSURE',
    label: 'Coercive prompt to click an embedded link',
    group: 'Urgency & Pressure',
    category: 'Phishing',
    severity: 'medium',
    weight: 16,
    patterns: [
      /\b(?:click here immediately|tap the link below|follow this link (?:to|immediately)|visit the link below|click below to)\b/gi,
    ],
    explanation:
      'Combining urgent calls to action with embedded links increases the chance a user clicks before inspecting the destination URL.',
  },

  // 17. Bypassing Security Procedures / Secrecy
  {
    ruleId: 'PAT_BYPASS_SECURITY',
    label: 'Request to bypass normal verification or keep secret',
    group: 'Social Engineering',
    category: 'Social Engineering',
    severity: 'high',
    weight: 26,
    patterns: [
      /\b(?:do not call (?:the|your) bank|don'?t tell anyone|keep this (?:strictly )?confidential)\b/gi,
      /\b(?:bypass verification|disable your antivirus|turn off two-?factor)\b/gi,
      /\b(?:do not mention this to branch staff)\b/gi,
    ],
    explanation:
      'Legitimate institutions never instruct you to stay silent, disable security protections, or avoid contacting official support.',
  },

  // 18. Threatening / Extortion Language
  {
    ruleId: 'KW_EXTORTION_THREAT',
    label: 'Intimidation or extortion threat',
    group: 'Social Engineering',
    category: 'Social Engineering',
    severity: 'high',
    weight: 30,
    patterns: [
      /\b(?:we (?:have )?recorded you|compromising (?:video|photos)|hacked your device|installed spyware)\b/gi,
      /\b(?:pay in bitcoin|send \$\d+ in btc|within 48 hours or i will release)\b/gi,
    ],
    explanation:
      'Sextortion and intimidation emails fabricate device compromises to coerce cryptocurrency payments.',
  },
];

interface MitigatingRule {
  ruleId: string;
  label: string;
  weight: number;
  patterns: RegExp[];
  explanation: string;
  suppressOtpHarvest?: boolean;
}

const MITIGATING_RULES: MitigatingRule[] = [
  {
    ruleId: 'CTX_ANTI_SHARING_NOTICE',
    label: 'Contains legitimate anti-sharing security warning',
    weight: -28,
    suppressOtpHarvest: true,
    patterns: [
      /\b(?:never|will not|won'?t)\s+(?:call|text|email|ask)\s+(?:you\s+)?(?:for|to share)\s+(?:this|your)?\s*(?:code|otp|passcode|pin|password)\b/gi,
      /\bdo not share this (?:code|otp|passcode|pin)\s+with anyone\b/gi,
      /\bif you did not request this,?\s+(?:please\s+)?ignore\b/gi,
      /\bno action is required\b/gi,
    ],
    explanation:
      'Includes explicit security guidance telling the recipient never to share the code, which is characteristic of genuine automated notifications.',
  },
  {
    ruleId: 'CTX_RECEIPT_CONVERSATIONAL',
    label: 'Benign conversational or informational phrasing without demands',
    weight: -12,
    patterns: [
      /\bthank you for your (?:order|payment|purchase)\b/gi,
      /\bthanks for paying me back\b/gi,
      /\blet'?s grab (?:coffee|lunch|dinner)\b/gi,
      /\bfind the (?:invoice|statement|receipt) attached\b/gi,
    ],
    explanation:
      'Language reflects normal personal or routine transactional correspondence without coercion or credential requests.',
  },
];

function buildHighlightedSpans(text: string, matches: SpanMatch[]): HighlightedSpan[] {
  if (matches.length === 0) {
    return [{ text, isSuspicious: false }];
  }

  const severityRank: Record<'high' | 'medium' | 'low', number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Sort by start index, then highest severity, then longest match
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const sevDiff = severityRank[b.severity] - severityRank[a.severity];
    if (sevDiff !== 0) return sevDiff;
    return b.end - b.start - (a.end - a.start);
  });

  // Merge/resolve overlapping spans cleanly
  const resolved: SpanMatch[] = [];
  for (const current of sorted) {
    const prev = resolved[resolved.length - 1];
    if (!prev || current.start >= prev.end) {
      resolved.push(current);
    } else if (severityRank[current.severity] > severityRank[prev.severity]) {
      // Keep higher severity if overlapping significantly
      if (current.end > prev.end) {
        resolved[resolved.length - 1] = current;
      }
    }
  }

  const spans: HighlightedSpan[] = [];
  let cursor = 0;

  for (const match of resolved) {
    if (match.start > cursor) {
      spans.push({
        text: text.slice(cursor, match.start),
        isSuspicious: false,
      });
    }
    spans.push({
      text: text.slice(match.start, match.end),
      isSuspicious: true,
      severity: match.severity,
      ruleLabel: match.ruleLabel,
      explanation: match.explanation,
    });
    cursor = Math.max(cursor, match.end);
  }

  if (cursor < text.length) {
    spans.push({
      text: text.slice(cursor),
      isSuspicious: false,
    });
  }

  return spans;
}

export interface MessageAnalysisOutput {
  rawScore: number;
  indicators: DetectedIndicator[];
  categories: ScamCategory[];
  suspiciousPhrases: string[];
  highlightedSpans: HighlightedSpan[];
  extractedUrls: ExtractedUrlFinding[];
}

export function analyzeMessageContent(text: string): MessageAnalysisOutput {
  const indicators: DetectedIndicator[] = [];
  const spanMatches: SpanMatch[] = [];
  const categoryWeights = new Map<ScamCategory, number>();
  const suspiciousPhrases = new Set<string>();
  let rawScore = 0;

  const addCategoryWeight = (cat: ScamCategory | undefined, weight: number) => {
    if (!cat || cat === 'General / Benign') return;
    categoryWeights.set(cat, (categoryWeights.get(cat) || 0) + weight);
  };

  // 1. Check mitigating context first so we know if anti-sharing notices exist
  const triggeredMitigations: MitigatingRule[] = [];
  let suppressOtpHarvest = false;

  for (const mit of MITIGATING_RULES) {
    let matchedSnippet: string | undefined;
    for (const pattern of mit.patterns) {
      pattern.lastIndex = 0;
      const m = pattern.exec(text);
      if (m) {
        matchedSnippet = m[0];
        break;
      }
    }
    if (matchedSnippet) {
      triggeredMitigations.push(mit);
      if (mit.suppressOtpHarvest) {
        suppressOtpHarvest = true;
      }
      indicators.push({
        id: `${mit.ruleId}-${indicators.length}`,
        ruleId: mit.ruleId,
        label: mit.label,
        group: 'Contextual Safety',
        severity: 'mitigating',
        weight: mit.weight,
        matchedText: matchedSnippet,
        explanation: mit.explanation,
      });
      rawScore += mit.weight;
    }
  }

  // 2. Run keyword & language pattern rules
  const matchedRuleIds = new Set<string>();

  for (const rule of MESSAGE_RULES) {
    if (rule.ruleId === 'KW_OTP_HARVEST' && suppressOtpHarvest) {
      continue;
    }

    const ruleMatches: string[] = [];

    for (const pattern of rule.patterns) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        const snippet = match[0];
        ruleMatches.push(snippet);
        suspiciousPhrases.add(snippet);
        spanMatches.push({
          start: match.index,
          end: match.index + snippet.length,
          severity: rule.severity,
          ruleLabel: rule.label,
          explanation: rule.explanation,
        });
        if (!pattern.global) break;
      }
    }

    if (ruleMatches.length > 0) {
      matchedRuleIds.add(rule.ruleId);
      indicators.push({
        id: `${rule.ruleId}-${indicators.length}`,
        ruleId: rule.ruleId,
        label: rule.label,
        group: rule.group,
        severity: rule.severity,
        weight: rule.weight,
        matchedText: ruleMatches[0],
        explanation: rule.explanation,
      });
      rawScore += rule.weight;
      addCategoryWeight(rule.category, rule.weight);
    }
  }

  // 3. Formatting anomaly check (excessive uppercase urgency or exclamation bursts)
  const words = text.split(/\s+/).filter((w) => w.length >= 4 && /[A-Z]/.test(w));
  const allCapsUrgentWords = words.filter((w) => /^[A-Z]{4,}$/.test(w.replace(/[^A-Za-z]/g, '')));
  const multiExclamation = /!{3,}/.test(text);

  if (allCapsUrgentWords.length >= 3 || (allCapsUrgentWords.length >= 2 && multiExclamation)) {
    const sample = allCapsUrgentWords.slice(0, 3).join(', ');
    indicators.push({
      id: `PAT_CAPS_SHOUTING-${indicators.length}`,
      ruleId: 'PAT_CAPS_SHOUTING',
      label: 'Aggressive capitalization or punctuation emphasis',
      group: 'Urgency & Pressure',
      severity: 'low',
      weight: 8,
      matchedText: sample,
      explanation:
        'Excessive ALL-CAPS words and multiple exclamation marks are frequently used to create artificial panic.',
    });
    rawScore += 8;
  }

  // 4. Extract and analyze embedded URLs without ever visiting them
  const rawUrls = extractUrlsFromText(text);
  const extractedUrls: ExtractedUrlFinding[] = rawUrls.map((u) => analyzeUrlStructure(u));

  for (const urlFinding of extractedUrls) {
    // Highlight the URL in text if its score is suspicious or higher
    const urlIdx = text.indexOf(urlFinding.url);
    if (urlIdx !== -1 && urlFinding.score >= 25) {
      const topReason =
        urlFinding.indicators[0]?.explanation ||
        'Embedded URL exhibits structural indicators common in phishing links.';
      spanMatches.push({
        start: urlIdx,
        end: urlIdx + urlFinding.url.length,
        severity: urlFinding.score >= 55 ? 'high' : 'medium',
        ruleLabel: `Suspicious URL (${urlFinding.score}/100)`,
        explanation: topReason,
      });
      suspiciousPhrases.add(urlFinding.url);
    }

    if (urlFinding.score >= 20) {
      const contribution = Math.round(urlFinding.score * 0.65);
      rawScore += contribution;
      addCategoryWeight('Phishing', contribution);

      indicators.push({
        id: `MSG_URL_RISK-${indicators.length}`,
        ruleId: 'MSG_URL_RISK',
        label: `Suspicious embedded link (${urlFinding.anatomy.hostname})`,
        group: 'URL Structure',
        severity: urlFinding.score >= 55 ? 'high' : 'medium',
        weight: contribution,
        matchedText: urlFinding.url,
        explanation:
          urlFinding.indicators[0]?.explanation ||
          'The message directs you to an unverified or deceptive URL.',
      });
    } else if (urlFinding.anatomy.isOfficialTrustedDomain && urlFinding.anatomy.hasTls) {
      indicators.push({
        id: `MSG_URL_OFFICIAL-${indicators.length}`,
        ruleId: 'MSG_URL_OFFICIAL',
        label: `Embedded link uses verified HTTPS domain (${urlFinding.anatomy.registrableDomain})`,
        group: 'Contextual Safety',
        severity: 'mitigating',
        weight: -8,
        matchedText: urlFinding.url,
        explanation:
          'The embedded URL points directly to a canonical HTTPS domain without lookalike characters or hidden subdomains.',
      });
      rawScore -= 8;
    }
  }

  // 5. Contextual Analysis: Multi-signal synergy vs benign single-keyword protection
  const hasUrgency =
    matchedRuleIds.has('PAT_TIME_PRESSURE') ||
    matchedRuleIds.has('PAT_ACCOUNT_SUSPENSION') ||
    matchedRuleIds.has('KW_URGENT_VERIFY') ||
    matchedRuleIds.has('PAT_CLICK_PRESSURE');
  const hasSensitiveAsk =
    matchedRuleIds.has('KW_OTP_HARVEST') ||
    matchedRuleIds.has('KW_CREDENTIAL_REQUEST') ||
    matchedRuleIds.has('KW_SUSPICIOUS_PAYMENT') ||
    matchedRuleIds.has('KW_FAKE_CHECK_SUPPLIES') ||
    matchedRuleIds.has('PAT_BYPASS_SECURITY');
  const hasSuspiciousLink = extractedUrls.some((u) => u.score >= 25);
  const hasImpersonationOrLure =
    matchedRuleIds.has('KW_BANK_IMPERSONATION') ||
    matchedRuleIds.has('KW_GOV_IMPERSONATION') ||
    matchedRuleIds.has('KW_DELIVERY_SCAM') ||
    matchedRuleIds.has('KW_LOTTERY_SCAM') ||
    matchedRuleIds.has('KW_FAKE_JOB_PAY') ||
    matchedRuleIds.has('KW_FAKE_JOB_CHANNEL') ||
    matchedRuleIds.has('KW_INVESTMENT_SCAM') ||
    matchedRuleIds.has('KW_FAKE_SUPPORT') ||
    matchedRuleIds.has('KW_REFUND_SCAM');

  const distinctAttackVectors = [
    hasUrgency,
    hasSensitiveAsk,
    hasSuspiciousLink,
    hasImpersonationOrLure,
  ].filter(Boolean).length;

  if (distinctAttackVectors >= 3) {
    const synergyWeight = 18;
    rawScore += synergyWeight;
    indicators.push({
      id: `CTX_MULTI_VECTOR-${indicators.length}`,
      ruleId: 'CTX_MULTI_VECTOR',
      label: 'Multi-vector scam pattern correlation',
      group: 'Social Engineering',
      severity: 'high',
      weight: synergyWeight,
      explanation:
        'Multiple distinct manipulation signals appear together (e.g., brand impersonation + urgency + unverified link or sensitive request), strongly elevating phishing probability.',
    });
  } else if (distinctAttackVectors === 2 && (hasSensitiveAsk || hasSuspiciousLink)) {
    const synergyWeight = 12;
    rawScore += synergyWeight;
    indicators.push({
      id: `CTX_DUAL_VECTOR-${indicators.length}`,
      ruleId: 'CTX_DUAL_VECTOR',
      label: 'Combined pressure and action signal',
      group: 'Social Engineering',
      severity: 'medium',
      weight: synergyWeight,
      explanation:
        'Combines a lure or urgency cue with either a risky link or sensitive request, warranting independent verification.',
    });
  }

  // False-positive guard: if ONLY a single co-signal-dependent rule (like bank name or delivery courier)
  // matched, with NO urgency, NO suspicious link, and NO sensitive request, dampen raw score cleanly.
  const positiveIndicators = indicators.filter((i) => i.weight > 0);
  if (
    positiveIndicators.length === 1 &&
    !hasUrgency &&
    !hasSensitiveAsk &&
    !hasSuspiciousLink &&
    (matchedRuleIds.has('KW_BANK_IMPERSONATION') || matchedRuleIds.has('KW_DELIVERY_SCAM'))
  ) {
    rawScore = Math.min(rawScore, 16);
    indicators.push({
      id: `CTX_SINGLE_BENIGN_MENTION-${indicators.length}`,
      ruleId: 'CTX_SINGLE_BENIGN_MENTION',
      label: 'Isolated keyword without coercive context',
      group: 'Contextual Safety',
      severity: 'mitigating',
      weight: 0,
      explanation:
        'Mentions a banking or delivery term in isolation without urgency, credential requests, or suspicious links.',
    });
  }

  // Sort categories by accumulated weight descending
  const categories = Array.from(categoryWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  return {
    rawScore,
    indicators,
    categories,
    suspiciousPhrases: Array.from(suspiciousPhrases),
    highlightedSpans: buildHighlightedSpans(text, spanMatches),
    extractedUrls,
  };
}
