import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Parse incoming JSON payloads
app.use(express.json());

// In-Memory Monetized Resource Mapping Database
// Raw destination URLs are strictly kept on the server to prevent scraper harvesting
const MONETIZED_RESOURCE_DATABASE: Record<
  string,
  {
    title: string;
    destinationUrl: string;
    monetizationTier: string;
    category: string;
  }
> = {
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

// Rate Limit Configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerWindow: 5, // 5 requests per 60 seconds
  windowSizeMs: 60 * 1000,
  blockDurationMs: 120 * 1000
};

interface RateLimitTracker {
  timestamps: number[];
  blockedUntil?: number;
}

// In-Memory IP Rate Limiting Ledger
const ipRateLimitLedger = new Map<string, RateLimitTracker>();

/**
 * Extracts and sanitizes the true client IP from proxy headers
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Checks sliding window rate limit for given IP
 */
function checkRateLimit(clientIp: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  resetSeconds: number;
  totalInWindow: number;
  isBlocked: boolean;
} {
  const now = Date.now();
  let tracker = ipRateLimitLedger.get(clientIp);

  if (!tracker) {
    tracker = { timestamps: [] };
    ipRateLimitLedger.set(clientIp, tracker);
  }

  // Check active block
  if (tracker.blockedUntil && tracker.blockedUntil > now) {
    const retryAfter = Math.ceil((tracker.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
      resetSeconds: retryAfter,
      totalInWindow: tracker.timestamps.length,
      isBlocked: true
    };
  }

  // Clear expired timestamps outside the sliding window
  const windowBoundary = now - RATE_LIMIT_CONFIG.windowSizeMs;
  tracker.timestamps = tracker.timestamps.filter((ts) => ts > windowBoundary);

  if (tracker.timestamps.length >= RATE_LIMIT_CONFIG.maxRequestsPerWindow) {
    tracker.blockedUntil = now + RATE_LIMIT_CONFIG.blockDurationMs;
    const retryAfter = Math.ceil(RATE_LIMIT_CONFIG.blockDurationMs / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: retryAfter,
      resetSeconds: retryAfter,
      totalInWindow: tracker.timestamps.length,
      isBlocked: true
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
    resetSeconds,
    totalInWindow: tracker.timestamps.length,
    isBlocked: false
  };
}

// -------------------------------------------------------------
// BACKEND API ROUTES
// -------------------------------------------------------------

// 1. POST /api/get-download
app.post('/api/get-download', (req: Request, res: Response): void => {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting Enforcement
    const rateCheck = checkRateLimit(clientIp);
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_CONFIG.maxRequestsPerWindow));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, rateCheck.remaining)));
    res.setHeader('X-RateLimit-Reset', String(rateCheck.resetSeconds));

    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfterSeconds || 60));
      res.status(429).json({
        success: false,
        error: 'Too Many Requests: IP rate limit exceeded. Please wait before requesting additional links to protect monetization accounts.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfterSeconds: rateCheck.retryAfterSeconds,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Body Validation
    const { resourceId } = req.body || {};

    if (!resourceId || typeof resourceId !== 'string' || resourceId.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Missing or invalid "resourceId" in request body.',
        code: 'BAD_REQUEST',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const cleanResourceId = resourceId.trim().toLowerCase();
    const targetResource = MONETIZED_RESOURCE_DATABASE[cleanResourceId];

    if (!targetResource) {
      res.status(400).json({
        success: false,
        error: `Resource Not Found: No monetized link registered for ID "${cleanResourceId}".`,
        code: 'INVALID_RESOURCE_ID',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate cryptographic token handshake
    const sessionToken = `sec_tok_${Buffer.from(cleanResourceId + '-' + Date.now()).toString('base64url')}`;
    const expiresAt = Date.now() + 5 * 60 * 1000;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.status(200).json({
      success: true,
      resourceId: cleanResourceId,
      resourceTitle: targetResource.title,
      downloadUrl: targetResource.destinationUrl,
      expiresAt,
      token: sessionToken,
      relDirective: 'nofollow noopener noreferrer',
      rateLimitRemaining: rateCheck.remaining,
      rateLimitResetSeconds: rateCheck.resetSeconds
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Error in /api/get-download]:', message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Failed to resolve secure download payload.',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// 2. GET /api/rate-limit-status - Telemetry Endpoint for UI Inspector
app.get('/api/rate-limit-status', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  const now = Date.now();
  const tracker = ipRateLimitLedger.get(clientIp);

  if (!tracker) {
    res.json({
      ip: clientIp,
      currentRequests: 0,
      maxRequests: RATE_LIMIT_CONFIG.maxRequestsPerWindow,
      windowSeconds: RATE_LIMIT_CONFIG.windowSizeMs / 1000,
      remaining: RATE_LIMIT_CONFIG.maxRequestsPerWindow,
      isBlocked: false
    });
    return;
  }

  const windowBoundary = now - RATE_LIMIT_CONFIG.windowSizeMs;
  const activeTimestamps = tracker.timestamps.filter((ts) => ts > windowBoundary);
  const isBlocked = !!(tracker.blockedUntil && tracker.blockedUntil > now);
  const retryAfter = isBlocked ? Math.ceil((tracker.blockedUntil! - now) / 1000) : 0;

  res.json({
    ip: clientIp,
    currentRequests: activeTimestamps.length,
    maxRequests: RATE_LIMIT_CONFIG.maxRequestsPerWindow,
    windowSeconds: RATE_LIMIT_CONFIG.windowSizeMs / 1000,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequestsPerWindow - activeTimestamps.length),
    isBlocked,
    retryAfterSeconds: retryAfter > 0 ? retryAfter : undefined
  });
});

// 3. POST /api/rate-limit-reset - Development reset tool
app.post('/api/rate-limit-reset', (req: Request, res: Response) => {
  const clientIp = getClientIp(req);
  ipRateLimitLedger.delete(clientIp);
  res.json({
    success: true,
    message: `Rate limit ledger reset for client IP ${clientIp}`
  });
});

// -------------------------------------------------------------
// VITE & STATIC FILE SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Monetization Engine Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
