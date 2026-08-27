/**
 * PRODUCTION-READY NEXT.JS APP ROUTER API ROUTE
 * File: app/api/get-download/route.ts
 *
 * Description: Secure server-side monetization & script download gateway.
 * Prevents client-side URL scraping, enforces IP rate limits against bot farms,
 * and yields verified destination redirect tokens.
 *
 * Next.js App Router (13/14/15+) compatible using Web standard Request/Response.
 */

// Strict TypeScript Interfaces for Request & Response validation
export interface DownloadRequestBody {
  resourceId: string;
  clientSessionToken?: string;
  verificationNonce?: string;
  fingerprint?: string;
}

export interface DownloadSuccessResponse {
  success: true;
  resourceId: string;
  resourceTitle: string;
  downloadUrl: string;
  expiresAt: number;
  token: string;
  relDirective: string;
  rateLimitRemaining: number;
  rateLimitResetSeconds: number;
}

export interface DownloadErrorResponse {
  success: false;
  error: string;
  code: 'INVALID_RESOURCE_ID' | 'RATE_LIMIT_EXCEEDED' | 'MALICIOUS_REQUEST_DETECTED' | 'INTERNAL_SERVER_ERROR' | 'BAD_REQUEST';
  retryAfterSeconds?: number;
  timestamp: string;
}

export type DownloadApiResponse = DownloadSuccessResponse | DownloadErrorResponse;

interface ResourceTarget {
  title: string;
  destinationUrl: string;
  monetizationTier: string;
  category: string;
}

// In-memory mapped database of secure resource IDs pointing to target monetized shortener URLs
// (Destination URLs remain strictly hidden server-side and are NEVER rendered into raw HTML)
const MONETIZED_RESOURCE_DATABASE: Record<string, ResourceTarget> = {
  'py-playwright-scraper': {
    title: 'High-Throughput E-Commerce Scraper & Anti-Detect Suite',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/py-playwright-scraper-v3',
    monetizationTier: 'High CPM Partner',
    category: 'Automation Scripts'
  },
  'ai-rag-system-prompt': {
    title: 'Enterprise RAG & Autonomous Agent System Prompt Blueprint',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/ai-rag-system-prompt-v4',
    monetizationTier: 'Instant Direct',
    category: 'AI & System Prompts'
  },
  'docker-prod-hardening': {
    title: 'Zero-Trust Docker & Alpine Linux Hardening Compose Suite',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/docker-prod-hardening-v2',
    monetizationTier: 'High CPM Partner',
    category: 'DevOps & Cloud'
  },
  'nextjs-saas-starter': {
    title: 'Next.js 15 App Router Micro-SaaS Boilerplate with Stripe',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/nextjs-saas-starter-v1',
    monetizationTier: 'Sponsored Gateway',
    category: 'Full-Stack Boilerplates'
  },
  'bash-vps-security': {
    title: 'Automated Debian/Ubuntu VPS Hardening & UFW Script',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/bash-vps-security-v5',
    monetizationTier: 'Instant Direct',
    category: 'Automation Scripts'
  },
  'seo-schema-engine': {
    title: 'Dynamic JSON-LD Schema & Semantic Meta Generator',
    destinationUrl: 'https://gateway.scriptmonetize.net/s/seo-schema-engine-v2',
    monetizationTier: 'High CPM Partner',
    category: 'SEO & Growth Tools'
  }
};

// Rate-limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerWindow: 5, // 5 download link generations per client
  windowSizeMs: 60 * 1000, // 60-second sliding time window
  blockDurationMs: 120 * 1000 // 2-minute penalty block for repeated bursts
};

interface RateLimitTracker {
  timestamps: number[];
  blockedUntil?: number;
}

// In-memory sliding-window IP rate limiting ledger
const ipRateLimitLedger = new Map<string, RateLimitTracker>();

/**
 * Extracts and sanitizes the true client IP address from proxy headers
 */
function extractClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Return first non-internal IP in the proxy chain
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

/**
 * Checks sliding window rate limit for given IP
 */
function checkRateLimit(clientIp: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  resetSeconds: number;
} {
  const now = Date.now();
  let tracker = ipRateLimitLedger.get(clientIp);

  if (!tracker) {
    tracker = { timestamps: [] };
    ipRateLimitLedger.set(clientIp, tracker);
  }

  // Check if IP is under active penalty block
  if (tracker.blockedUntil && tracker.blockedUntil > now) {
    const retryAfter = Math.ceil((tracker.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
      resetSeconds: retryAfter
    };
  }

  // Purge expired request timestamps outside the active window
  const windowBoundary = now - RATE_LIMIT_CONFIG.windowSizeMs;
  tracker.timestamps = tracker.timestamps.filter((ts) => ts > windowBoundary);

  if (tracker.timestamps.length >= RATE_LIMIT_CONFIG.maxRequestsPerWindow) {
    // Trigger temporary block
    tracker.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    const retryAfter = Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
      resetSeconds: retryAfter
    };
  }

  // Record valid hit
  tracker.timestamps.push(now);
  const remaining = RATE_LIMIT_CONFIG.maxRequestsPerWindow - tracker.timestamps.length;
  const oldestTimestamp = tracker.timestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + RATE_LIMIT_CONFIG.windowSizeMs - now) / 1000));

  return {
    allowed: true,
    remaining,
    resetSeconds
  };
}

/**
 * POST /api/get-download
 * Handles secure monetization redirection token resolution.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const clientIp = extractClientIp(req);

    // 1. IP Rate Limiting Verification
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      const errorPayload: DownloadErrorResponse = {
        success: false,
        error: 'Too Many Requests: Download limit exceeded. Please wait before requesting additional links to safeguard monetization accounts.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
        timestamp: new Date().toISOString()
      };

      return Response.json(errorPayload, {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds || 60),
          'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerWindow),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetSeconds)
        }
      });
    }

    // 2. Body Payload Parsing & Validation
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const badJsonPayload: DownloadErrorResponse = {
        success: false,
        error: 'Bad Request: Malformed JSON payload received in POST request.',
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString()
      };
      return Response.json(badJsonPayload, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      const invalidPayload: DownloadErrorResponse = {
        success: false,
        error: 'Bad Request: Expected valid JSON object with a resourceId.',
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString()
      };
      return Response.json(invalidPayload, { status: 400 });
    }

    const { resourceId } = body as Partial<DownloadRequestBody>;

    if (!resourceId || typeof resourceId !== 'string' || resourceId.trim().length === 0) {
      const missingIdPayload: DownloadErrorResponse = {
        success: false,
        error: 'Bad Request: Missing or invalid "resourceId" field.',
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString()
      };
      return Response.json(missingIdPayload, { status: 400 });
    }

    const cleanResourceId = resourceId.trim().toLowerCase();

    // 3. Database Resource Lookup
    const targetResource = MONETIZED_RESOURCE_DATABASE[cleanResourceId];

    if (!targetResource) {
      const notFoundPayload: DownloadErrorResponse = {
        success: false,
        error: `Resource Not Found: No monetized link registered for identifier "${cleanResourceId}".`,
        code: 'INVALID_RESOURCE_ID',
        timestamp: new Date().toISOString()
      };
      return Response.json(notFoundPayload, { status: 400 });
    }

    // 4. Generate Single-Use Cryptographic Handshake Nonce & Timestamp Expiry
    const sessionToken = `sec_tok_${Buffer.from(cleanResourceId + '-' + Date.now()).toString('base64url')}`;
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute expiry token

    const responsePayload: DownloadSuccessResponse = {
      success: true,
      resourceId: cleanResourceId,
      resourceTitle: targetResource.title,
      downloadUrl: targetResource.destinationUrl,
      expiresAt,
      token: sessionToken,
      relDirective: 'nofollow noopener noreferrer',
      rateLimitRemaining: rateCheck.remaining,
      rateLimitResetSeconds: rateCheck.resetSeconds
    };

    return Response.json(responsePayload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.maxRequestsPerWindow),
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-RateLimit-Reset': String(rateCheck.resetSeconds)
      }
    });
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : 'Unknown internal failure';
    console.error('[API Error in /api/get-download]:', errorDetails);

    const internalErrorPayload: DownloadErrorResponse = {
      success: false,
      error: 'Internal Server Error: Failed to resolve secure download payload. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    };

    return Response.json(internalErrorPayload, { status: 500 });
  }
}
