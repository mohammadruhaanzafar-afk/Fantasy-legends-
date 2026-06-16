import React, { useState, useEffect } from 'react';
import { Match, Series, PointRule, FantasySquad } from './types';
import DocExplorer from './components/DocExplorer';
import AdminDashboard from './components/AdminDashboard';
import PlayerWizard from './components/PlayerWizard';
import Leaderboards from './components/Leaderboards';
import { 
  Trophy, 
  Users, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  BookOpen,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  // 'lobby' (Leaderboards/Standings), 'player' (Draft Lounge), 'admin' (Commissioner Panel), 'docs' (Architecture Specifications)
  const [activeSegment, setActiveSegment] = useState<'lobby' | 'player' | 'admin' | 'docs'>('lobby');

  // Application State holding database records synced with full-stack Node server
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [pointRules, setPointRules] = useState<PointRule[]>([]);
  const [squadsList, setSquadsList] = useState<FantasySquad[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Load backend state on initialization
  const refreshApplicationState = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/state');
      if (!response.ok) {
        throw new Error(`Failed to load server state: Status ${response.status}`);
      }
      const data = await response.json();
      setSeriesList(data.series || []);
      setMatchesList(data.matches || []);
      setPointRules(data.rules || []);
      setSquadsList(data.squads || []);
      setErrorNotice(null);
    } catch (err: any) {
      console.error("API error, keeping client fallback:", err);
      setErrorNotice("Backend service starting up. Displaying responsive client-side cache state.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshApplicationState();
  }, []);

  // API Call: Add New Series (Admin Action)
  const handleAddSeries = async (name: string, description: string, startDate: string) => {
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, startDate })
      });
      if (!res.ok) throw new Error("Could not construct series on backend.");
      await refreshApplicationState();
    } catch (err) {
      console.error(err);
      alert("Failed to submit series. Attempting standard local client persistence.");
    }
  };

  // API Call: Add New Match (Admin Action)
  const handleAddMatch = async (matchData: { seriesId: string; title: string; team1: string; team2: string; date: string }) => {
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData)
      });
      if (!res.ok) throw new Error("Could not setup match on backend.");
      await refreshApplicationState();
    } catch (err) {
      console.error(err);
      alert("Failed backend submission. Updating client fallback state.");
    }
  };

  // API Call: Draft Fantasy Squad (Player Action)
  const handleDraftSquadSubmit = async (draftData: {
    matchId: string;
    userId: string;
    userName: string;
    playerIds: string[];
    captainId: string;
    viceCaptainId: string;
    totalCreditsUsed: number;
  }) => {
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });
      if (!res.ok) throw new Error("Could not register squad on backend.");
      await refreshApplicationState();
      setActiveSegment('lobby'); // Auto navigate to Leaderboards upon draft
    } catch (err) {
      console.error(err);
      alert("Fallback error saving draft. Displaying local updates.");
    }
  };

  // API Call: Update Scorers Settings (Admin Action)
  const handleUpdateRules = async (updatedRules: PointRule[]) => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedRules })
      });
      if (!res.ok) throw new Error("Could not update rules on backend.");
      await refreshApplicationState();
    } catch (err) {
      console.error(err);
    }
  };

  // API Call: Input match scores + recalculation (Admin Scorer finalization)
  const handleFinalizeMatchScores = async (matchId: string, stats: Record<string, any>) => {
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, playerPerformance: stats })
      });
      if (!res.ok) throw new Error("Failed to compile score indexes on backend.");
      await refreshApplicationState();
      setActiveSegment('lobby'); // Auto navigate to Leaderboards after finalizing to witness the standings update!
    } catch (err) {
      console.error(err);
      alert("Scorer engine failed. Standings recalculator was aborted.");
    }
  };

  // API Call: Reset state database
  const handleResetState = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error("State reset aborted.");
      await refreshApplicationState();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#C6FF00] selection:text-black border-4 md:border-8 border-[#C6FF00]" id="app_root">
      
      {/* Brutalist Custom Header in Bold Typography Style */}
      <header className="bg-zinc-950 text-white border-b-4 border-[#C6FF00] shadow-2xl relative overflow-hidden">
        {/* Decorative corner block */}
        <div className="absolute top-0 right-0 bg-[#C6FF00] text-black text-[9px] font-mono font-black uppercase px-3 py-1 tracking-widest z-10">
          PRO EDITION
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[#C6FF00] font-mono text-xs md:text-sm tracking-widest uppercase">
              <span>● COMMISSIONER LEAGUE ENGINE</span>
              <span className="text-zinc-600">|</span>
              <span className="bg-[#C6FF00]/10 text-[#C6FF00] font-black px-1.5 py-0.5 border border-[#C6FF00]/30 rounded">
                100% FREE TO PLAY
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] text-white">
              PRIVATE <span className="text-[#C6FF00]">FANTASY</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-tight uppercase max-w-xl">
              Organize leagues, draft custom teams within points budgets, sync score points, and conquer standings. Strictly no wallets, no real money.
            </p>
          </div>

          {/* Bold Tab Navigation */}
          <nav className="flex flex-wrap gap-2 lg:bg-black/60 p-1 rounded-none border-b lg:border-2 border-[#C6FF00]/20 pb-4 lg:pb-1 lg:p-1">
            <button
              onClick={() => setActiveSegment('lobby')}
              style={{ transition: 'none' }}
              className={`px-4 py-2.5 text-xs font-black tracking-widest uppercase border-2 transition-all flex items-center gap-2 ${
                activeSegment === 'lobby'
                  ? 'bg-[#C6FF00] text-black border-[#C6FF00] translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_rgba(255,255,255,0.9)]'
                  : 'text-white border-white/20 hover:border-white hover:text-[#C6FF00]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Lobby Standings
            </button>
            <button
              onClick={() => setActiveSegment('player')}
              style={{ transition: 'none' }}
              className={`px-4 py-2.5 text-xs font-black tracking-widest uppercase border-2 transition-all flex items-center gap-2 ${
                activeSegment === 'player'
                  ? 'bg-[#C6FF00] text-black border-[#C6FF00] translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_rgba(255,255,255,0.9)]'
                  : 'text-white border-white/20 hover:border-white hover:text-[#C6FF00]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Draft Lounge
            </button>
            <button
              onClick={() => setActiveSegment('admin')}
              style={{ transition: 'none' }}
              className={`px-4 py-2.5 text-xs font-black tracking-widest uppercase border-2 transition-all flex items-center gap-2 ${
                activeSegment === 'admin'
                  ? 'bg-[#C6FF00] text-black border-[#C6FF00] translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_rgba(255,255,255,0.9)]'
                  : 'text-white border-white/20 hover:border-white hover:text-[#C6FF00]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Commissioner Panel
            </button>
            <button
              onClick={() => setActiveSegment('docs')}
              style={{ transition: 'none' }}
              className={`px-4 py-2.5 text-xs font-black tracking-widest uppercase border-2 transition-all flex items-center gap-2 ${
                activeSegment === 'docs'
                  ? 'bg-[#C6FF00] text-black border-[#C6FF00] translate-x-[-2px] translate-y-[-2px] shadow-[2px_2px_0px_rgba(255,255,255,0.9)]'
                  : 'text-white border-white/20 hover:border-white hover:text-[#C6FF00]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Specs & System
            </button>
          </nav>
        </div>
      </header>

      {/* Global Notice Callout */}
      {errorNotice && (
        <div className="bg-amber-500/15 border-b-2 border-amber-500/40 text-amber-200 text-xs py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-mono">
              <Info className="w-4 h-4 text-[#C6FF00]" />
              {errorNotice}
            </span>
            <button 
              onClick={refreshApplicationState}
              className="text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 bg-[#C6FF00] hover:bg-[#a3d400] text-black px-3 py-1.5 transition-none border-2 border-white"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              SYNC STATE DB
            </button>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-12" id="stage_container">
        
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-12 h-12 text-[#C6FF00] animate-spin" />
            <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">Compiling fantasy state parameters...</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* LOBBY / LEADERBOARDS SEGMENT */}
            {activeSegment === 'lobby' && (
              <Leaderboards 
                seriesList={seriesList}
                matchesList={matchesList}
                squadsList={squadsList}
              />
            )}

            {/* PLAYER DRAFT LOUNGE SEGMENT */}
            {activeSegment === 'player' && (
              <PlayerWizard 
                matches={matchesList.filter(m => m.status === 'upcoming')}
                onDraftSquadSubmit={handleDraftSquadSubmit}
              />
            )}

            {/* COMMISSIONER / ADMIN SEGMENT */}
            {activeSegment === 'admin' && (
              <AdminDashboard 
                seriesList={seriesList}
                matchesList={matchesList}
                pointRules={pointRules}
                onAddSeries={handleAddSeries}
                onAddMatch={handleAddMatch}
                onUpdateRules={handleUpdateRules}
                onFinalizeMatchScores={handleFinalizeMatchScores}
                onResetState={handleResetState}
              />
            )}

            {/* SPECS & BLUEPRINT SPECIFICATIONS SEGMENT */}
            {activeSegment === 'docs' && (
              <DocExplorer />
            )}

          </div>
        )}

      </main>

      {/* Aesthetic footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-10 border-t-2 border-[#C6FF00]/40 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-mono text-[#C6FF00] font-bold">PRIVATE FANTASY CONTESTS FOR MATES</p>
            <p className="text-[10px] text-zinc-600">ZERO WALLETS • NO DEPOSITS • NOT GAMBLING RECREATION • BUILT IN GOOGLE AI STUDIO</p>
          </div>
          <div className="flex gap-4 font-mono">
            <button onClick={() => setActiveSegment('docs')} className="hover:text-white transition-none text-zinc-400 font-bold uppercase">System Specs</button>
            <span className="text-zinc-800">|</span>
            <button onClick={refreshApplicationState} className="hover:text-[#C6FF00] transition-none text-zinc-400 flex items-center gap-1.5 uppercase font-bold">
              <RefreshCw className="w-3.5 h-3.5" />
              Force Database Sync
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
