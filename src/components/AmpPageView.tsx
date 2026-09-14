import React, { useState } from 'react';
import {
  Zap,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Code2,
  Eye,
  ShieldCheck,
  Flame,
  Layers,
  Smartphone
} from 'lucide-react';
import { ResourceItem, SavedScript } from '../types';
import { RESOURCES_DATABASE } from '../data/resources';

interface AmpPageViewProps {
  onSelectResource: (resource: ResourceItem) => void;
  savedScripts: SavedScript[];
  onOpenCreator: () => void;
}

export const AmpPageView: React.FC<AmpPageViewProps> = ({
  onSelectResource,
  savedScripts,
  onOpenCreator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAmpHtmlExport, setShowAmpHtmlExport] = useState<boolean>(false);
  const [copiedAmpHtml, setCopiedAmpHtml] = useState<boolean>(false);

  const categories = ['All', 'Automation Scripts', 'AI & System Prompts', 'DevOps & Cloud', 'SEO & Growth Tools'];

  const filtered = RESOURCES_DATABASE.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const handleCopyCode = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: ResourceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([item.fullCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName || `${item.slug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ampHtmlBoilerplate = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <title>Script Vault AI - Accelerated Mobile Pages Catalog</title>
  <link rel="canonical" href="https://scriptvault.ai">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 16px; }
    .amp-header { border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    .amp-title { font-size: 18px; font-weight: 700; color: #10b981; }
    .amp-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .amp-badge { display: inline-block; background: #27272a; color: #10b981; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .amp-code { background: #09090b; border: 1px solid #27272a; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; }
  </style>
  <script async src="https://cdn.ampproject.org/v0.js"></script>
</head>
<body>
  <div class="amp-header">
    <div class="amp-title">⚡ Script Vault AI (AMP Engine)</div>
    <span class="amp-badge">Fast Mobile 1.0</span>
  </div>
  ${filtered.map(item => `
  <div class="amp-card">
    <span class="amp-badge">${item.fileType}</span>
    <h3>${item.title}</h3>
    <p>${item.description}</p>
    <div class="amp-code">${item.fullCode.slice(0, 200)}...</div>
  </div>
  `).join('')}
</body>
</html>`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* AMP Fast Mobile Header Banner */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 shadow-lg glow-cyan">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              AMP Mode Active
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              ⚡ Accelerated Mobile Experience
            </span>
          </div>

          <button
            id="btn-amp-html-source"
            type="button"
            onClick={() => setShowAmpHtmlExport(!showAmpHtmlExport)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showAmpHtmlExport ? 'Hide AMP HTML' : 'AMP HTML Code'}</span>
          </button>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight">
          Script Vault AI: Instant Mobile Reader
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Optimized for maximum speed, zero client bloat, and instantaneous code extraction on any device.
        </p>

        {/* Quick Actions in AMP */}
        <div className="flex items-center gap-2 pt-1">
          <button
            id="btn-amp-open-creator"
            type="button"
            onClick={onOpenCreator}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>⚡ Create AI Script in AMP</span>
          </button>
        </div>
      </div>

      {/* AMP HTML Source Modal / Drawer */}
      {showAmpHtmlExport && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-cyan-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Valid Google AMP (Accelerated Mobile Pages) Boilerplate
            </span>
            <button
              id="btn-copy-amp-html"
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(ampHtmlBoilerplate);
                setCopiedAmpHtml(true);
                setTimeout(() => setCopiedAmpHtml(false), 2000);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              {copiedAmpHtml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAmpHtml ? 'Copied HTML' : 'Copy AMP HTML'}</span>
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto rounded-xl bg-zinc-900 border border-zinc-800 p-3 font-mono text-[11px] text-zinc-300">
            <pre>{ampHtmlBoilerplate}</pre>
          </div>
        </div>
      )}

      {/* Fast Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`amp-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AMP High-Speed Script Feed */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const isExpanded = expandedCodeId === item.id;
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-3 hover:border-zinc-700 transition-all shadow-md"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-emerald-400 border border-zinc-700">
                      {item.fileType}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {item.fileName} • {item.fileSize}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    id={`btn-amp-copy-${item.id}`}
                    type="button"
                    onClick={(e) => handleCopyCode(item.id, item.fullCode, e)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                    title="Copy full source code"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    id={`btn-amp-download-${item.id}`}
                    type="button"
                    onClick={(e) => handleDownload(item, e)}
                    className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
                    title="Instant download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.description}
              </p>

              {/* Expandable Code Preview */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setExpandedCodeId(isExpanded ? null : item.id)}
                  className="flex items-center justify-between w-full py-1.5 px-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    {isExpanded ? 'Hide Code' : 'View Code Snippet'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 overflow-x-auto max-h-64 animate-in fade-in">
                    <pre className="text-[11px] leading-relaxed select-all">{item.fullCode}</pre>
                  </div>
                )}
              </div>

              {/* Features Tags */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
                <div className="flex flex-wrap gap-1.5">
                  {item.features.slice(0, 2).map((feat, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
                <span className="text-emerald-400 font-mono font-semibold">
                  Zero Redirects
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
