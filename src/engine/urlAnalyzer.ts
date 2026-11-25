import {
  DetectedIndicator,
  ExtractedUrlFinding,
  RiskLevel,
  UrlAnatomy,
} from './types';

const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'rb.gy',
  'is.gd',
  'cutt.ly',
  'ow.ly',
  'shorturl.at',
  'rebrand.ly',
  'buff.ly',
  'tiny.cc',
  'bl.ink',
  'clck.ru',
  'soo.gd',
  's.id',
  'v.gd',
  'short.io',
  'lnkd.in',
]);

const HIGH_RISK_TLDS = new Set([
  'xyz',
  'top',
  'click',
  'loan',
  'win',
  'bid',
  'vip',
  'icu',
  'gq',
  'tk',
  'ml',
  'cf',
  'ga',
  'work',
  'support',
  'buzz',
  'surf',
  'club',
  'rest',
  'monster',
  'cam',
  'cfd',
  'sbs',
  'cyou',
]);

const CAUTION_TLDS = new Set(['info', 'online', 'site', 'live', 'store', 'shop', 'cc', 'pw']);

const OFFICIAL_CANONICAL_DOMAINS = new Set([
  'paypal.com',
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'citibank.com',
  'citi.com',
  'capitalone.com',
  'hsbc.com',
  'barclays.co.uk',
  'apple.com',
  'icloud.com',
  'microsoft.com',
  'live.com',
  'office.com',
  'amazon.com',
  'amazon.co.uk',
  'google.com',
  'accounts.google.com',
  'github.com',
  'irs.gov',
  'ssa.gov',
  'gov.uk',
  'usps.com',
  'fedex.com',
  'ups.com',
  'dhl.com',
  'netflix.com',
  'coinbase.com',
  'binance.com',
  'kraken.com',
  'linkedin.com',
  'stripe.com',
  'wikipedia.org',
]);

const BRAND_TARGETS = [
  'paypal',
  'chase',
  'bankofamerica',
  'wellsfargo',
  'citibank',
  'capitalone',
  'hsbc',
  'barclays',
  'apple',
  'icloud',
  'microsoft',
  'amazon',
  'google',
  'netflix',
  'usps',
  'fedex',
  'ups',
  'dhl',
  'coinbase',
  'binance',
  'whatsapp',
  'telegram',
  'instagram',
  'irs',
  'hmrc',
  'stripe',
];

const LOOKALIKE_BRAND_PATTERNS: Array<{ brand: string; regex: RegExp }> = [
  { brand: 'PayPal', regex: /p[a@]yp[a@1l]l|paypa1|paypai|peypal|pay-pal/i },
  { brand: 'Amazon', regex: /am[a@]z[o0]n|arnazon|amaz0n|amazone/i },
  { brand: 'Microsoft', regex: /micr[o0]s[o0]ft|rnicrosoft|mircosoft/i },
  { brand: 'Apple', regex: /app[1l]e|aple-?id|appl3/i },
  { brand: 'Google', regex: /g[o0]{2}g[1l]e|goog1e|g00gle/i },
  { brand: 'Chase', regex: /ch[a@]se-?(?:bank|verify|alert|secure|login)|chas3/i },
  { brand: 'Wells Fargo', regex: /we[1l]{2}sfarg[o0]|wells-farg[o0]/i },
  { brand: 'Bank of America', regex: /bank[o0]famer[1i]ca|bofa-?(?:secure|verify)/i },
  { brand: 'Netflix', regex: /netf[1l]ix|netfiix/i },
  { brand: 'Coinbase', regex: /c[o0]inb[a@]se|coinbaze/i },
  { brand: 'USPS', regex: /usps-?(?:track|redeliver|parcel|post|fee)/i },
  { brand: 'FedEx', regex: /fedex-?(?:track|parcel|delivery|customs|fee)/i },
  { brand: 'DHL', regex: /dhl-?(?:express|parcel|customs|delivery|track)/i },
];

const SUSPICIOUS_PATH_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'verification',
  'secure',
  'security-check',
  'update-billing',
  'confirm',
  'unlock',
  'suspend',
  'suspended',
  'otp',
  'passcode',
  'kyc',
  'wallet-connect',
  'claim-prize',
  'refund',
  'redelivery',
  'customs-fee',
  'account-alert',
];

const MULTI_PART_TLDS = new Set(['co.uk', 'org.uk', 'gov.uk', 'ac.uk', 'com.au', 'co.in', 'co.jp']);

function normalizeHomoglyphs(input: string): string {
  return input
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

function getRegistrableDomain(hostname: string): {
  subdomains: string[];
  registrableDomain: string;
  tld: string;
} {
  const cleanHost = hostname.toLowerCase().replace(/\.$/, '');
  const parts = cleanHost.split('.').filter(Boolean);
  if (parts.length <= 1) {
    return { subdomains: [], registrableDomain: cleanHost, tld: '' };
  }

  const lastTwo = parts.slice(-2).join('.');
  if (parts.length >= 3 && MULTI_PART_TLDS.has(lastTwo)) {
    const registrableDomain = parts.slice(-3).join('.');
    const subdomains = parts.slice(0, -3);
    return { subdomains, registrableDomain, tld: lastTwo };
  }

  const registrableDomain = parts.slice(-2).join('.');
  const subdomains = parts.slice(0, -2);
  const tld = parts[parts.length - 1];
  return { subdomains, registrableDomain, tld };
}

function isIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  return match.slice(1).every((octet) => Number(octet) >= 0 && Number(octet) <= 255);
}

function isDecimalOrHexIp(hostname: string): boolean {
  return /^(?:0x[0-9a-f]+|\d{8,11})$/i.test(hostname) || /^\[.*:.*\]$/.test(hostname);
}

export function extractUrlsFromText(text: string): string[] {
  const found = new Set<string>();
  const urlRegex =
    /(?:https?:\/\/|www\.)[^\s<>"')\]}]+|(?:\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|net|org|info|biz|xyz|top|click|online|site|icu|vip|tk|ml|ga|cf|gq|ly|co|io|me|us|uk|ru|work|support|club|live|store)(?:\/[^\s<>"')\]}]+)?)/gi;

  const matches = text.match(urlRegex) || [];
  for (let raw of matches) {
    raw = raw.replace(/[.,;:!?)]+$/, '');
    if (raw.length >= 4 && !raw.includes('@')) {
      found.add(raw);
    } else if (raw.includes('@') && /^https?:\/\//i.test(raw)) {
      found.add(raw);
    }
  }
  return Array.from(found);
}

export function parseUrlSafely(rawInput: string): UrlAnatomy {
  const trimmed = rawInput.trim();
  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed);
  const candidate = hasExplicitScheme ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    const protocol = hasExplicitScheme ? parsed.protocol.replace(':', '').toLowerCase() : 'unspecified';
    const hostname = parsed.hostname.toLowerCase();
    const isIp = isIpv4(hostname) || isDecimalOrHexIp(hostname);
    const domainParts = isIp
      ? { subdomains: [], registrableDomain: hostname, tld: '' }
      : getRegistrableDomain(hostname);

    const isShortener = URL_SHORTENERS.has(domainParts.registrableDomain) || URL_SHORTENERS.has(hostname);
    const isOfficialTrustedDomain =
      !isIp &&
      !parsed.username &&
      OFFICIAL_CANONICAL_DOMAINS.has(domainParts.registrableDomain);

    return {
      raw: trimmed,
      protocol,
      hasTls: protocol === 'https',
      usernameInfo: parsed.username ? decodeURIComponent(parsed.username) : undefined,
      hostname,
      subdomains: domainParts.subdomains,
      registrableDomain: domainParts.registrableDomain,
      tld: domainParts.tld,
      port: parsed.port || undefined,
      pathAndQuery: `${parsed.pathname}${parsed.search}${parsed.hash}`,
      isIpAddress: isIp,
      isShortener,
      isOfficialTrustedDomain,
    };
  } catch {
    const fallbackHost = trimmed.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    const domainParts = getRegistrableDomain(fallbackHost);
    return {
      raw: trimmed,
      protocol: trimmed.toLowerCase().startsWith('http://') ? 'http' : 'unspecified',
      hasTls: trimmed.toLowerCase().startsWith('https://'),
      hostname: fallbackHost,
      subdomains: domainParts.subdomains,
      registrableDomain: domainParts.registrableDomain,
      tld: domainParts.tld,
      pathAndQuery: '/',
      isIpAddress: isIpv4(fallbackHost) || isDecimalOrHexIp(fallbackHost),
      isShortener: URL_SHORTENERS.has(domainParts.registrableDomain),
      isOfficialTrustedDomain: false,
    };
  }
}

export function classifyRiskLevel(score: number): RiskLevel {
  if (score >= 60) return 'High Risk';
  if (score >= 30) return 'Suspicious';
  return 'Low Risk';
}

export function analyzeUrlStructure(rawUrl: string): ExtractedUrlFinding {
  const anatomy = parseUrlSafely(rawUrl);
  const indicators: DetectedIndicator[] = [];
  let rawScore = 0;

  const pushIndicator = (indicator: Omit<DetectedIndicator, 'id'>) => {
    indicators.push({
      ...indicator,
      id: `${indicator.ruleId}-${indicators.length}`,
    });
    rawScore += indicator.weight;
  };

  // 1. IP-address-based URL
  if (anatomy.isIpAddress) {
    pushIndicator({
      ruleId: 'URL_IP_ADDRESS',
      label: 'Raw IP address instead of domain name',
      group: 'URL Structure',
      severity: 'high',
      weight: 40,
      matchedText: anatomy.hostname,
      explanation:
        'Legitimate consumer services and banks rarely ask users to log in via a raw numeric or hex IP address. Attackers use IP URLs to evade domain-reputation filters.',
    });
  }

  // 2. Userinfo / '@' trick
  if (anatomy.usernameInfo || anatomy.raw.includes('@')) {
    pushIndicator({
      ruleId: 'URL_AT_OBFUSCATION',
      label: 'Embedded "@" credential-masking syntax',
      group: 'URL Structure',
      severity: 'high',
      weight: 42,
      matchedText: anatomy.usernameInfo ? `${anatomy.usernameInfo}@${anatomy.hostname}` : '@',
      explanation:
        'Everything before an "@" in a URL is treated as a username, while the browser actually connects to the domain after the "@". This is a classic phishing deception technique.',
    });
  }

  // 3. Unencrypted HTTP
  if (anatomy.protocol === 'http') {
    const hasSensitivePath = SUSPICIOUS_PATH_KEYWORDS.some((kw) =>
      anatomy.pathAndQuery.toLowerCase().includes(kw)
    );
    pushIndicator({
      ruleId: 'URL_INSECURE_HTTP',
      label: 'Unencrypted HTTP connection (no TLS/HTTPS)',
      group: 'URL Structure',
      severity: hasSensitivePath ? 'high' : 'medium',
      weight: hasSensitivePath ? 28 : 18,
      matchedText: 'http://',
      explanation:
        'Traffic over plain HTTP is unencrypted and easily intercepted. Sensitive portals and legitimate financial institutions enforce HTTPS.',
    });
  }

  // 4. URL Shorteners
  if (anatomy.isShortener) {
    pushIndicator({
      ruleId: 'URL_SHORTENER',
      label: 'Obfuscated URL shortener',
      group: 'URL Structure',
      severity: 'medium',
      weight: 26,
      matchedText: anatomy.registrableDomain,
      explanation:
        'URL shorteners mask the final destination domain, preventing you from verifying whether the link leads to an official website before clicking.',
    });
  }

  // 5. Punycode / IDN Homograph attack
  if (anatomy.hostname.includes('xn--')) {
    pushIndicator({
      ruleId: 'URL_PUNYCODE',
      label: 'Internationalized Punycode (xn--) domain',
      group: 'URL Structure',
      severity: 'high',
      weight: 38,
      matchedText: anatomy.hostname,
      explanation:
        'Punycode domains ("xn--") can render visually identical lookalike characters from non-Latin alphabets (homograph attack) to impersonate trusted brands.',
    });
  }

  // 6. Brand name placed in subdomain while actual domain is unrelated
  const subdomainJoined = anatomy.subdomains.join('.');
  if (subdomainJoined && !anatomy.isOfficialTrustedDomain) {
    const matchedBrandInSub = BRAND_TARGETS.find((brand) =>
      normalizeHomoglyphs(subdomainJoined).includes(brand)
    );
    if (matchedBrandInSub) {
      pushIndicator({
        ruleId: 'URL_BRAND_SUBDOMAIN',
        label: 'Trusted brand hidden inside subdomain',
        group: 'Phishing',
        severity: 'high',
        weight: 42,
        matchedText: `${subdomainJoined}.${anatomy.registrableDomain}`,
        explanation: `The brand "${matchedBrandInSub}" appears in the subdomain, but the actual controlling domain is "${anatomy.registrableDomain}". Attackers do this to make fake URLs look official at a glance.`,
      });
    }
  }

  // 7. Typosquatting / lookalike domain check
  if (!anatomy.isOfficialTrustedDomain) {
    const registrableRoot = anatomy.registrableDomain.split('.')[0] || '';
    const lookalikeMatch = LOOKALIKE_BRAND_PATTERNS.find(
      ({ regex }) => regex.test(anatomy.registrableDomain) || regex.test(registrableRoot)
    );
    if (lookalikeMatch) {
      pushIndicator({
        ruleId: 'URL_LOOKALIKE_DOMAIN',
        label: `Potential ${lookalikeMatch.brand} lookalike or impersonation domain`,
        group: 'Phishing',
        severity: 'high',
        weight: 38,
        matchedText: anatomy.registrableDomain,
        explanation: `The domain "${anatomy.registrableDomain}" closely resembles or incorporates "${lookalikeMatch.brand}" using character substitutions or deceptive suffixes.`,
      });
    } else {
      // Check if an official brand is embedded inside a non-official domain like "paypal-secure-center.com"
      const embeddedBrand = BRAND_TARGETS.find(
        (brand) => brand.length >= 4 && anatomy.registrableDomain.includes(brand)
      );
      if (embeddedBrand) {
        pushIndicator({
          ruleId: 'URL_MISLEADING_BRAND_DOMAIN',
          label: `Unofficial domain referencing "${embeddedBrand}"`,
          group: 'Impersonation',
          severity: 'high',
          weight: 32,
          matchedText: anatomy.registrableDomain,
          explanation: `This domain includes the name "${embeddedBrand}" alongside extra words or a different domain root, which is a common impersonation pattern.`,
        });
      }
    }
  }

  // 8. Excessive subdomains
  if (anatomy.subdomains.length >= 3) {
    pushIndicator({
      ruleId: 'URL_DEEP_SUBDOMAINS',
      label: `Unusually deep subdomain structure (${anatomy.subdomains.length} levels)`,
      group: 'URL Structure',
      severity: 'medium',
      weight: 20,
      matchedText: anatomy.subdomains.join('.'),
      explanation:
        'Phishing pages frequently chain multiple subdomains to push the true registrable domain off-screen on mobile browsers.',
    });
  }

  // 9. High-risk or abused TLD
  if (HIGH_RISK_TLDS.has(anatomy.tld)) {
    pushIndicator({
      ruleId: 'URL_HIGH_RISK_TLD',
      label: `High-abuse top-level domain (.${anatomy.tld})`,
      group: 'URL Structure',
      severity: 'medium',
      weight: 22,
      matchedText: `.${anatomy.tld}`,
      explanation: `Low-cost or lightly policed TLDs like ".${anatomy.tld}" are disproportionately used for short-lived phishing and scam campaigns.`,
    });
  } else if (CAUTION_TLDS.has(anatomy.tld) && !anatomy.isOfficialTrustedDomain) {
    pushIndicator({
      ruleId: 'URL_CAUTION_TLD',
      label: `Uncommon commercial TLD (.${anatomy.tld})`,
      group: 'URL Structure',
      severity: 'low',
      weight: 10,
      matchedText: `.${anatomy.tld}`,
      explanation: `Domains ending in ".${anatomy.tld}" require extra verification when used for banking, parcel tracking, or account logins.`,
    });
  }

  // 10. Excessive hyphens in domain
  const hyphenCount = (anatomy.hostname.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    pushIndicator({
      ruleId: 'URL_EXCESSIVE_HYPHENS',
      label: `Multiple hyphens in hostname (${hyphenCount} hyphens)`,
      group: 'URL Structure',
      severity: 'medium',
      weight: 16,
      matchedText: anatomy.hostname,
      explanation:
        'Legitimate organizations rarely register multi-hyphenated domains like "secure-verify-account-alert".',
    });
  }

  // 11. Non-standard port
  if (anatomy.port && anatomy.port !== '80' && anatomy.port !== '443') {
    pushIndicator({
      ruleId: 'URL_NON_STANDARD_PORT',
      label: `Non-standard network port (:${anatomy.port})`,
      group: 'URL Structure',
      severity: 'medium',
      weight: 20,
      matchedText: `:${anatomy.port}`,
      explanation:
        'Public-facing customer services run on standard ports (443/80). Unusual ports often point to compromised servers or temporary attacker infrastructure.',
    });
  }

  // 12. Percent-encoding obfuscation in URL
  const encodedCount = (anatomy.raw.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (encodedCount >= 4) {
    pushIndicator({
      ruleId: 'URL_PERCENT_OBFUSCATION',
      label: 'Heavy percent-encoding obfuscation',
      group: 'URL Structure',
      severity: 'medium',
      weight: 15,
      matchedText: `${encodedCount} encoded sequences`,
      explanation:
        'Excessive "%XX" encoding can conceal suspicious keywords, redirects, or destination paths from manual inspection.',
    });
  }

  // 13. Suspicious credential/payment path keywords on non-official domain
  if (!anatomy.isOfficialTrustedDomain) {
    const matchedPathWords = SUSPICIOUS_PATH_KEYWORDS.filter((kw) =>
      anatomy.pathAndQuery.toLowerCase().includes(kw)
    );
    if (matchedPathWords.length > 0) {
      pushIndicator({
        ruleId: 'URL_SUSPICIOUS_PATH',
        label: 'Sensitive action keywords in URL path/query',
        group: 'Credential Harvesting',
        severity: 'medium',
        weight: Math.min(24, 12 + matchedPathWords.length * 4),
        matchedText: matchedPathWords.slice(0, 3).join(', '),
        explanation:
          'The URL path contains sensitive terms (such as login, verify, OTP, or billing update) on an unverified domain.',
      });
    }
  }

  // 14. Excessively long URL with random token entropy
  if (anatomy.raw.length > 120) {
    pushIndicator({
      ruleId: 'URL_EXCESSIVE_LENGTH',
      label: `Unusually long URL (${anatomy.raw.length} characters)`,
      group: 'URL Structure',
      severity: 'low',
      weight: 10,
      matchedText: `${anatomy.raw.length} chars`,
      explanation:
        'Very long URLs are sometimes used to hide redirects or tracking payloads past the visible portion of the address bar.',
    });
  }

  // 15. Contextual safety check for canonical HTTPS official domains
  if (anatomy.isOfficialTrustedDomain && anatomy.hasTls && indicators.length === 0) {
    pushIndicator({
      ruleId: 'URL_TRUSTED_HTTPS',
      label: 'Matches verified canonical HTTPS domain structure',
      group: 'Contextual Safety',
      severity: 'mitigating',
      weight: -10,
      matchedText: anatomy.registrableDomain,
      explanation: `Uses encrypted HTTPS and resolves directly to the canonical domain "${anatomy.registrableDomain}" without deceptive subdomains or obfuscation.`,
    });
  } else if (anatomy.isOfficialTrustedDomain && !anatomy.hasTls) {
    // Even on official domain, plain HTTP is a minor warning unless upgraded
    rawScore = Math.min(rawScore, 22);
  }

  const finalScore = Math.max(0, Math.min(100, rawScore));

  return {
    url: anatomy.raw,
    score: finalScore,
    riskLevel: classifyRiskLevel(finalScore),
    anatomy,
    indicators,
  };
}
