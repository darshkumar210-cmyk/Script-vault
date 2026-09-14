/**
 * Strict TypeScript Interfaces for the DevScript AI Studio & Code Hub
 */

export type ResourceCategory = 
  | 'Automation Scripts' 
  | 'AI & System Prompts' 
  | 'DevOps & Cloud' 
  | 'Full-Stack Boilerplates' 
  | 'SEO & Growth Tools'
  | 'Community Creations';

export interface ResourceItem {
  id: string;
  title: string;
  slug: string;
  category: ResourceCategory;
  description: string;
  fileType: string;
  fileName: string;
  fileSize: string;
  version: string;
  lastUpdated: string;
  downloadsCount: number;
  rating: number;
  previewSnippet: string;
  fullCode: string;
  tags: string[];
  features: string[];
  executionInstructions?: string;
  dependencies?: string[];
  monetizationTier?: 'Instant Direct' | 'High CPM Partner' | 'Sponsored Gateway';
  estimatedWaitTimeSeconds?: number;
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
  fileName: string;
  fileType: string;
  code: string;
  sizeBytes: number;
  relDirective?: string;
  rateLimitRemaining: number;
  rateLimitResetSeconds: number;
}

export interface DownloadErrorResponse {
  success: false;
  error: string;
  code: 'INVALID_RESOURCE_ID' | 'RATE_LIMIT_EXCEEDED' | 'MALICIOUS_REQUEST_DETECTED' | 'INTERNAL_SERVER_ERROR' | 'BAD_REQUEST' | 'CONTENT_POLICY_VIOLATION';
  retryAfterSeconds?: number;
  timestamp: string;
}

export type DownloadApiResponse = DownloadSuccessResponse | DownloadErrorResponse;

export interface ClientRateLimitStatus {
  ip: string;
  currentRequests: number;
  maxRequests: number;
  windowSeconds: number;
  remaining: number;
  isBlocked: boolean;
  retryAfterSeconds?: number;
}

// -------------------------------------------------------------
// AI SCRIPT CREATOR & CODE GENERATOR INTERFACES
// -------------------------------------------------------------

export type ScriptLanguage = 
  | 'python' 
  | 'typescript' 
  | 'javascript' 
  | 'bash' 
  | 'sql' 
  | 'go' 
  | 'rust' 
  | 'yaml' 
  | 'json'
  | 'react';

export type ScriptArchitecture = 
  | 'cli_tool' 
  | 'api_microservice' 
  | 'automation_worker' 
  | 'pipeline_etl' 
  | 'utility_function' 
  | 'security_hardening' 
  | 'webhook_handler';

export type OptimizationGoal = 
  | 'balanced' 
  | 'high_performance' 
  | 'enterprise_hardened' 
  | 'lightweight_minimal' 
  | 'beginner_friendly';

export type AppViewMode = 'desktop' | 'amp';

export interface ScriptGenerationRequest {
  title?: string;
  prompt: string;
  language: ScriptLanguage;
  architecture: ScriptArchitecture;
  optimizationGoal: OptimizationGoal;
  includeTests: boolean;
  includeDocstrings: boolean;
  category: ResourceCategory;
  speedMode?: 'turbo' | 'deep';
}

export interface ScriptGenerationResponse {
  success: boolean;
  title: string;
  description: string;
  language: ScriptLanguage;
  fileName: string;
  fullCode: string;
  features: string[];
  executionCommands: string[];
  dependencies: string[];
  unitTestsCode?: string;
  architectureSummary: string;
  safetyRating: 'Verified Ethical & Professional' | 'Standard Dev';
  error?: string;
  moderationFeedback?: string;
  generationDurationMs?: number;
}

export interface SavedScript {
  id: string;
  title: string;
  language: ScriptLanguage;
  fileName: string;
  category: ResourceCategory;
  description: string;
  fullCode: string;
  createdAt: string;
  tags: string[];
}
