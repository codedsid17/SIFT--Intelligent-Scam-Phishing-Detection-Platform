import { ArrowRight, BookOpen, Lock, ScanSearch, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { AppView } from './TopNav';

interface LandingViewProps {
  onNavigate: (view: AppView) => void;
  totalScansCount: number;
}

const HERO_IMAGE_PATH = '/src/assets/images/hero_sift_prism_1795615278608.jpg';

export function LandingView({ onNavigate, totalScansCount }: LandingViewProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="bg-sift-grid">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium tracking-wide text-emerald-400">
              Think twice. Click once.
            </p>
            <h1
              className="mt-4 font-display font-bold tracking-tight text-slate-50 text-balance"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.6rem)', lineHeight: 1.1 }}
            >
              Inspect suspicious messages and links before you act.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              SIFT evaluates SMS alerts, emails, chat messages, and URLs directly inside your
              browser using transparent cybersecurity rules. Zero external AI models, zero API
              keys, and zero message data ever leaving your device.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('scanner')}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 whitespace-nowrap shrink-0"
              >
                <span>Start Scanning</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('safety')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 whitespace-nowrap shrink-0"
              >
                <BookOpen className="h-4 w-4 text-violet-400" aria-hidden="true" />
                <span>Safety Center</span>
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
              <span>100% browser-local inspection</span>
              <span aria-hidden="true">·</span>
              <span>Never opens submitted URLs</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {totalScansCount > 0
                  ? `${totalScansCount} local scan${totalScansCount === 1 ? '' : 's'} saved`
                  : 'Offline-ready heuristic engine'}
              </span>
            </div>
          </div>

          {/* Right Hero Focal Visual */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0A1122] min-h-[280px] lg:min-h-[420px]">
              {!imageFailed ? (
                <>
                  <img
                    src={HERO_IMAGE_PATH}
                    alt="Precision layered obsidian prism filtering suspicious message patterns and URL structures"
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060B16]/85 via-transparent to-transparent"
                  />
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#0A1122] via-[#0F172A] to-[#131C35] p-8 text-center">
                  <ShieldCheck className="h-14 w-14 text-emerald-400" aria-hidden="true" />
                  <p className="mt-4 font-display text-lg font-semibold text-slate-100">
                    Deterministic Local Threat Sieve
                  </p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-700/60 pt-4 text-xs text-slate-300">
                  <div>
                    <p className="font-semibold text-slate-100">Explainable Heuristic Scoring</p>
                    <p className="text-slate-400">
                      Every score breaks down exact phrases, URL parts, and mitigating context.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0"
                  >
                    Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column Architectural Proof Strip */}
        <div className="mt-12 grid grid-cols-2 gap-6 border-y border-slate-800/80 py-6 lg:grid-cols-4">
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-50">0–100</p>
            <p className="mt-1 text-sm text-slate-400">Weighted heuristic risk index</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-emerald-400">8</p>
            <p className="mt-1 text-sm text-slate-400">Targeted scam classifications</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-violet-400">15+</p>
            <p className="mt-1 text-sm text-slate-400">URL structural & lookalike checks</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-50">0 bytes</p>
            <p className="mt-1 text-sm text-slate-400">Sent to external servers or LLMs</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-slate-800/80 bg-[#0A1122]/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl text-balance">
              How SIFT inspects a message without guessing
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Instead of opaque black-box guesses, SIFT evaluates concrete linguistic, structural,
              and contextual signals and shows you the exact reasoning behind every point.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="border-t border-slate-700/80 pt-6">
              <p className="font-mono text-xs font-semibold text-emerald-400">01. Lexical & Pattern Inspection</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-100">
                Keywords & Pressure Tactics
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Scans text for urgency deadlines, suspension threats, OTP harvesting, gift card or
                crypto demands, and brand impersonation across 18 rule families.
              </p>
            </div>

            <div className="border-t border-slate-700/80 pt-6">
              <p className="font-mono text-xs font-semibold text-violet-400">02. Passive URL Dissection</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-100">
                Structural Link Analysis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Extracts and parses URLs locally without ever making a network request. Flags raw
                IP hosts, punycode, shorteners, brand-in-subdomain tricks, and lookalike domains.
              </p>
            </div>

            <div className="border-t border-slate-700/80 pt-6">
              <p className="font-mono text-xs font-semibold text-emerald-400">03. Contextual Mitigation</p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-100">
                False-Positive Guardrails
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Recognizes legitimate anti-sharing security notices ("never share this OTP") and
                benign mentions of banks or payments so everyday messages stay Low Risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Asymmetric Bento Grid */}
      <section className="border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                Built for everyday vigilance
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Practical tools to check texts, emails, and links in seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="text-sm font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap shrink-0"
            >
              Launch Scanner
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-[#0F172A]/80 p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <ScanSearch className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-wide">Message & URL Inspection</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-slate-50">
                  Interactive Phrase Highlighting & Domain Anatomy
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                  Paste any SMS, WhatsApp message, or email. SIFT highlights the exact phrases that
                  triggered risk rules and isolates embedded URLs into protocol, subdomain,
                  registrable domain, and path segments so deception is immediately visible.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-800 pt-5 text-xs text-slate-400">
                <span>Banking Fraud</span>
                <span aria-hidden="true">·</span>
                <span>OTP Phishing</span>
                <span aria-hidden="true">·</span>
                <span>Delivery Smishing</span>
                <span aria-hidden="true">·</span>
                <span>Fake Jobs</span>
                <span aria-hidden="true">·</span>
                <span>Crypto Scams</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0F172A]/80 p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-violet-400">
                  <Lock className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-wide">Privacy Architecture</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-slate-50">
                  Local-Only Execution
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Sensitive bank alerts and personal messages stay strictly in your browser memory
                  and local storage. Delete individual scan records or clear all history anytime.
                </p>
              </div>
              <div className="mt-6 border-t border-slate-800 pt-5">
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  Manage Local History
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
