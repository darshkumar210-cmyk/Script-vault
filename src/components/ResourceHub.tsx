import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Code2, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  Layers
} from 'lucide-react';
import { ResourceItem, ResourceCategory, DownloadApiResponse, ClientRateLimitStatus } from '../types';
import { RESOURCES_DATABASE } from '../data/resources';
import { ResourceCard } from './ResourceCard';
import { CodePreviewModal } from './CodePreviewModal';
import { ApiInspectorModal } from './ApiInspectorModal';

const CATEGORIES: Array<ResourceCategory | 'All Resources'> = [
  'All Resources',
  'Automation Scripts',
  'AI & System Prompts',
  'DevOps & Cloud',
  'Full-Stack Boilerplates',
  'SEO & Growth Tools'
];

export const ResourceHub: React.FC = () => {
  // -------------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------------
  
  // 1. Search query & Category filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'All Resources'>('All Resources');
  
  // 2. Active loading state tracked per resource ID (so clicking one card doesn't disable all cards)
  const [processingResourceId, setProcessingResourceId] = useState<string | null>(null);
  
  // 3. Modal dialog state for viewing full script source code
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  
  // 4. API Inspector / Debugger drawer state for developers to verify backend handshake
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [lastApiResponse, setLastApiResponse] = useState<DownloadApiResponse | null>(null);
  
  // 5. Rate limit tracking state queried from server telemetry
  const [rateLimitStatus, setRateLimitStatus] = useState<ClientRateLimitStatus | null>(null);
  const [isSpamTesting, setIsSpamTesting] = useState<boolean>(false);
  
  // 6. User feedback notification banners (success/error alerts)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  /**
   * Fetches current client rate limit status from server
   */
  const fetchRateLimitStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/rate-limit-status');
      if (res.ok) {
        const data: ClientRateLimitStatus = await res.json();
        setRateLimitStatus(data);
      }
    } catch {
      // Telemetry error - keep UI resilient
    }
  }, []);

  useEffect(() => {
    fetchRateLimitStatus();
  }, [fetchRateLimitStatus]);

  // Auto-dismiss transient notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // -------------------------------------------------------------
  // SECURE ASYNCHRONOUS DOWNLOAD HANDLER
  // -------------------------------------------------------------
  /**
   * Securely requests the monetized shortener payload via POST /api/get-download.
   * This ensures target URLs are never exposed in the client HTML or DOM bundle.
   * 
   * @param resourceId - Unique string identifier of the script/template
   */
  const handleDownloadResource = async (resourceId: string): Promise<void> => {
    // 1. Guard against concurrent triggers
    if (processingResourceId) return;

    // 2. Set active loading state to render "Processing Link..." UI
    setProcessingResourceId(resourceId);
    setNotification(null);

    try {
      // 3. Dispatch POST request to our custom API route with strictly typed JSON body
      const response = await fetch('/api/get-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          resourceId,
          clientSessionToken: `client_req_${Date.now()}`
        })
      });

      const data = (await response.json()) as DownloadApiResponse;
      setLastApiResponse(data);

      // 4. Update IP rate limit telemetry
      await fetchRateLimitStatus();

      // 5. Handle HTTP 429 Rate Limit Exceeded or error responses
      if (data.success === false) {
        setNotification({
          type: 'error',
          message: data.error || 'Rate limit exceeded or invalid request. Please wait.'
        });
        return;
      }

      // 6. Handle Successful 200 OK Handshake
      if (data.downloadUrl) {
        setNotification({
          type: 'success',
          message: `Link verified! Redirecting to secure gateway for "${data.resourceTitle}"...`
        });

        // 7. Small intentional delay to ensure the user perceives the verified state transition
        await new Promise((resolve) => setTimeout(resolve, 600));

        /**
         * SECURE REDIRECTION TRIGGER:
         * Programmatically trigger redirect using window.open with strict
         * rel="nofollow noopener noreferrer" parameters to safeguard root domain SEO standing
         * and prevent reverse tabnabbing vulnerabilities.
         */
        const newWindow = window.open(
          data.downloadUrl,
          '_blank',
          'noopener,noreferrer'
        );

        if (newWindow) {
          // Explicitly reinforce noopener safety
          newWindow.opener = null;
        } else {
          // Fallback in case aggressive popup blockers intercept window.open
          const secureAnchor = document.createElement('a');
          secureAnchor.href = data.downloadUrl;
          secureAnchor.target = '_blank';
          secureAnchor.rel = 'nofollow noopener noreferrer';
          document.body.appendChild(secureAnchor);
          secureAnchor.click();
          document.body.removeChild(secureAnchor);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network failure';
      setNotification({
        type: 'error',
        message: `Failed to resolve link: ${message}. Check your connection.`
      });
    } finally {
      // 8. Revert loading state
      setProcessingResourceId(null);
    }
  };

  /**
   * Triggers test spam bursts to demonstrate 429 rate limiting behavior
   */
  const handleTriggerTestSpam = async (): Promise<void> => {
    setIsSpamTesting(true);
    setNotification({
      type: 'info',
      message: 'Simulating 6 rapid automated bot requests to test IP rate limiter...'
    });

    try {
      for (let i = 0; i < 6; i++) {
        const res = await fetch('/api/get-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceId: 'py-playwright-scraper' })
        });
        const data = await res.json();
        setLastApiResponse(data);
      }
      await fetchRateLimitStatus();
      setNotification({
        type: 'warning',
        message: 'Bot burst test complete! Rate limiter successfully engaged (HTTP 429 triggered).'
      });
    } catch {
      // Ignore
    } finally {
      setIsSpamTesting(false);
    }
  };

  /**
   * Resets rate limit ledger for testing
   */
  const handleResetRateLimit = async (): Promise<void> => {
    try {
      await fetch('/api/rate-limit-reset', { method: 'POST' });
      await fetchRateLimitStatus();
      setNotification({
        type: 'success',
        message: 'Client IP rate limit ledger successfully cleared.'
      });
    } catch {
      // Ignore
    }
  };

  // -------------------------------------------------------------
  // FILTERED RESOURCES MEMOIZATION
  // -------------------------------------------------------------
  const filteredResources = useMemo(() => {
    return RESOURCES_DATABASE.filter((resource) => {
      const matchesCategory =
        selectedCategory === 'All Resources' || resource.category === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-zinc-950 pb-20">
      {/* ---------------- Top Sticky Navigation ---------------- */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  DevMonetize Engine
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v2.5 PROD
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Secure Link Monetization Hub & Automated Rate-Limited Gateway
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Real-time IP Rate Limit Badge */}
            <div 
              onClick={() => setIsInspectorOpen(true)}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition-colors"
              title="Click to view IP rate-limit telemetry"
            >
              <div className={`w-2 h-2 rounded-full ${rateLimitStatus?.isBlocked ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="font-mono text-xs">
                Quota: {rateLimitStatus?.remaining ?? 5}/{rateLimitStatus?.maxRequests ?? 5}
              </span>
            </div>

            <button
              id="btn-open-inspector-nav"
              type="button"
              onClick={() => setIsInspectorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Inspector</span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Notification Toast Banner ---------------- */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            id="notification-banner"
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium shadow-lg ${
              notification.type === 'error'
                ? 'bg-rose-950/80 border-rose-800 text-rose-200'
                : notification.type === 'warning'
                ? 'bg-amber-950/80 border-amber-800 text-amber-200'
                : notification.type === 'info'
                ? 'bg-cyan-950/80 border-cyan-800 text-cyan-200'
                : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'error' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : notification.type === 'warning' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              id="btn-dismiss-toast"
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 uppercase tracking-wider font-mono"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Main Container ---------------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Hero Banner with Architecture Overview */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Production Monetization Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Curated Developer Scripts & Production Templates
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Explore high-performance automation scripts, zero-trust DevOps compose manifests, and enterprise prompt templates. 
              Protected by server-side rate-limiting and SEO-compliant redirection handshakes.
            </p>

            {/* Architecture Pill Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                <Lock className="w-3 h-3 text-emerald-400" /> Hidden Server-Side Shorteners
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                <ShieldAlert className="w-3 h-3 text-cyan-400" /> 5 Req/Min IP Rate Limiter
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                <Code2 className="w-3 h-3 text-amber-400" /> Next.js App Router POST
              </span>
            </div>
          </div>
        </section>

        {/* ---------------- Search & Filter Toolbar ---------------- */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Search Input Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="input-search-resources"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scripts, prompts, docker manifests..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 self-end sm:self-center">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                {filteredResources.length} of {RESOURCES_DATABASE.length} Resources
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                114.1K Total Downloads
              </span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                id={`filter-category-${category.replace(/\s+/g, '-').toLowerCase()}`}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-zinc-950 font-semibold border-emerald-400 shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* ---------------- Resource Cards Grid ---------------- */}
        <section>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isProcessing={processingResourceId === resource.id}
                  onDownload={handleDownloadResource}
                  onPreview={(item) => {
                    setPreviewResource(item);
                    setIsPreviewOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <Info className="w-8 h-8 text-zinc-500 mx-auto" />
              <h3 className="text-base font-semibold text-zinc-300">
                No matching resources found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try adjusting your search criteria or clear the active category filter to view all available scripts.
              </p>
              <button
                id="btn-reset-filters"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Resources');
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* ---------------- Live Rate Limit Meter & SEO Footer Info ---------------- */}
        <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Bot Protection & Link Ad Account Reputation Safeguard
              </h3>
              <p className="text-xs text-zinc-400">
                Sliding-window IP rate limiter protects against aggressive scraping bots, keeping CPM ad accounts compliant.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-footer-test-spam"
                type="button"
                disabled={isSpamTesting}
                onClick={handleTriggerTestSpam}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                {isSpamTesting ? 'Testing 429...' : 'Simulate Bot Burst (429)'}
              </button>
              <button
                id="btn-footer-reset-limit"
                type="button"
                onClick={handleResetRateLimit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset IP Ledger
              </button>
            </div>
          </div>

          {/* Rate Limit Visual Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Client Requests Consumed ({5 - (rateLimitStatus?.remaining ?? 5)} of 5 in 60s window)</span>
              <span className={rateLimitStatus?.isBlocked ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {rateLimitStatus?.isBlocked ? 'BLOCKED BY RATE LIMITER' : `${rateLimitStatus?.remaining ?? 5} Available`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  rateLimitStatus?.isBlocked
                    ? 'bg-rose-500'
                    : (rateLimitStatus?.remaining ?? 5) <= 1
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(100, (((5 - (rateLimitStatus?.remaining ?? 5)) / 5) * 100))}%`
                }}
              />
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- Modals ---------------- */}
      <CodePreviewModal
        resource={previewResource}
        isOpen={isPreviewOpen}
        isProcessing={processingResourceId === previewResource?.id}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={async (id) => {
          await handleDownloadResource(id);
          setIsPreviewOpen(false);
        }}
      />

      <ApiInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        lastApiResponse={lastApiResponse}
        rateLimitStatus={rateLimitStatus}
        onResetRateLimit={handleResetRateLimit}
        onTriggerTestSpam={handleTriggerTestSpam}
        isSpamming={isSpamTesting}
      />
    </div>
  );
};

export default ResourceHub;
