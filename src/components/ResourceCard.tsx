import React, { useState } from 'react';
import { 
  Download, 
  Eye, 
  Copy, 
  Check, 
  FileCode2, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  Clock, 
  TrendingUp, 
  Loader2 
} from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourceCardProps {
  resource: ResourceItem;
  isProcessing: boolean;
  onDownload: (resourceId: string) => Promise<void>;
  onPreview: (resource: ResourceItem) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isProcessing,
  onDownload,
  onPreview
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(resource.previewSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getTierBadge = (tier: ResourceItem['monetizationTier']) => {
    switch (tier) {
      case 'Instant Direct':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" /> Direct Access
          </span>
        );
      case 'High CPM Partner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3 h-3" /> Verified Gateway
          </span>
        );
      case 'Sponsored Gateway':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-3 h-3" /> Premium Partner
          </span>
        );
    }
  };

  return (
    <div 
      id={`card-${resource.id}`}
      className="group relative flex flex-col justify-between bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/50 text-zinc-300 group-hover:text-emerald-400 transition-colors">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                {resource.category}
              </span>
              <span className="text-xs font-mono text-zinc-500">
                {resource.fileType} • {resource.fileSize}
              </span>
            </div>
          </div>
          {getTierBadge(resource.monetizationTier)}
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-zinc-100 group-hover:text-white transition-colors mb-2 line-clamp-1">
          {resource.title}
        </h3>
        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
          {resource.description}
        </p>

        {/* Code Snippet Interactive Teaser Box */}
        <div className="relative mb-4 bg-zinc-950 rounded-lg p-3 border border-zinc-800/80 font-mono text-xs text-zinc-300 overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-zinc-400" /> Preview Snippet
            </span>
            <button
              id={`copy-snippet-${resource.id}`}
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800"
              title="Copy code preview"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-zinc-400 overflow-x-hidden line-clamp-3 leading-relaxed select-all">
            {resource.previewSnippet}
          </pre>
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {resource.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 rounded text-xs font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions & Secure Trigger */}
      <div className="pt-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
            {resource.downloadsCount.toLocaleString()} downloads
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            ~{resource.estimatedWaitTimeSeconds}s gateway
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            id={`btn-preview-${resource.id}`}
            type="button"
            onClick={() => onPreview(resource)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors border border-zinc-700/60"
          >
            <Eye className="w-3.5 h-3.5" /> Full Code
          </button>

          {/* Primary Action Button with transitions to "Processing Link..." loading state */}
          <button
            id={`btn-download-${resource.id}`}
            type="button"
            disabled={isProcessing}
            onClick={() => onDownload(resource.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm ${
              isProcessing
                ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 hover:shadow-emerald-500/20 active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-200" />
                <span>Processing Link...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Get Script</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
