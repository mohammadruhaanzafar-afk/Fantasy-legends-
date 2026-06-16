import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { SportsPlayer, Match, Series, FantasySquad, PointRule, PointRule as UI_PointRule, MatchRosterRecord } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_FILE_PATH = path.join(process.cwd(), 'data.json');

// --- DEFAULT DB SEED DATA ---
const DEFAULT_PLAYERS: SportsPlayer[] = [
  // India (IND)
  { id: 'ind_vk', name: 'Virat Kohli', team: 'IND', role: 'Batsman', credits: 10.5 },
  { id: 'ind_rs', name: 'Rohit Sharma', team: 'IND', role: 'Batsman', credits: 10.0 },
  { id: 'ind_hp', name: 'Hardik Pandya', team: 'IND', role: 'All-rounder', credits: 9.5 },
  { id: 'ind_rp', name: 'Rishabh Pant', team: 'IND', role: 'Wicketkeeper', credits: 9.0 },
  { id: 'ind_jb', name: 'Jasprit Bumrah', team: 'IND', role: 'Bowler', credits: 10.5 },
  { id: 'ind_rj', name: 'Ravindra Jadeja', team: 'IND', role: 'All-rounder', credits: 9.0 },
  { id: 'ind_ap', name: 'Axar Patel', team: 'IND', role: 'All-rounder', credits: 8.5 },
  { id: 'ind_sk', name: 'Suryakumar Yadav', team: 'IND', role: 'Batsman', credits: 9.5 },
  { id: 'ind_yk', name: 'Yuzvendra Chahal', team: 'IND', role: 'Bowler', credits: 8.0 },
  { id: 'ind_as', name: 'Arshdeep Singh', team: 'IND', role: 'Bowler', credits: 8.5 },
  { id: 'ind_siraj', name: 'Mohammed Siraj', team: 'IND', role: 'Bowler', credits: 8.5 },
  
  // Australia (AUS)
  { id: 'aus_th', name: 'Travis Head', team: 'AUS', role: 'Batsman', credits: 10.0 },
  { id: 'aus_gm', name: 'Glenn Maxwell', team: 'AUS', role: 'All-rounder', credits: 9.5 },
  { id: 'aus_pc', name: 'Pat Cummins', team: 'AUS', role: 'Bowler', credits: 9.5 },
  { id: 'aus_ms', name: 'Mitchell Starc', team: 'AUS', role: 'Bowler', credits: 9.5 },
  { id: 'aus_az', name: 'Adam Zampa', team: 'AUS', role: 'Bowler', credits: 9.0 },
  { id: 'aus_mm', name: 'Mitchell Marsh', team: 'AUS', role: 'All-rounder', credits: 9.0 },
  { id: 'aus_ms2', name: 'Marcus Stoinis', team: 'AUS', role: 'All-rounder', credits: 9.0 },
  { id: 'aus_mw', name: 'Matthew Wade', team: 'AUS', role: 'Wicketkeeper', credits: 8.0 },
  { id: 'aus_js', name: 'Josh Inglis', team: 'AUS', role: 'Wicketkeeper', credits: 8.5 },
  { id: 'aus_ss', name: 'Steve Smith', team: 'AUS', role: 'Batsman', credits: 9.0 },
  { id: 'aus_jh', name: 'Josh Hazlewood', team: 'AUS', role: 'Bowler', credits: 9.0 }
];

const DEFAULT_SERIES: Series[] = [
  {
    id: 's1',
    name: 'Border-Gavaskar T20 Cup 2026',
    description: 'Bilateral championship containing custom fantasy leagues for mates.',
    status: 'ongoing',
    startDate: '2026-06-15'
  },
  {
    id: 's2',
    name: 'Ashes Premium Fantasy 2026',
    description: 'Friendly rivalries over the ultimate Test battleground.',
    status: 'upcoming',
    startDate: '2026-07-20'
  }
];

const DEFAULT_MATCHES: Match[] = [
  {
    id: 'm1',
    seriesId: 's1',
    title: 'IND vs AUS - T20 High-Octane Clash',
    team1: 'IND',
    team2: 'AUS',
    status: 'upcoming',
    date: '2026-06-18T19:00:00Z',
    players: DEFAULT_PLAYERS
  },
  {
    id: 'm2',
    seriesId: 's1',
    title: 'IND vs AUS - 2nd T20 Battle',
    team1: 'IND',
    team2: 'AUS',
    status: 'upcoming',
    date: '2026-06-21T19:00:00Z',
    players: DEFAULT_PLAYERS
  }
];

const DEFAULT_RULES: PointRule[] = [
  { id: 'r1', category: 'Batting', name: 'Run', points: 1, description: 'Each run scored' },
  { id: 'r2', category: 'Batting', name: 'Four Bonus', points: 1, description: 'Bonus for hitting a boundary' },
  { id: 'r3', category: 'Batting', name: 'Six Bonus', points: 2, description: 'Bonus for hitting a six' },
  { id: 'r4', category: 'Batting', name: 'Half-Century Bonus', points: 8, description: 'Bonus for 50 runs scored' },
  { id: 'r5', category: 'Batting', name: 'Century Bonus', points: 16, description: 'Bonus for 100 runs scored' },
  { id: 'r6', category: 'Bowling', name: 'Wicket', points: 25, description: 'Excluding run-outs' },
  { id: 'r7', category: 'Bowling', name: 'Maiden Bowled', points: 8, description: 'Each maiden over bowled' },
  { id: 'r8', category: 'Bowling', name: '3-Wicket Haul Bonus', points: 4, description: 'Bonus for taking 3 wickets' },
  { id: 'r9', category: 'Fielding', name: 'Catch', points: 8, description: 'Outfielder catch' },
  { id: 'r10', category: 'Fielding', name: 'Stumping', points: 12, description: 'Wicketkeeper stumping' },
  { id: 'r11', category: 'Fielding', name: 'Run Out Player', points: 12, description: 'Fielder runout action' }
];

const DEFAULT_SQUADS: FantasySquad[] = [
  {
    id: 'squad_john',
    matchId: 'm1',
    userId: 'user_john',
    userName: 'John (Captain)',
    playerIds: [
      'ind_vk', 'ind_rs', 'ind_rp', 'ind_jb', 'ind_rj',
      'aus_th', 'aus_gm', 'aus_pc', 'aus_ms', 'aus_az', 'ind_hp'
    ],
    captainId: 'ind_vk',
    viceCaptainId: 'ind_jb',
    totalCreditsUsed: 98.5,
    totalPoints: 145.5,
    createdAt: '2026-06-15T12:00:00Z'
  },
  {
    id: 'squad_emma',
    matchId: 'm1',
    userId: 'user_emma',
    userName: 'Emma (Pro)',
    playerIds: [
      'ind_vk', 'ind_sk', 'ind_rp', 'ind_jb', 'ind_rj',
      'aus_th', 'aus_gm', 'aus_jh', 'aus_pc', 'aus_az', 'aus_mm'
    ],
    captainId: 'aus_th',
    viceCaptainId: 'aus_gm',
    totalCreditsUsed: 99.0,
    totalPoints: 120.0,
    createdAt: '2026-06-15T14:30:00Z'
  }
];

interface ApplicationState {
  series: Series[];
  matches: Match[];
  rules: PointRule[];
  squads: FantasySquad[];
}

function getInitialState(): ApplicationState {
  return {
    series: DEFAULT_SERIES,
    matches: DEFAULT_MATCHES,
    rules: DEFAULT_RULES,
    squads: DEFAULT_SQUADS,
  };
}

// Ensure the local storage directory / file exists and is populated
function loadState(): ApplicationState {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading JSON state file, resetting to seedlings:', error);
  }
  const defaults = getInitialState();
  saveState(defaults);
  return defaults;
}

function saveState(state: ApplicationState) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write data file State:', error);
  }
}

// --- API IMPLEMENTATIONS ---

// 1. Fetch entire synced state
app.get('/api/state', (req, res) => {
  const currentState = loadState();
  res.json(currentState);
});

// 2. Reset back to master defaults
app.post('/api/reset', (req, res) => {
  const defaults = getInitialState();
  saveState(defaults);
  res.json({ message: 'State successfully reset to clean sports seeds!', state: defaults });
});

// 3. Create Series (Admin Only simulation)
app.post('/api/series', (req, res) => {
  const { name, description, startDate } = req.body;
  if (!name || !startDate) {
    return res.status(400).json({ error: 'Name and StartDate are mandatory to setup a Series.' });
  }
  const state = loadState();
  const newSeries: Series = {
    id: `s_${Date.now()}`,
    name,
    description: description || '',
    status: 'upcoming',
    startDate
  };
  state.series.push(newSeries);
  saveState(state);
  res.json({ message: 'Series created successfully!', series: newSeries });
});

// 4. Create Custom Match (Admin Only)
app.post('/api/matches', (req, res) => {
  const { seriesId, title, team1, team2, date, players } = req.body;
  if (!seriesId || !title || !team1 || !team2 || !date) {
    return res.status(400).json({ error: 'Missing mandatory fields to setup a match.' });
  }
  const state = loadState();
  const validPlayers = players && players.length > 0 ? players : DEFAULT_PLAYERS;
  
  const newMatch: Match = {
    id: `m_${Date.now()}`,
    seriesId,
    title,
    team1,
    team2,
    status: 'upcoming',
    date,
    players: validPlayers
  };
  state.matches.push(newMatch);
  saveState(state);
  res.json({ message: 'Match configured successfully!', match: newMatch });
});

// 5. Submit Draft Draft (Player Action)
app.post('/api/draft', (req, res) => {
  const { matchId, userId, userName, playerIds, captainId, viceCaptainId, totalCreditsUsed } = req.body;
  
  if (!matchId || !userId || !userName || !playerIds || playerIds.length !== 11 || !captainId || !viceCaptainId) {
    return res.status(400).json({ error: 'A valid draft must contain exactly 11 players, with captain and vice-captain assigned.' });
  }

  const state = loadState();
  const matchObj = state.matches.find(m => m.id === matchId);
  if (!matchObj) {
    return res.status(404).json({ error: 'Target match specified in squad selection not found.' });
  }

  // Remove previous draft if exists for user-match combo to avoid duplicate rosters
  state.squads = state.squads.filter(s => !(s.userId === userId && s.matchId === matchId));

  const newSquad: FantasySquad = {
    id: `squad_${userId}_${matchId}_${Date.now()}`,
    matchId,
    userId,
    userName,
    playerIds,
    captainId,
    viceCaptainId,
    totalCreditsUsed,
    totalPoints: 0, // Initial standard score is zero, will update when scores compiled
    createdAt: new Date().toISOString()
  };

  state.squads.push(newSquad);
  saveState(state);
  res.json({ message: 'Fantasy Squad successfully drafted and signed!', squad: newSquad });
});

// 6. Manual Score submit + Recalculate Scoring Engine (Admin Scorer)
app.post('/api/score', (req, res) => {
  const { matchId, playerPerformance } = req.body as { matchId: string; playerPerformance: Record<string, Partial<MatchRosterRecord>> };
  if (!matchId || !playerPerformance) {
    return res.status(400).json({ error: 'Specify match ID and performance matrix.' });
  }

  const state = loadState();
  const matchObj = state.matches.find(m => m.id === matchId);
  if (!matchObj) {
    return res.status(404).json({ error: 'Target match not found.' });
  }

  // Change match status to completed
  matchObj.status = 'completed';

  // Calculate dynamic fantasy points scored by each individual player based on rules configured
  const rules = state.rules;
  const playerPointsMap: Record<string, number> = {};

  // For every player in this match, calculate their raw base fantasy points
  matchObj.players.forEach((p) => {
    const stats = playerPerformance[p.id] || {
      runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, maidens: 0, runsConceded: 0, catches: 0, stumpings: 0, runOuts: 0
    };

    let pPoints = 0;
    
    // Runs points
    const runs = stats.runs || 0;
    const battingRunRule = rules.find(r => r.name === 'Run')?.points ?? 1;
    pPoints += runs * battingRunRule;

    // Fours and Sixes
    const fours = stats.fours || 0;
    const fourRule = rules.find(r => r.name === 'Four Bonus')?.points ?? 1;
    pPoints += fours * fourRule;

    const sixes = stats.sixes || 0;
    const sixRule = rules.find(r => r.name === 'Six Bonus')?.points ?? 2;
    pPoints += sixes * sixRule;

    // High score bonuses
    if (runs >= 100) {
      pPoints += rules.find(r => r.name === 'Century Bonus')?.points ?? 16;
    } else if (runs >= 50) {
      pPoints += rules.find(r => r.name === 'Half-Century Bonus')?.points ?? 8;
    }

    // Wickets
    const wickets = stats.wickets || 0;
    const wicketRule = rules.find(r => r.name === 'Wicket')?.points ?? 25;
    pPoints += wickets * wicketRule;

    if (wickets >= 3) {
      pPoints += rules.find(r => r.name === '3-Wicket Haul Bonus')?.points ?? 4;
    }

    // Maidens
    const maidens = stats.maidens || 0;
    const maidenRule = rules.find(r => r.name === 'Maiden Bowled')?.points ?? 8;
    pPoints += maidens * maidenRule;

    // Fielding
    const catches = stats.catches || 0;
    const catchRule = rules.find(r => r.name === 'Catch')?.points ?? 8;
    pPoints += catches * catchRule;

    const stumpings = stats.stumpings || 0;
    const stumpingRule = rules.find(r => r.name === 'Stumping')?.points ?? 12;
    pPoints += stumpings * stumpingRule;

    const runOuts = stats.runOuts || 0;
    const runOutRule = rules.find(r => r.name === 'Run Out Player')?.points ?? 12;
    pPoints += runOuts * runOutRule;

    playerPointsMap[p.id] = pPoints;
  });

  // Calculate compiled squads points reflectingCaptain roles (2x Captain, 1.5x Vice Captain)
  state.squads = state.squads.map((sq) => {
    if (sq.matchId !== matchId) return sq;

    let totalPoints = 0;
    sq.playerIds.forEach((pId) => {
      let basePoints = playerPointsMap[pId] || 0;
      
      if (pId === sq.captainId) {
        totalPoints += basePoints * 2.0;
      } else if (pId === sq.viceCaptainId) {
        totalPoints += basePoints * 1.5;
      } else {
        totalPoints += basePoints;
      }
    });

    return {
      ...sq,
      totalPoints: parseFloat(totalPoints.toFixed(2))
    };
  });

  saveState(state);
  res.json({
    message: 'Standings successfully computed & fantasy draft tables calculated!',
    playerPointsMap,
    squads: state.squads.filter(s => s.matchId === matchId)
  });
});

// 7. Update Point Rules (Admin dashboard configurations)
app.post('/api/rules', (req, res) => {
  const { updatedRules } = req.body as { updatedRules: PointRule[] };
  if (!updatedRules || !Array.isArray(updatedRules)) {
    return res.status(400).json({ error: 'Valid rules list update payload required.' });
  }
  const state = loadState();
  state.rules = updatedRules;
  saveState(state);
  res.json({ message: 'Scoring Rules updated successfully!', rules: state.rules });
});

// --- VITE DEV / PRODUCTION INTEGRATION MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
