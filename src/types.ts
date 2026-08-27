/**
 * Strict TypeScript Interfaces for the Interactive Script & Template Monetization Engine
 */

export type ResourceCategory = 
  | 'Automation Scripts' 
  | 'AI & System Prompts' 
  | 'DevOps & Cloud' 
  | 'Full-Stack Boilerplates' 
  | 'SEO & Growth Tools';

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  category: ResourceCategory;
  description: string;
  fileType: string;
  fileSize: string;
  version: string;
  lastUpdated: string;
  downloadsCount: number;
  rating: number;
  previewSnippet: string;
  tags: string[];
  features: string[];
  monetizationTier: 'Instant Direct' | 'High CPM Partner' | 'Sponsored Gateway';
  estimatedWaitTimeSeconds: number;
}

export interface DownloadRequestPayload {
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

export interface RateLimitEntry {
  requests: number[];
  firstRequest: number;
  blockedUntil?: number;
}

export interface ClientRateLimitStatus {
  ip: string;
  currentRequests: number;
  maxRequests: number;
  windowSeconds: number;
  remaining: number;
  isBlocked: boolean;
  retryAfterSeconds?: number;
}
