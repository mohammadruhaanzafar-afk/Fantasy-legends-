import React, { useState } from 'react';
import { Match, Series, FantasySquad } from '../types';
import { 
  Trophy, 
  User, 
  Medal, 
  ListFilter
} from 'lucide-react';

interface LeaderboardsProps {
  seriesList: Series[];
  matchesList: Match[];
  squadsList: FantasySquad[];
}

export default function Leaderboards({ seriesList, matchesList, squadsList }: LeaderboardsProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(seriesList[0]?.id || '');
  const [selectedMatchId, setSelectedMatchId] = useState<string>(matchesList[0]?.id || '');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'match' | 'series'>('series');

  // Filter matches belonging to the active selected series
  const activeSeriesMatches = matchesList.filter(m => m.seriesId === selectedSeriesId);

  // Match leaderboards logic:
  const activeMatchSquads = squadsList
    .filter(s => s.matchId === selectedMatchId)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  // Series aggregate points calculation:
  const calculateSeriesAggregations = () => {
    const userMap: Record<string, { userId: string; userName: string; totalPoints: number; matchesDraftedCount: number }> = {};
    
    // Find all matches belonging to the active series
    const seriesMatchIds = activeSeriesMatches.map(m => m.id);

    squadsList.forEach((sq) => {
      // If the squad's match belongs to the current series
      if (seriesMatchIds.includes(sq.matchId)) {
        if (!userMap[sq.userId]) {
          userMap[sq.userId] = {
            userId: sq.userId,
            userName: sq.userName,
            totalPoints: 0,
            matchesDraftedCount: 0
          };
        }
        userMap[sq.userId].totalPoints += sq.totalPoints;
        userMap[sq.userId].matchesDraftedCount += 1;
      }
    });

    return Object.values(userMap).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const seriesLeaders = calculateSeriesAggregations();
  const topGoldLeader = seriesLeaders[0];

  return (
    <div className="bg-zinc-950 border-4 border-white/20 rounded-none overflow-hidden shadow-[8px_8px_0px_rgba(198,255,0,0.15)]" id="leaderboards_root">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-zinc-900 border-b-4 border-[#C6FF00] relative">
        <div className="absolute top-2 right-4 text-[9px] font-mono font-black text-[#C6FF00] tracking-widest uppercase">
          LIVE STANDINGS //
        </div>
        <div className="flex items-center gap-1.5 text-[#C6FF00] font-mono text-[10px] uppercase tracking-wider mb-2">
          <Trophy className="w-4 h-4 text-[#C6FF00] animate-pulse" />
          FANTASY STANDINGS TABLE
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black font-sans tracking-tight uppercase italic text-white leading-none">
              LEADERBOARDS &amp; <span className="text-[#C6FF00]">STANDINGS</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-2 uppercase tracking-wide font-mono">Real-time point evaluation calculations for friendly tournaments.</p>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex gap-2 bg-black p-1 border-2 border-white/10">
            <button
              onClick={() => setActiveLeaderboardTab('series')}
              className={`px-4 py-2 text-xs font-black uppercase transition cursor-pointer ${
                activeLeaderboardTab === 'series'
                  ? 'bg-[#C6FF00] text-black shadow-sm font-black'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Overall Series Standings
            </button>
            <button
              onClick={() => setActiveLeaderboardTab('match')}
              className={`px-4 py-2 text-xs font-black uppercase transition cursor-pointer ${
                activeLeaderboardTab === 'match'
                  ? 'bg-[#C6FF00] text-black shadow-sm font-black'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Individual Match Draft
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* SERIES-WIDE STANDINGS TAB */}
        {activeLeaderboardTab === 'series' && (
          <div className="space-y-6">
            
            {/* Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-white/10 p-4 rounded-none">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-[#C6FF00]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Filter Series:</span>
              </div>
              <select
                className="bg-black border border-white/20 rounded-none p-2 text-xs text-white min-w-[240px] focus:outline-none font-mono"
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
              >
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-950">{s.name}</option>
                ))}
              </select>
            </div>

            {/* Overall Champion visual showcase card */}
            {topGoldLeader && (
              <div className="bg-zinc-900 border-2 border-[#C6FF00] rounded-none p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#C6FF00] text-black font-black font-mono text-[9px] px-3 py-1 uppercase tracking-widest">
                  SERIES LEADER
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#C6FF00] text-black flex items-center justify-center border-2 border-white">
                    <Medal className="w-8 h-8 font-black" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C6FF00] font-mono">Series Current Champion Leaders</span>
                    <h4 className="text-xl sm:text-2xl font-black text-white italic mt-0.5 uppercase tracking-tight">{topGoldLeader.userName}</h4>
                    <p className="text-xs text-zinc-400 mt-1">Leading with <strong className="text-white">{topGoldLeader.totalPoints}</strong> aggregated fantasy points!</p>
                  </div>
                </div>
                <div className="bg-black border-2 border-white/20 text-white px-5 py-2.5 rounded-none text-center shadow-xs">
                  <span className="text-[10px] uppercase font-mono text-[#C6FF00] block">Aggregate Score</span>
                  <span className="text-xl font-black font-sans text-white uppercase">{topGoldLeader.totalPoints} pts</span>
                </div>
              </div>
            )}

            {/* Standings table */}
            <div className="border border-white/10 rounded-none overflow-x-auto bg-black shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900 border-b-2 border-white/25 font-mono text-[#C6FF00] uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Friend Name / Squad Owner</th>
                    <th className="p-4 text-center">Drafts Locked</th>
                    <th className="p-4 text-right">Aggregate Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {seriesLeaders.map((user, idx) => (
                    <tr key={user.userId} className="hover:bg-zinc-900/60 transition-none">
                      <td className="p-4 text-center">
                        <div className={`w-8 h-8 mx-auto flex items-center justify-center font-black font-mono text-xs ${
                          idx === 0 ? 'bg-[#C6FF00] text-black border-2 border-white font-black' :
                          idx === 1 ? 'bg-zinc-300 text-zinc-900 bg-white/80' :
                          idx === 2 ? 'bg-zinc-700 text-zinc-100 bg-white/45' :
                          'bg-zinc-900 text-zinc-405 border border-white/10 text-zinc-400'
                        }`}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-[#C6FF00] flex items-center gap-2 text-sm uppercase">
                          <User className="w-4 h-4 text-white" />
                          {user.userName}
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono font-medium text-white">
                        {user.matchesDraftedCount}
                      </td>
                      <td className="p-4 text-right font-black text-[#C6FF00] text-sm sm:text-base font-sans tracking-tight">
                        {user.totalPoints} pts
                      </td>
                    </tr>
                  ))}

                  {seriesLeaders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-zinc-500 font-mono uppercase tracking-wide">
                        No squads drafted for this tournament series. Head over to Draft Lounge to register your team.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* INDIVIDUAL MATCH LEADERBOARD TAB */}
        {activeLeaderboardTab === 'match' && (
          <div className="space-y-6">
            
            {/* Filter individual match lists */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900 border border-white/10 p-4 rounded-none">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-[#C6FF00]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Filter Match:</span>
              </div>
              <select
                className="bg-black border border-white/20 rounded-none p-2 text-xs text-white min-w-[240px] focus:outline-none font-mono"
                value={selectedMatchId}
                onChange={(e) => setSelectedMatchId(e.target.value)}
              >
                {matchesList.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-950">{m.title}</option>
                ))}
              </select>
            </div>

            {/* Displaying matchup standing results */}
            <div className="border border-white/10 rounded-none overflow-x-auto bg-black shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900 border-b-2 border-white/25 font-mono text-[#C6FF00] uppercase tracking-wider">
                    <th className="p-4 w-16 text-center">Pos</th>
                    <th className="p-4">Competitor</th>
                    <th className="p-4">Key Captain choices</th>
                    <th className="p-4 text-center">Salary Spent</th>
                    <th className="p-4 text-right">Points Scored</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeMatchSquads.map((squad, idx) => (
                    <tr key={squad.id} className="hover:bg-zinc-900/60 transition-none">
                      <td className="p-4 text-center">
                        <div className={`w-8 h-8 mx-auto flex items-center justify-center font-black font-mono text-xs ${
                          idx === 0 ? 'bg-[#C6FF00] text-black border-2 border-white' : 'bg-zinc-900 text-zinc-400 border border-white/10'
                        }`}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-white text-sm uppercase">{squad.userName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Submitted (Date): {new Date(squad.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="bg-[#C6FF00] text-black text-[9px] font-mono px-2 py-0.5 rounded-none font-black tracking-tight uppercase">
                            CAPTAIN: {matchesList.find(m => m.id === selectedMatchId)?.players.find(p => p.id === squad.captainId)?.name || 'N/A'}
                          </span>
                          <span className="bg-zinc-900 border border-white/20 text-[#C6FF00] text-[9px] font-mono px-2 py-0.5 rounded-none font-bold uppercase">
                            V-CAPT: {matchesList.find(m => m.id === selectedMatchId)?.players.find(p => p.id === squad.viceCaptainId)?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-zinc-400">
                        {squad.totalCreditsUsed.toFixed(1)} / 100.0
                      </td>
                      <td className="p-4 text-right font-black text-[#C6FF00] text-sm sm:text-base tracking-tight">
                        {squad.totalPoints} pts
                      </td>
                    </tr>
                  ))}

                  {activeMatchSquads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-zinc-500 font-mono uppercase tracking-wide">
                        No fantasy squads locked in for this specific match yet. Be the first to draft!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
