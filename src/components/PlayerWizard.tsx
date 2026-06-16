import React, { useState } from 'react';
import { Match, SportsPlayer } from '../types';
import { 
  Users, 
  User, 
  CheckCircle,
  Info
} from 'lucide-react';

interface PlayerWizardProps {
  matches: Match[];
  onDraftSquadSubmit: (draftData: {
    matchId: string;
    userId: string;
    userName: string;
    playerIds: string[];
    captainId: string;
    viceCaptainId: string;
    totalCreditsUsed: number;
  }) => void;
}

export default function PlayerWizard({ matches, onDraftSquadSubmit }: PlayerWizardProps) {
  // Active selected match
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(matches[0] || null);

  // User details
  const [userName, setUserName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isJoinCodeVerified, setIsJoinCodeVerified] = useState(false);

  // Drafting items
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [captainId, setCaptainId] = useState<string>('');
  const [viceCaptainId, setViceCaptainId] = useState<string>('');

  // Search/Filter for player pool
  const [roleFilter, setRoleFilter] = useState<'All' | 'Wicketkeeper' | 'Batsman' | 'All-rounder' | 'Bowler'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Verify Invite Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.trim() === '') {
      alert('Kindly provide a league join hash code.');
      return;
    }
    setIsJoinCodeVerified(true);
    alert(`Invite Code ${joinCode.toUpperCase()} Verified! Welcome to the League drafting lounge.`);
  };

  // Draft limit checking variables
  const currentSelections = selectedMatch?.players.filter(p => selectedPlayerIds.includes(p.id)) || [];
  const currentCreditsUsed = currentSelections.reduce((sum, p) => sum + p.credits, 0);
  const remainingCredits = 100 - currentCreditsUsed;

  const countRole = (role: string) => currentSelections.filter(p => p.role === role).length;
  
  const wkCount = countRole('Wicketkeeper');
  const batCount = countRole('Batsman');
  const arCount = countRole('All-rounder');
  const bowlCount = countRole('Bowler');

  const isWKValid = wkCount >= 1 && wkCount <= 2;
  const isBatValid = batCount >= 3 && batCount <= 5;
  const isARValid = arCount >= 1 && arCount <= 3;
  const isBowlValid = bowlCount >= 3 && bowlCount <= 5;

  const isRosterLengthValid = selectedPlayerIds.length === 11;
  const isCreditValid = currentCreditsUsed <= 100;
  const isCaptainValid = captainId !== '' && selectedPlayerIds.includes(captainId);
  const isViceCaptainValid = viceCaptainId !== '' && selectedPlayerIds.includes(viceCaptainId) && viceCaptainId !== captainId;

  const isDraftValid = isWKValid && isBatValid && isARValid && isBowlValid && isRosterLengthValid && isCreditValid && isCaptainValid && isViceCaptainValid && userName !== '';

  const togglePlayerSelect = (p: SportsPlayer) => {
    if (selectedPlayerIds.includes(p.id)) {
      // De-select
      setSelectedPlayerIds(prev => prev.filter(id => id !== p.id));
      if (captainId === p.id) setCaptainId('');
      if (viceCaptainId === p.id) setViceCaptainId('');
    } else {
      // Select
      if (selectedPlayerIds.length >= 11) {
        alert('You have filled the 11 player draft maximum.');
        return;
      }
      setSelectedPlayerIds(prev => [...prev, p.id]);
    }
  };

  // Safe handler to set Captain & Vice Captain
  const appointLeader = (pId: string, role: 'C' | 'VC') => {
    if (!selectedPlayerIds.includes(pId)) {
      alert('You can only assign captains from drafted players.');
      return;
    }
    if (role === 'C') {
      if (pId === viceCaptainId) setViceCaptainId('');
      setCaptainId(pId);
    } else {
      if (pId === captainId) {
        alert('Captain cannot be selected as Vice-Captain.');
        return;
      }
      setViceCaptainId(pId);
    }
  };

  const handleDraftSquadSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    if (!isDraftValid) {
      alert('Kindly verify selection criteria (11 players, captain assignments, credits limit) before submitting.');
      return;
    }

    onDraftSquadSubmit({
      matchId: selectedMatch.id,
      userId: `p_${userName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
      userName,
      playerIds: selectedPlayerIds,
      captainId,
      viceCaptainId,
      totalCreditsUsed: currentCreditsUsed
    });

    // Reset layout fields
    setSelectedPlayerIds([]);
    setCaptainId('');
    setViceCaptainId('');
    alert(`Roster submitted successfully! You are locked in for ${selectedMatch.title}. Track standings live inside the dashboards.`);
  };

  const filteredPlayers = selectedMatch?.players.filter(p => {
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.team.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  }) || [];

  return (
    <div className="bg-zinc-950 border-4 border-white/20 rounded-none overflow-hidden shadow-[8px_8px_0px_rgba(198,255,0,0.15)]" id="player_wizard_root">
      
      {/* Lobby Welcome Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 md:p-8 bg-zinc-900 border-b-4 border-white/20 relative">
        <div className="absolute top-2 right-4 text-[9px] font-mono font-black text-[#C6FF00] tracking-widest uppercase">
          COMMISSIONER DRAFT LOUNGE
        </div>
        
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C6FF00]/10 border border-[#C6FF00]/30 text-[#C6FF00] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-[#C6FF00]" />
            LEAGUE DRAFT ROSTER ACTIVE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-sans tracking-tighter uppercase italic text-white mt-3 leading-none">
            FRIEND DRAFT <span className="text-[#C6FF00]">LOUNGE</span>
          </h2>
          <p className="text-zinc-400 text-xs mt-2 font-mono uppercase tracking-wide">
            Enter join code, monitor ratios, allot 100-credits wage, and select Captain (2x points) &amp; Vice-Captain (1.5x points).
          </p>
        </div>

        {/* Invite Verification Input */}
        <div className="lg:col-span-5 bg-black border-2 border-white/20 p-5 flex flex-col justify-center gap-3 relative">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C6FF00] font-mono">
            Direct League Invite Access Key
          </h4>
          <form onSubmit={handleVerifyCode} className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              className="flex-1 bg-zinc-900 border-2 border-white/20 text-white rounded-none px-3 py-2 text-xs focus:outline-none focus:border-[#C6FF00] uppercase font-mono tracking-wider placeholder-zinc-650"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#C6FF00] hover:bg-[#a3d400] text-black border-2 border-white font-mono font-black px-4 py-2 text-xs uppercase cursor-pointer"
            >
              Verify
            </button>
          </form>
          {isJoinCodeVerified && (
            <div className="text-[10px] text-[#C6FF00] font-mono font-bold uppercase flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Room verified. Ready to register.
            </div>
          )}
        </div>
      </div>

      {/* Main Drafting Section */}
      <div className="p-4 sm:p-6 md:p-8">
        <form onSubmit={handleDraftSquadSubmitForm} className="space-y-6">
          
          {/* Active target match selector & User Custom name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 border border-white/10 p-5 rounded-none">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#C6FF00] font-mono mb-2">
                A. Select Match Room
              </label>
              <select
                className="w-full bg-black border-2 border-white/20 text-white focus:border-[#C6FF00] rounded-none p-3 text-xs font-mono uppercase cursor-pointer focus:outline-none"
                value={selectedMatch?.id || ''}
                onChange={(e) => {
                  const found = matches.find(m => m.id === e.target.value);
                  if (found) {
                    setSelectedMatch(found);
                    setSelectedPlayerIds([]);
                    setCaptainId('');
                    setViceCaptainId('');
                  }
                }}
              >
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title.toUpperCase()} ({m.team1} VS {m.team2})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#C6FF00] font-mono mb-2">
                B. Friend Roster Nickname / Squad Owner Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="E.G. ALEX MERCER"
                  className="w-full bg-black border-2 border-white/20 focus:border-[#C6FF00] rounded-none pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono uppercase tracking-wider"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Core Squad limits, remaining credits badges */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {/* Players count badge */}
            <div className="bg-black border-2 border-white/20 rounded-none p-3 text-center flex flex-col justify-center">
              <div className="text-[9px] uppercase font-mono tracking-widest text-zinc-550 text-zinc-400 font-bold">Selected Players</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{selectedPlayerIds.length}/11</div>
            </div>

            {/* Budget tracker */}
            <div className={`border-2 rounded-none p-3 text-center flex flex-col justify-center ${
              remainingCredits >= 0 ? 'bg-black border-[#C6FF00] text-white' : 'bg-red-950 border-red-500 text-red-200'
            }`}>
              <div className="text-[9px] uppercase font-mono tracking-widest font-bold text-[#C6FF00]">
                Remaining Salary
              </div>
              <div className="text-2xl font-black font-mono mt-1">
                {remainingCredits.toFixed(1)} / 100.0
              </div>
            </div>

            {/* Captain validation states */}
            <div className={`border-2 rounded-none p-3 text-center flex flex-col justify-center ${
              selectedPlayerIds.includes(captainId) ? 'bg-[#C6FF00]/10 border-[#C6FF00]' : 'border-white/10 text-zinc-600'
            }`}>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 block font-bold">Captain Assigned</span>
              <span className="text-xs font-black font-mono mt-1.5 uppercase text-white">
                {selectedPlayerIds.includes(captainId) ? '✓ CONFIGURED' : 'PENDING'}
              </span>
            </div>

            {/* Vice Captain states */}
            <div className={`border-2 rounded-none p-3 text-center flex flex-col justify-center ${
              selectedPlayerIds.includes(viceCaptainId) ? 'bg-[#C6FF00]/10 border-[#C6FF00]' : 'border-white/10 text-zinc-650'
            }`}>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 block font-bold">V-Captain Assigned</span>
              <span className="text-xs font-black font-mono mt-1.5 uppercase text-white">
                {selectedPlayerIds.includes(viceCaptainId) ? '✓ CONFIGURED' : 'PENDING'}
              </span>
            </div>

            {/* Quick Helper */}
            <div className="bg-zinc-900 border border-white/5 rounded-none p-3 col-span-2 flex items-center justify-center p-3 text-center text-[10px] text-zinc-400 font-mono uppercase tracking-tight">
              <Info className="w-5 h-5 text-[#C6FF00] mr-2 shrink-0 hidden sm:block" />
              Satisfy wicketkeeper, batsmen, bowler &amp; all-rounder requirements.
            </div>
          </div>

          {/* Ratios requirements list */}
          <div className="bg-zinc-900 border border-white/10 p-5 rounded-none">
            <h5 className="text-[10px] uppercase font-bold tracking-widest text-[#C6FF00] mb-3.5 font-mono">
              ★ ACTIVE TOURNAMENT RATIOS CHECKPOINT:
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              <div className={`px-4 py-3 rounded-none border font-mono flex justify-between items-center ${isWKValid ? 'bg-black border-[#C6FF00] text-[#C6FF00]' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
                <span>WICKETKEEPER (1-2):</span>
                <span className="font-black text-white text-xs">{wkCount}</span>
              </div>
              <div className={`px-4 py-3 rounded-none border font-mono flex justify-between items-center ${isBatValid ? 'bg-black border-[#C6FF00] text-[#C6FF00]' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
                <span>BATSMEN (3-5):</span>
                <span className="font-black text-white text-xs">{batCount}</span>
              </div>
              <div className={`px-4 py-3 rounded-none border font-mono flex justify-between items-center ${isARValid ? 'bg-black border-[#C6FF00] text-[#C6FF00]' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
                <span>ALL-ROUNDERS (1-3):</span>
                <span className="font-black text-white text-xs">{arCount}</span>
              </div>
              <div className={`px-4 py-3 rounded-none border font-mono flex justify-between items-center ${isBowlValid ? 'bg-black border-[#C6FF00] text-[#C6FF00]' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
                <span>BOWLERS (3-5):</span>
                <span className="font-black text-white text-xs">{bowlCount}</span>
              </div>
            </div>
          </div>

          {/* Draft Selection Interface Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Player Pool Selection */}
            <div className="lg:col-span-7 bg-zinc-900 border border-white/10 rounded-none p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#C6FF00] font-mono">
                  Sport Stars pool roster ({filteredPlayers.length})
                </h4>
                
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="SEARCH STAR NAME..."
                  className="bg-black border-2 border-white/20 px-3 py-1.5 rounded-none text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#C6FF00] font-mono uppercase tracking-wider"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role Filter tabs */}
              <div className="flex flex-wrap gap-1 bg-black p-1 rounded-none border border-white/10">
                {(['All', 'Wicketkeeper', 'Batsman', 'All-rounder', 'Bowler'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`flex-1 text-center py-2 text-[10px] uppercase font-black font-mono transition cursor-pointer ${
                      roleFilter === role
                        ? 'bg-[#C6FF00] text-black shadow-xs font-black'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {role === 'All' ? 'ALL' : role.slice(0, 4).toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Pool Grid List */}
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {filteredPlayers.map((p) => {
                  const isSelected = selectedPlayerIds.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => togglePlayerSelect(p)}
                      className={`p-3.5 border flex items-center justify-between cursor-pointer transition ${
                        isSelected 
                          ? 'bg-[#C6FF00]/10 border-[#C6FF00]' 
                          : 'bg-black border-white/10 hover:border-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-none flex items-center justify-center font-black font-mono text-[11px] ${
                          p.team === 'IND' ? 'bg-[#C6FF00] text-black' : 'bg-zinc-800 text-white'
                        }`}>
                          {p.team}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-white uppercase">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-2 mt-0.5 uppercase tracking-tighter">
                            <span>{p.role}</span>
                            <span className="w-1 h-1 bg-[#C6FF00]"></span>
                            <span>Credits: {p.credits}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="bg-[#C6FF00] text-black text-[10px] font-black px-3 py-1.5 uppercase font-mono">
                            Selected
                          </div>
                        ) : (
                          <div className="border border-white/20 text-[#C6FF00] hover:bg-white hover:text-black text-[10px] font-bold px-3 py-1.5 uppercase font-mono">
                            Add Roster +
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Squad List, C/VC Assignments */}
            <div className="lg:col-span-5 bg-zinc-900 border border-white/10 rounded-none p-5 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white border-b border-white/10 pb-3 font-mono">
                  My Custom Lineup Drafted ({selectedPlayerIds.length}/11)
                </h4>

                <div className="space-y-2 mt-4 max-h-[350px] overflow-y-auto">
                  {currentSelections.map((p) => (
                    <div key={p.id} className="p-3 bg-black border border-white/10 rounded-none flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-white uppercase tracking-tight">{p.name} <span className="font-mono text-[9px] text-[#C6FF00]">({p.team})</span></div>
                        <div className="text-[10px] text-zinc-405 text-zinc-450 text-zinc-400 font-mono uppercase">{p.role.toUpperCase()} • {p.credits} CR</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => appointLeader(p.id, 'C')}
                          className={`w-8 h-8 rounded-none font-black text-[11px] flex items-center justify-center border transition font-mono cursor-pointer ${
                            captainId === p.id 
                              ? 'bg-[#C6FF00] border-[#C6FF00] text-black font-black'
                              : 'bg-black border-white/20 text-white hover:border-[#C6FF00]'
                          }`}
                          title="Assign Captain (2x multiplier)"
                        >
                          C
                        </button>
                        <button
                          type="button"
                          onClick={() => appointLeader(p.id, 'VC')}
                          className={`w-8 h-8 rounded-none font-black text-[11px] flex items-center justify-center border transition font-mono cursor-pointer ${
                            viceCaptainId === p.id 
                              ? 'bg-[#C6FF00] border-[#C6FF00] text-black font-black'
                              : 'bg-black border-white/20 text-white hover:border-[#C6FF00]'
                          }`}
                          title="Assign Vice Captain (1.5x multiplier)"
                        >
                          VC
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePlayerSelect(p)}
                          className="text-red-500 hover:text-white uppercase font-black transition text-[9px] font-mono px-1 py-1"
                        >
                          DROP
                        </button>
                      </div>
                    </div>
                  ))}

                  {currentSelections.length === 0 && (
                    <div className="p-10 text-center text-zinc-500 font-mono text-xs border border-dashed border-white/10 uppercase tracking-widest">
                      CONF_TEAM: SELECT EXACTLY ELEVEN MATCH PLAYERS FROM POOL LISTS
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Final Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="submit"
                  disabled={!isDraftValid}
                  className={`w-full font-black font-mono py-4 px-4 uppercase border-2 text-xs transition tracking-widest cursor-pointer ${
                    isDraftValid 
                      ? 'bg-[#C6FF00] hover:bg-[#a3d400] text-black border-white font-black' 
                      : 'bg-zinc-800 text-zinc-500 border-white/5 cursor-not-allowed'
                  }`}
                >
                  Confirm &amp; Register Fantasy Squad
                </button>
                {!isDraftValid && (
                  <p className="text-[10px] text-center text-red-400 font-mono mt-3 uppercase tracking-tight">
                    Must fill nickname, pick exactly 11 players within budget, satisfying role limits, and assign C &amp; VC multipliers.
                  </p>
                )}
              </div>
            </div>

          </div>

        </form>
      </div>

    </div>
  );
}
