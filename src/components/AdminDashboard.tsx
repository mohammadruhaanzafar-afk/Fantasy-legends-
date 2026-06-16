import React, { useState } from 'react';
import { Match, Series, PointRule } from '../types';
import { 
  PlusCircle, 
  Save, 
  Settings, 
  UserCheck, 
  Play, 
  Award, 
  CheckCircle,
  Database,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface AdminDashboardProps {
  seriesList: Series[];
  matchesList: Match[];
  pointRules: PointRule[];
  onAddSeries: (name: string, description: string, startDate: string) => void;
  onAddMatch: (matchData: { seriesId: string; title: string; team1: string; team2: string; date: string }) => void;
  onUpdateRules: (updatedRules: PointRule[]) => void;
  onFinalizeMatchScores: (matchId: string, stats: Record<string, any>) => void;
  onResetState: () => void;
}

export default function AdminDashboard({
  seriesList,
  matchesList,
  pointRules,
  onAddSeries,
  onAddMatch,
  onUpdateRules,
  onFinalizeMatchScores,
  onResetState
}: AdminDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'create' | 'scorer' | 'rules'>('scorer');

  // Create Series States
  const [seriesName, setSeriesName] = useState('');
  const [seriesDesc, setSeriesDesc] = useState('');
  const [seriesStart, setSeriesStart] = useState('2026-06-20');

  // Create Match States
  const [matchSeriesId, setMatchSeriesId] = useState('');
  const [matchTitle, setMatchTitle] = useState('');
  const [matchTeam1, setMatchTeam1] = useState('IND');
  const [matchTeam2, setMatchTeam2] = useState('AUS');
  const [matchDate, setMatchDate] = useState('2026-06-18T19:00');

  // Rules adjustment state
  const [localRules, setLocalRules] = useState<PointRule[]>(pointRules);

  // Scorer states
  const [selectedMatchScorer, setSelectedMatchScorer] = useState<Match | null>(matchesList[0] || null);
  const [playerScores, setPlayerScores] = useState<Record<string, {
    runs: number; balls: number; fours: number; sixes: number; wickets: number; maidens: number; catches: number; stumpings: number; runOuts: number;
  }>>({});

  // Populate dynamic scoring template helper
  const initializeScorerStats = (match: Match) => {
    const statsObj: typeof playerScores = {};
    match.players.forEach((p) => {
      statsObj[p.id] = {
        runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, maidens: 0, catches: 0, stumpings: 0, runOuts: 0
      };
    });
    setPlayerScores(statsObj);
  };

  // Preset match simulation scenarios
  const applyPresetScenarios = (type: 'batting' | 'bowling' | 'balanced') => {
    if (!selectedMatchScorer) return;
    const statsObj: typeof playerScores = {};
    
    selectedMatchScorer.players.forEach((p) => {
      if (type === 'batting') {
        const isStarBatsman = ['ind_vk', 'ind_rs', 'aus_th', 'ind_sk'].includes(p.id);
        const isHeavyAllrounder = ['ind_hp', 'aus_gm'].includes(p.id);
        
        statsObj[p.id] = {
          runs: isStarBatsman ? 82 : (isHeavyAllrounder ? 45 : Math.floor(Math.random() * 15)),
          balls: isStarBatsman ? 51 : 25,
          fours: isStarBatsman ? 7 : (isHeavyAllrounder ? 4 : 0),
          sixes: isStarBatsman ? 4 : (isHeavyAllrounder ? 2 : 0),
          wickets: p.role === 'Bowler' ? (Math.random() > 0.5 ? 1 : 0) : 0,
          maidens: 0,
          catches: Math.random() > 0.6 ? 1 : 0,
          stumpings: p.role === 'Wicketkeeper' && Math.random() > 0.5 ? 1 : 0,
          runOuts: 0
        };
      } else if (type === 'bowling') {
        const isStarBowler = ['ind_jb', 'aus_pc', 'aus_az', 'aus_ms'].includes(p.id);
        
        statsObj[p.id] = {
          runs: p.role === 'Batsman' ? Math.floor(Math.random() * 18) : 5,
          balls: 15,
          fours: 0,
          sixes: 0,
          wickets: isStarBowler ? 3 : (p.role === 'Bowler' ? 1 : 0),
          maidens: isStarBowler && Math.random() > 0.6 ? 1 : 0,
          catches: Math.random() > 0.5 ? 1 : 0,
          stumpings: p.role === 'Wicketkeeper' ? 2 : 0,
          runOuts: Math.random() > 0.7 ? 1 : 0
        };
      } else {
        // Balanced scenario
        statsObj[p.id] = {
          runs: p.role === 'Batsman' ? Math.floor(Math.random() * 45) + 10 : Math.floor(Math.random() * 8),
          balls: 30,
          fours: p.role === 'Batsman' ? 3 : 0,
          sixes: p.role === 'Batsman' ? 1 : 0,
          wickets: p.role === 'Bowler' ? Math.floor(Math.random() * 3) : 0,
          maidens: 0,
          catches: Math.random() > 0.7 ? 1 : 0,
          stumpings: 0,
          runOuts: 0
        };
      }
    });
    setPlayerScores(statsObj);
  };

  const handleCreateSeriesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seriesName) return;
    onAddSeries(seriesName, seriesDesc, seriesStart);
    setSeriesName('');
    setSeriesDesc('');
    alert('Series successfully configured! Select it from Match Setup below.');
  };

  const handleCreateMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selId = matchSeriesId || (seriesList[0] ? seriesList[0].id : '');
    if (!selId || !matchTitle) return;
    onAddMatch({
      seriesId: selId,
      title: matchTitle,
      team1: matchTeam1,
      team2: matchTeam2,
      date: matchDate
    });
    setMatchTitle('');
    alert('Custom Match created successfully. Friends can view and draft now!');
  };

  const handleScoreChange = (playerId: string, field: string, value: number) => {
    setPlayerScores((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const submitMatchScores = () => {
    if (!selectedMatchScorer) return;
    onFinalizeMatchScores(selectedMatchScorer.id, playerScores);
    alert(`Stats finalized for ${selectedMatchScorer.title}! Points, leaderboards and ranks evaluated successfully.`);
  };

  return (
    <div className="bg-zinc-950 border-4 border-white/20 rounded-none overflow-hidden shadow-[8px_8px_0px_rgba(198,255,0,0.15)]" id="admin_dashboard_root">
      
      {/* Dashboard Subheader */}
      <div className="p-6 bg-zinc-900 border-b-4 border-white/20 relative">
        <div className="absolute top-2 right-4 text-[9px] font-mono font-black text-[#C6FF00] tracking-widest uppercase">
          COMMISSIONER CORE //
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#C6FF00] font-mono text-xs uppercase tracking-wider mb-2">
              <UserCheck className="w-4 h-4 text-[#C6FF00]" />
              COMMISSIONER ENGINE CONTROLS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black font-sans tracking-tighter uppercase italic text-white leading-none">
              LEAGUES &amp; <span className="text-[#C6FF00]">MATCH SETUP</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-2 uppercase tracking-wide font-mono">Define tournaments, customize points rules, and manually sync live standings.</p>
          </div>

          {/* Action Toggles */}
          <div className="flex flex-wrap gap-1.5 bg-black p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('scorer')}
              className={`px-4 py-2 text-xs font-black uppercase transition cursor-pointer ${
                activeTab === 'scorer'
                  ? 'bg-[#C6FF00] text-black font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Match Scorer
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs font-black uppercase transition cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#C6FF00] text-black font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Add New
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-4 py-2 text-xs font-black uppercase transition cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-[#C6FF00] text-black font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Points Rules
            </button>
            <button
              onClick={() => {
                if (window.confirm("Restore standard cricket teams, sample drafts, and official rules?")) {
                  onResetState();
                }
              }}
              className="px-3 py-2 text-xs font-black font-mono bg-red-950 border border-red-850 hover:bg-red-900 text-red-200 uppercase cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              Reset State
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* TAB 1: SCORER CENTER */}
        {activeTab === 'scorer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Select Active Target Match */}
              <div className="lg:col-span-4 space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#C6FF00] font-mono">
                  Select Active Match
                </label>
                <div className="space-y-2">
                  {matchesList.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => {
                        setSelectedMatchScorer(match);
                        initializeScorerStats(match);
                      }}
                      className={`w-full text-left p-4 rounded-none border-2 transition cursor-pointer ${
                        selectedMatchScorer?.id === match.id
                          ? 'bg-[#C6FF00]/10 border-[#C6FF00]'
                          : 'bg-black border-white/10 hover:border-white'
                      }`}
                    >
                      <div className="text-[10px] font-black text-[#C6FF00] font-mono uppercase tracking-widest">
                        {match.team1} vs {match.team2}
                      </div>
                      <div className="text-sm font-semibold text-white mt-1 truncate uppercase">
                        {match.title}
                      </div>
                      {match.status === 'completed' ? (
                        <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-bold bg-zinc-900 text-[#C6FF00] font-mono uppercase tracking-wider border border-[#C6FF00]/20">
                          COMPLETED &amp; SCORED
                        </span>
                      ) : (
                        <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-bold bg-[#C6FF00] text-black font-mono uppercase tracking-wider">
                          READY FOR SCORES
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedMatchScorer && (
                  <div className="bg-zinc-900 border-2 border-[#C6FF00]/30 rounded-none p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-black font-mono px-2 py-0.5 tracking-wider">
                      AUTO SIMULATOR
                    </div>
                    <h5 className="text-xs font-black text-white flex items-center gap-2 uppercase font-mono">
                      <Sparkles className="w-4 h-4 text-[#C6FF00]" />
                      Dynamic Match Presets
                    </h5>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase leading-normal">
                      Instantly mock match statistics. Simulates deep player ratios so you can evaluate the team leaderboards immediately.
                    </p>
                    <div className="grid grid-cols-1 gap-2 pt-2">
                      <button
                        onClick={() => applyPresetScenarios('balanced')}
                        className="bg-black border border-white/10 text-white hover:border-[#C6FF00] px-3 py-2 text-xs font-mono font-bold uppercase transition"
                      >
                        A: Balanced Run/Wicket
                      </button>
                      <button
                        onClick={() => applyPresetScenarios('batting')}
                        className="bg-black border border-white/10 text-white hover:border-[#C6FF00] px-3 py-2 text-xs font-mono font-bold uppercase transition"
                      >
                        B: Heavy Batsmen Clash
                      </button>
                      <button
                        onClick={() => applyPresetScenarios('bowling')}
                        className="bg-black border border-white/10 text-white hover:border-[#C6FF00] px-3 py-2 text-xs font-mono font-bold uppercase transition"
                      >
                        C: Bowler Dominated Haul
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stat Sheet Input Grid */}
              <div className="lg:col-span-8 space-y-4">
                {selectedMatchScorer ? (
                  <div className="border border-white/10 rounded-none overflow-hidden bg-black">
                    <div className="bg-zinc-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b-2 border-white/20">
                      <div>
                        <h4 className="text-sm font-black text-[#C6FF00] font-mono uppercase">
                          STAT SHEET: {selectedMatchScorer.title.toUpperCase()}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5 uppercase font-mono">
                          Enter raw sports metrics below. Click "compile scores" to trigger standings computations.
                        </p>
                      </div>
                      <button
                        onClick={submitMatchScores}
                        className="bg-[#C6FF00] hover:bg-[#a3d400] text-black font-black px-5 py-2 text-xs uppercase cursor-pointer border-2 border-white font-mono"
                      >
                        <Award className="w-4 h-4 inline mr-1" />
                        Finalize Score sheet
                      </button>
                    </div>

                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-zinc-950 border-b border-white/20 font-mono text-[#C6FF00] uppercase font-bold text-[10px]">
                            <th className="p-3">Player / Name</th>
                            <th className="p-3">Runs</th>
                            <th className="p-3">4s/6s</th>
                            <th className="p-3">Wickets</th>
                            <th className="p-3">Maidens</th>
                            <th className="p-3">Catches / St. / RO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          {selectedMatchScorer.players.map((p) => {
                            const scores = playerScores[p.id] || {
                              runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, maidens: 0, catches: 0, stumpings: 0, runOuts: 0
                            };
                            return (
                              <tr key={p.id} className="hover:bg-zinc-900/60">
                                <td className="p-3">
                                  <div className="font-extrabold text-[#C6FF00] uppercase text-xs">{p.name}</div>
                                  <div className="text-[9px] text-zinc-500 mt-0.5 uppercase font-semibold">
                                    {p.team} // {p.role}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-14 bg-black border border-white/20 focus:border-[#C6FF00] p-1 font-bold text-center text-xs text-white rounded-none"
                                    value={scores.runs}
                                    onChange={(e) => handleScoreChange(p.id, 'runs', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="4"
                                      className="w-10 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-[11px] text-white rounded-none"
                                      value={scores.fours || ''}
                                      onChange={(e) => handleScoreChange(p.id, 'fours', parseInt(e.target.value) || 0)}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="6"
                                      className="w-10 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-[11px] text-white rounded-none"
                                      value={scores.sixes || ''}
                                      onChange={(e) => handleScoreChange(p.id, 'sixes', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-14 bg-black border border-white/20 focus:border-[#C6FF00] p-1 font-bold text-center text-xs text-white rounded-none"
                                    value={scores.wickets}
                                    onChange={(e) => handleScoreChange(p.id, 'wickets', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-14 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-xs text-white rounded-none"
                                    value={scores.maidens}
                                    onChange={(e) => handleScoreChange(p.id, 'maidens', parseInt(e.target.value) || 0)}
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      title="Catches"
                                      placeholder="Cat"
                                      className="w-9 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-[10px] text-white rounded-none"
                                      value={scores.catches || ''}
                                      onChange={(e) => handleScoreChange(p.id, 'catches', parseInt(e.target.value) || 0)}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      title="Stumpings"
                                      placeholder="St"
                                      className="w-9 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-[10px] text-white rounded-none"
                                      value={scores.stumpings || ''}
                                      onChange={(e) => handleScoreChange(p.id, 'stumpings', parseInt(e.target.value) || 0)}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      title="Run Outs"
                                      placeholder="RO"
                                      className="w-9 bg-black border border-white/20 focus:border-[#C6FF00] p-1 text-center text-[10px] text-white rounded-none"
                                      value={scores.runOuts || ''}
                                      onChange={(e) => handleScoreChange(p.id, 'runOuts', parseInt(e.target.value) || 0)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center bg-zinc-900 border border-dashed border-white/10 text-zinc-500 font-mono uppercase tracking-widest">
                    No active match setup available. Create a match to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE MATCHES / SERIES */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Create Series Form */}
            <div className="bg-zinc-900 border border-white/10 p-5 rounded-none space-y-4">
              <h4 className="text-xs font-black uppercase text-[#C6FF00] tracking-widest font-mono flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C6FF00]" />
                I. Add Private Series Group
              </h4>
              <form onSubmit={handleCreateSeriesSubmit} className="space-y-4 font-mono select-none">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Series Title Label</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. CHAMPIONS SUPER LEAGUE"
                    className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs focus:outline-none focus:border-[#C6FF00]"
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Description / Bragging Rules</label>
                  <textarea
                    placeholder="Provide notes or rules (e.g., beers on loser!)"
                    className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs h-20 resize-none focus:outline-none focus:border-[#C6FF00]"
                    value={seriesDesc}
                    onChange={(e) => setSeriesDesc(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Kick-off Date</label>
                  <input
                    type="date"
                    required
                    className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs focus:outline-none focus:border-[#C6FF00]"
                    value={seriesStart}
                    onChange={(e) => setSeriesStart(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C6FF00] hover:bg-[#a3d400] text-black font-black py-3 rounded-none text-xs uppercase border-2 border-white font-mono cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 inline mr-1" />
                  Boot Custom Series
                </button>
              </form>
            </div>

            {/* Create Match Form */}
            <div className="bg-black border-2 border-white/20 p-5 rounded-none space-y-4">
              <h4 className="text-xs font-black uppercase text-[#C6FF00] tracking-widest font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-[#C6FF00]" />
                II. Add Matchup Event
              </h4>
              <form onSubmit={handleCreateMatchSubmit} className="space-y-4 font-mono select-none">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-405 text-zinc-400 mb-1">Link with Series</label>
                  <select
                    className="w-full bg-zinc-900 border-2 border-white/20 text-white rounded-none p-3 text-xs focus:outline-none cursor-pointer"
                    value={matchSeriesId}
                    onChange={(e) => setMatchSeriesId(e.target.value)}
                  >
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id} className="bg-black">{s.name.toUpperCase()}</option>
                    ))}
                    {seriesList.length === 0 && (
                      <option value="">No Active Series Found</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Matchup Label Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. IND VS AUS - BOXING DAY CLASH"
                    className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs focus:outline-none focus:border-[#C6FF00]"
                    value={matchTitle}
                    onChange={(e) => setMatchTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Team A Code</label>
                    <input
                      type="text"
                      className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                      value={matchTeam1}
                      onChange={(e) => setMatchTeam1(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Team B Code</label>
                    <input
                      type="text"
                      className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
                      value={matchTeam2}
                      onChange={(e) => setMatchTeam2(e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Scheduled Timing Date</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-black border-2 border-white/20 text-white rounded-none p-3 text-xs focus:outline-none focus:border-[#C6FF00]"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={seriesList.length === 0}
                  className={`w-full font-black py-3 rounded-none text-xs uppercase border-2 transition font-mono cursor-pointer ${
                    seriesList.length === 0 
                      ? 'bg-zinc-800 text-zinc-650 border-white/5 cursor-not-allowed' 
                      : 'bg-[#C6FF00] hover:bg-[#a3d400] text-black border-white'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                  Publish Match (Ready for Entry)
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: CUSTOMIZE POINTS ENGINE */}
        {activeTab === 'rules' && (
          <div className="space-y-6 animate-none">
            <div className="bg-zinc-900 border border-white/10 p-5 rounded-none">
              <h4 className="text-xs font-black uppercase text-[#C6FF00] tracking-widest mb-3 flex items-center gap-2 font-mono">
                <Settings className="w-4.5 h-4.5 text-[#C6FF00]" />
                Points Engine Config Settings
              </h4>
              <p className="text-[11px] text-zinc-400 uppercase font-mono max-w-2xl leading-normal mb-6">
                Alter the values assigned to specific feats (runs, boundaries, wickets). Setting custom coefficients changes how active squads allocate points live.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localRules.map((rule, idx) => (
                  <div key={rule.id} className="bg-black border border-white/10 p-4 rounded-none flex items-center justify-between font-mono">
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-wider text-[#C6FF00]">
                        {rule.category}
                      </div>
                      <div className="text-xs font-extrabold text-white mt-1 uppercase">
                        {rule.name}
                      </div>
                      <div className="text-[9px] text-zinc-500 max-w-[140px] truncate uppercase mt-0.5">
                        {rule.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-16 bg-zinc-900 border-2 border-white/20 focus:border-[#C6FF00] text-white rounded-none p-1.5 text-center text-xs font-bold"
                        value={rule.points}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const updated = [...localRules];
                          updated[idx].points = val;
                          setLocalRules(updated);
                        }}
                      />
                      <span className="text-[10px] text-zinc-400">pts</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    onUpdateRules(localRules);
                    alert('Official Rules updated on the server! Active squads will now calculate against these rules.');
                  }}
                  className="bg-[#C6FF00] hover:bg-[#a3d400] text-black font-black px-6 py-3 text-xs uppercase border-2 border-white font-mono cursor-pointer"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  Save Customized Points Engine Rules
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
