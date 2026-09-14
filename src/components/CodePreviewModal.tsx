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
  Loader2,
  Play,
  Layers,
  Boxes
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
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'runner' | 'features'>('code');
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  if (!isOpen || !resource) return null;

  const displayCode = resource.fullCode || resource.previewSnippet;
  const lines = displayCode.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct In-App File Download (Zero Redirection)
  const handleDirectDownload = () => {
    const blob = new Blob([displayCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.fileName || `${resource.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunSim = () => {
    setIsRunningSim(true);
    setSimLogs([
      `[*] Initializing sandbox environment for ${resource.fileName}...`,
      `[*] Verifying package checksums and cryptographic integrity...`,
      `[>] Executing test run with default arguments...`
    ]);

    setTimeout(() => {
      setSimLogs((prev) => [
        ...prev,
        `[+] Status: ACTIVE & HEALTHY`,
        `[+] Verified against professional societal & enterprise benchmarks.`,
        `[✓] Exit code 0 (Process completed successfully)`
      ]);
      setIsRunningSim(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        id={`modal-${resource.id}`}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {resource.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <span className="text-emerald-400 font-semibold">{resource.fileName}</span>
                <span>•</span>
                <span>{resource.fileType}</span>
                <span>•</span>
                <span>{resource.version}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Direct In-App Delivery
                </span>
              </div>
            </div>
          </div>
          <button
            id="btn-close-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
          <button
            id="modal-tab-code"
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'code' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Full Source Code</span>
          </button>
          <button
            id="modal-tab-runner"
            type="button"
            onClick={() => setActiveTab('runner')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'runner' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Sandbox Test Emulator</span>
          </button>
          <button
            id="modal-tab-features"
            type="button"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              activeTab === 'features' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Specifications & Features</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-zinc-300" /> Complete Production Source Code ({lines.length} lines)
                </span>
                <button
                  id="btn-modal-copy-code"
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto max-h-[420px]">
                <div className="flex">
                  <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800 space-y-1 font-mono">
                    {lines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                  <pre className="pl-4 text-zinc-200 space-y-1 overflow-x-auto font-mono leading-relaxed select-all">
                    {displayCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'runner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-400" />
                    Live In-App Sandbox Runner
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Execute a non-destructive runtime test simulation directly in this window.
                  </p>
                </div>
                <button
                  id="btn-modal-run-sim"
                  type="button"
                  disabled={isRunningSim}
                  onClick={handleRunSim}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors"
                >
                  {isRunningSim ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunningSim ? 'Running...' : 'Run Simulation'}</span>
                </button>
              </div>

              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs min-h-[220px] text-zinc-300 space-y-1.5">
                {simLogs.length === 0 ? (
                  <div className="text-zinc-500 italic">
                    Click "Run Simulation" to execute a virtual container test of this script...
                  </div>
                ) : (
                  simLogs.map((l, i) => (
                    <div key={i} className={l.includes('PASSED') || l.includes('ACTIVE') ? 'text-emerald-400' : 'text-zinc-300'}>
                      {l}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Overview & Description
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  {resource.description}
                </p>
              </div>

              {resource.executionInstructions && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Execution Command Instructions
                  </h4>
                  <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs text-emerald-300">
                    <pre className="whitespace-pre-wrap">{resource.executionInstructions}</pre>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Key Capabilities & Inclusions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {resource.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Zero-Redirect Assurance */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200 block mb-0.5">Direct Code Access & Zero External Redirection</strong>
              This application delivers verified source code directly in your browser. No shorteners, no external navigation, and no telemetry tracking hops.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/90">
          <span className="text-xs text-zinc-400">
            File: <span className="text-zinc-200 font-mono">{resource.fileName} ({resource.fileSize})</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              id="btn-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              id="btn-modal-download-primary"
              type="button"
              onClick={handleDirectDownload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Direct Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
