import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Activity, 
  ShieldAlert, 
  ShieldCheck,
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Lock 
} from 'lucide-react';
import { DownloadApiResponse, ClientRateLimitStatus } from '../types';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastApiResponse: DownloadApiResponse | null;
  rateLimitStatus: ClientRateLimitStatus | null;
  onResetRateLimit: () => Promise<void>;
  onTriggerTestSpam: () => Promise<void>;
  isSpamming: boolean;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({
  isOpen,
  onClose,
  lastApiResponse,
  rateLimitStatus,
  onResetRateLimit,
  onTriggerTestSpam,
  isSpamming
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'nextjs-code' | 'security-architecture'>('telemetry');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="api-inspector-modal"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                API Handshake & Architecture Inspector
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                  POST /api/get-download
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Inspect rate limiting algorithms, Next.js App Router code, and single-use payload verification tokens.
              </p>
            </div>
          </div>
          <button
            id="btn-close-inspector"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800 bg-zinc-950/40 text-xs font-medium">
          <button
            id="tab-btn-telemetry"
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Live Request Telemetry & Rate Limiter
          </button>
          <button
            id="tab-btn-nextjs"
            type="button"
            onClick={() => setActiveTab('nextjs-code')}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'nextjs-code'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Next.js App Router Source (route.ts)
          </button>
          <button
            id="tab-btn-security"
            type="button"
            onClick={() => setActiveTab('security-architecture')}
            className={`pb-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'security-architecture'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Monetization & SEO Protection Guide
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'telemetry' && (
            <div className="space-y-5">
              {/* Rate Limit Ledger Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Sliding Window Quota</span>
                  <div className="text-lg font-mono font-bold text-white flex items-baseline gap-1">
                    <span className={rateLimitStatus?.remaining === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {rateLimitStatus?.remaining ?? 5}
                    </span>
                    <span className="text-xs text-zinc-500 font-normal">/ {rateLimitStatus?.maxRequests ?? 5} requests remaining</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1 font-mono">
                    Window: 60 seconds
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Client IP Identification</span>
                  <div className="text-sm font-mono font-semibold text-zinc-200 truncate">
                    {rateLimitStatus?.ip || '127.0.0.1 (Loopback/Proxy)'}
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1">
                    Evaluated via <code className="text-zinc-400">x-forwarded-for</code>
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Bot Defense Status</span>
                  <div className="flex items-center gap-1.5">
                    {rateLimitStatus?.isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
                        <AlertTriangle className="w-4 h-4" /> Blocked ({rateLimitStatus.retryAfterSeconds}s penalty)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Healthy / Standing High
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1">
                    Ad Account Protection active
                  </span>
                </div>
              </div>

              {/* Bot Simulation Testing Controls */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 mb-0.5">
                    Live Rate-Limit Behavior Testing
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Simulate rapid burst requests from an automated scraper to trigger HTTP 429 response handling.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-simulate-spam"
                    type="button"
                    disabled={isSpamming}
                    onClick={onTriggerTestSpam}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {isSpamming ? 'Simulating 6 Rapid Requests...' : 'Trigger 429 Burst Test'}
                  </button>
                  <button
                    id="btn-reset-rate-limit"
                    type="button"
                    onClick={onResetRateLimit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset IP Ledger
                  </button>
                </div>
              </div>

              {/* Last API Transaction Log */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Last API Transaction Payload & Headers
                </h4>
                {lastApiResponse ? (
                  <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
                      <span className="text-emerald-400 font-bold">
                        {lastApiResponse.success ? 'HTTP 200 OK' : `HTTP ${lastApiResponse.code === 'RATE_LIMIT_EXCEEDED' ? '429 TOO MANY REQUESTS' : '400 BAD REQUEST'}`}
                      </span>
                      <span className="text-zinc-500">
                        {lastApiResponse.success ? `Token: ${lastApiResponse.token}` : `Code: ${lastApiResponse.code}`}
                      </span>
                    </div>
                    <pre className="text-zinc-300 leading-relaxed overflow-x-auto">
                      {JSON.stringify(lastApiResponse, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-6 text-center rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-500 text-xs font-mono">
                    No requests dispatched in this session yet. Click "Get Script" on any card to observe live JSON payloads.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'nextjs-code' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-400 pb-1">
                <span>File: app/api/get-download/route.ts</span>
                <span className="text-emerald-400 font-sans text-xs">Next.js 14/15 App Router</span>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 text-zinc-300 overflow-x-auto max-h-96 leading-relaxed">
                <pre>{`// app/api/get-download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  
  // 1. IP Rate Limiting Guard against ad link spam
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return NextResponse.json({
      success: false,
      error: 'Too Many Requests: Download limit reached.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfterSeconds: rateCheck.retryAfterSeconds
    }, { 
      status: 429,
      headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) }
    });
  }

  // 2. Strict Payload Validation
  const { resourceId } = await req.json();
  if (!resourceId) {
    return NextResponse.json({ success: false, error: 'Missing resourceId' }, { status: 400 });
  }

  // 3. In-Memory Resource Map Lookup
  const resource = MONETIZED_DATABASE[resourceId];
  if (!resource) {
    return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 400 });
  }

  // 4. Return cryptographically generated session token
  return NextResponse.json({
    success: true,
    resourceId,
    downloadUrl: resource.destinationUrl,
    token: generateToken(resourceId),
    relDirective: 'nofollow noopener noreferrer'
  });
}`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'security-architecture' && (
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Why Server-Side Routing is Essential for Link Monetization
                </h4>
                <p className="text-zinc-400 mb-3">
                  In monetized script and template hubs, placing target shortener URLs directly inside client-side HTML <code className="text-zinc-200">&lt;a href="..."&gt;</code> elements creates serious vulnerabilities:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                  <li><strong>Search Engine Penalties:</strong> Google and Bing crawl raw HTML. Outbound low-tier monetized shorteners directly on pages degrade your root domain's SEO reputation.</li>
                  <li><strong>Scraper Harvesting:</strong> Competitors and automated bots bypass intermediate steps, reducing your CPM revenue and impression validity.</li>
                  <li><strong>Ad Network Account Bans:</strong> Sudden bursts of programmatic crawler traffic hitting monetized shorteners will trigger fraud flags on your monetization provider.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Client-Side `window.open` Protection
                </h4>
                <p className="text-zinc-400">
                  When triggering the browser window navigation, passing <code className="text-zinc-200">rel="nofollow noopener noreferrer"</code> prevents the destination site from accessing your <code className="text-zinc-200">window.opener</code> object and prevents PageRank leakage to third-party ad networks.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-zinc-800 bg-zinc-900">
          <button
            id="btn-inspector-close-bottom"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
