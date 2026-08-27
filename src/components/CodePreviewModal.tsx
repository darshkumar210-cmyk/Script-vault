import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { ResourceItem } from '../types';

interface CodePreviewModalProps {
  resource: ResourceItem | null;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onDownload: (resourceId: string) => Promise<void>;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  resource,
  isOpen,
  isProcessing,
  onClose,
  onDownload
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !resource) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.previewSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = resource.previewSnippet.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id={`modal-${resource.id}`}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {resource.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span>{resource.fileType}</span>
                <span>•</span>
                <span>{resource.version}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SHA-256 Verified
                </span>
              </div>
            </div>
          </div>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Description & Specifications
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {resource.description}
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Key Features & Inclusions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {resource.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div>
            <div className="flex items-center justify-between pb-2 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-300" /> Source Snippet Preview
              </span>
              <button
                id="btn-modal-copy-code"
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto max-h-72">
              <div className="flex">
                <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800 space-y-1 font-mono">
                  {lines.map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="pl-4 text-zinc-300 space-y-1 overflow-x-auto font-mono leading-relaxed select-all">
                  {resource.previewSnippet}
                </pre>
              </div>
            </div>
          </div>

          {/* SEO & Bot Safety Note */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200 block mb-0.5">Secure Gateway Protection & SEO Safe Delivery</strong>
              Links are dispatched via server-side session nonce token exchange with <code className="text-zinc-300">rel="nofollow noopener noreferrer"</code> to safeguard search engine indexing and prevent scraping.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/90">
          <span className="text-xs text-zinc-400">
            Estimated unlock time: <span className="text-zinc-200 font-mono">~{resource.estimatedWaitTimeSeconds}s</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              id="btn-modal-download-primary"
              type="button"
              disabled={isProcessing}
              onClick={() => onDownload(resource.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isProcessing
                  ? 'bg-emerald-600/60 text-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Processing Link...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Get Full Script Bundle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
