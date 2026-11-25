import { ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { SAFETY_PRINCIPLES, SCAM_GUIDES } from '../data/safetyGuides';
import { ScanType } from '../engine/types';

interface SafetyCenterViewProps {
  onTestExampleInScanner: (content: string, type: ScanType) => void;
}

const SAFETY_IMAGE_PATH = '/src/assets/images/safety_shield_vault_1795615278887.jpg';

export function SafetyCenterView({ onTestExampleInScanner }: SafetyCenterViewProps) {
  const [selectedGuideId, setSelectedGuideId] = useState(SCAM_GUIDES[0].id);
  const [imageFailed, setImageFailed] = useState(false);

  const activeGuide = SCAM_GUIDES.find((g) => g.id === selectedGuideId) || SCAM_GUIDES[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Intro Split */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-wide text-emerald-400">
            Educational Safety Center
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl text-balance">
            Recognize manipulation tactics before clicking or replying.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
            Most online scams rely on urgency, impersonation, and deceptive links rather than
            technical hacking. Learn the patterns attackers repeat across banking alerts, parcel
            texts, remote job offers, and crypto pitches.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SAFETY_PRINCIPLES.map((item) => (
              <div
                key={item.number}
                className="rounded-lg border border-slate-800 bg-[#0A1122] p-4"
              >
                <p className="font-mono text-xs font-semibold text-violet-400">
                  {item.number}. {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex">
          <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-[#0A1122] min-h-[260px]">
            {!imageFailed ? (
              <img
                src={SAFETY_IMAGE_PATH}
                alt="Anodized obsidian cryptographic sieve mechanism representing local defense"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0F172A] p-8">
                <ShieldCheck className="h-12 w-12 text-emerald-400" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* URL Anatomy Visual Explainer */}
      <div className="mt-12 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-slate-50">
          How to Read a Suspicious URL Safely
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Attackers often place a familiar brand name on the left side of a URL while registering
          a cheap unrelated domain on the right. Always read the registrable domain before the
          first single slash.
        </p>

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-800 bg-[#060B16] p-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-300">
              http://
            </span>
            <span className="rounded border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-violet-300">
              paypal.com.
            </span>
            <span className="rounded border border-rose-500/50 bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-300">
              verify-account-alert.xyz
            </span>
            <span className="rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
              /login?otp=1
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-semibold text-amber-300">1. Protocol (http://)</p>
              <p className="mt-1 text-slate-400">
                Missing "s" means unencrypted traffic—banks never use plain HTTP for logins.
              </p>
            </div>
            <div>
              <p className="font-semibold text-violet-300">2. Deceptive Subdomain</p>
              <p className="mt-1 text-slate-400">
                "paypal.com" here is only a subdomain prefix—any domain owner can create it.
              </p>
            </div>
            <div>
              <p className="font-semibold text-rose-300">3. True Registrable Domain</p>
              <p className="mt-1 text-slate-400">
                This is who actually owns the server: "verify-account-alert.xyz", not PayPal.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-300">4. Action Path</p>
              <p className="mt-1 text-slate-400">
                Bait paths like "/login" or "/otp" signal credential harvesting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 8 Scam Category Guide */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-bold text-slate-50">
          Common Scam Playbooks
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Select a scam category to inspect how it works, warning signs, and real-world prevention
          steps.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Category Selector List */}
          <div className="lg:col-span-4 space-y-2">
            {SCAM_GUIDES.map((guide) => {
              const isSelected = guide.id === activeGuide.id;
              return (
                <button
                  key={guide.id}
                  type="button"
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    isSelected
                      ? 'border-emerald-500/60 bg-emerald-500/10 text-slate-50'
                      : 'border-slate-800 bg-[#0A1122] text-slate-300 hover:border-slate-700 hover:text-slate-100'
                  }`}
                >
                  <p className="text-sm font-semibold">{guide.category}</p>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{guide.title}</p>
                </button>
              );
            })}
          </div>

          {/* Active Guide Detail */}
          <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0F172A]/90 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400">{activeGuide.category}</p>
              <h3 className="mt-1 font-display text-2xl font-bold text-slate-50">
                {activeGuide.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{activeGuide.summary}</p>

              <div className="mt-6 border-t border-slate-800 pt-5">
                <h4 className="text-sm font-semibold text-slate-100">How Attackers Operate</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                  {activeGuide.howItWorks}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold text-rose-300">Common Red Flags</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                    {activeGuide.redFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">How to Stay Safe</h4>
                  <ul className="mt-2 space-y-2 text-sm text-slate-300">
                    {activeGuide.prevention.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2
                          className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-slate-800 bg-[#060B16] p-4">
                <p className="text-xs font-medium text-slate-400">Example Scam Message</p>
                <p className="mt-1.5 font-mono text-xs leading-relaxed text-slate-200">
                  {activeGuide.exampleSnippet}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
              <span className="text-xs text-slate-400">
                Inspect how SIFT scores this example locally
              </span>
              <button
                type="button"
                onClick={() =>
                  onTestExampleInScanner(
                    activeGuide.exampleSnippet.replace(/^"|"$/g, ''),
                    activeGuide.category === 'Phishing' ? 'url' : 'message'
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
              >
                <span>Test Example in Scanner</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Architecture Section */}
      <div className="mt-12 rounded-xl border border-slate-800 bg-[#0A1122] p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-bold text-slate-50">
              Privacy-First Local Architecture
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Suspicious messages often contain your name, partial card numbers, tracking IDs, or
              personal context. SIFT executes every keyword, pattern, contextual, and URL structure
              rule strictly inside your browser’s JavaScript runtime. No external AI APIs, no
              cloud inference servers, no analytics trackers, and no outbound network fetches to
              submitted URLs are ever performed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
