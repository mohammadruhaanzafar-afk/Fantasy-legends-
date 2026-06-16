import React, { useState } from 'react';
import { guideSections } from '../guideData';
import { 
  Database, 
  Sliders, 
  Network, 
  ShieldAlert, 
  GitPullRequest, 
  Copy, 
  Check, 
  Search, 
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function DocExplorer() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Network': return <Network className="w-4 h-4 text-[#C6FF00]" />;
      case 'Database': return <Database className="w-4 h-4 text-[#C6FF00]" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-[#C6FF00]" />;
      case 'GitPullRequest': return <GitPullRequest className="w-4 h-4 text-[#C6FF00]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-[#C6FF00]" />;
      default: return <BookOpen className="w-4 h-4 text-[#C6FF00]" />;
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredSections = guideSections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sec.subsections?.some(sub => 
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sub.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="bg-zinc-950 border-4 border-white/20 rounded-none overflow-hidden shadow-[8px_8px_0px_rgba(198,255,0,0.15)]" id="doc_explorer_root">
      {/* Doc Explorer Header */}
      <div className="p-6 md:p-8 bg-zinc-900 border-b-4 border-[#C6FF00] flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
        <div className="absolute top-2 right-4 text-[9px] font-mono font-black text-[#C6FF00] tracking-widest uppercase">
          BLUEPRINT CONTEXT
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-[#C6FF00] font-mono text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-[#C6FF00]" />
            Architect Blueprints &amp; Specs
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-sans tracking-tight uppercase italic text-white leading-none">
            SYSTEM DESIGN &amp; <span className="text-[#C6FF00]">ROADMAP</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-2 uppercase tracking-wide font-mono">
            Client-server interaction, production schemas, and actionable milestone sprints for launching a free-to-play fantasy sport application.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="SEARCH ARCHITECTURE..."
            className="w-full bg-black border-2 border-white/20 text-xs text-slate-200 placeholder-zinc-600 pl-9 pr-4 py-2.5 rounded-none focus:outline-none focus:border-[#C6FF00] font-mono uppercase tracking-wider"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Layout containing Sidebar and Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-4 border-r-4 border-white/20 bg-zinc-950 p-4 space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible">
          {filteredSections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-full text-left px-4 py-3 border-2 transition-all flex items-center justify-between gap-3 text-xs shrink-0 lg:shrink cursor-pointer uppercase font-black font-mono tracking-wider ${
                activeTab === idx 
                  ? 'bg-[#C6FF00] text-black border-white' 
                  : 'bg-black text-zinc-400 border-white/10 hover:border-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  {getIcon(sec.icon)}
                </span>
                <span className="truncate">{sec.title}</span>
              </div>
              <ArrowRight className={`w-4 h-4 opacity-0 lg:opacity-100 transition-transform ${activeTab === idx ? 'opacity-100 translate-x-1 text-black font-black' : 'text-zinc-655 text-zinc-600'}`} />
            </button>
          ))}
          {filteredSections.length === 0 && (
            <div className="p-4 text-center text-zinc-500 font-mono uppercase text-xs">
              No matching specifications found.
            </div>
          )}
        </div>

        {/* Specification View Panel */}
        <div className="lg:col-span-8 p-6 md:p-8 bg-black overflow-y-auto max-h-[680px]">
          {filteredSections[activeTab] ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-sans uppercase italic text-white mb-2 tracking-tight">
                  {filteredSections[activeTab].title}
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm uppercase font-mono tracking-wide leading-relaxed">
                  {filteredSections[activeTab].content}
                </p>
              </div>

              {/* Nested Subsections */}
              <div className="space-y-6 pt-5 border-t border-white/15">
                {filteredSections[activeTab].subsections?.map((sub, sidx) => (
                  <div key={sidx} className="space-y-3">
                    <h4 className="text-xs font-black font-mono text-[#C6FF00] flex items-center gap-2 tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 bg-[#C6FF00]"></span>
                      {sub.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-mono uppercase tracking-tight whitespace-pre-line">
                      {sub.content}
                    </p>

                    {/* Display Code Snippets if present */}
                    {sub.codeBlock && (
                      <div className="relative rounded-none overflow-hidden bg-zinc-900 border border-white/20">
                        <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-white/15">
                          <span className="font-mono text-[9px] text-[#C6FF00] uppercase tracking-widest font-black">
                            {sub.codeBlock.language} DATA SCHEMATIC SNIPPET
                          </span>
                          <button
                            onClick={() => handleCopy(sub.codeBlock!.code, `${activeTab}_${sidx}`)}
                            className="text-[#C6FF00] hover:text-white transition-colors p-1 rounded-none flex items-center gap-1.5 text-xs font-mono"
                          >
                            {copiedId === `${activeTab}_${sidx}` ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400 font-black animate-pulse" />
                                <span className="text-emerald-400 text-[10px]">COPIED SUCCESSFULLY</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-white" />
                                <span className="text-[10px] text-white">COPY RAW CODE</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-zinc-200 max-h-[290px]">
                          <code>{sub.codeBlock.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-550 text-zinc-650 font-mono text-xs uppercase tracking-widest">
              Select or search for a system guideline folder.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
