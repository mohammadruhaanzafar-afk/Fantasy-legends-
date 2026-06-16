export type PlayerRole = 'Wicketkeeper' | 'Batsman' | 'All-rounder' | 'Bowler';

export interface SportsPlayer {
  id: string;
  name: string;
  team: string; // e.g. "IND", "AUS"
  role: PlayerRole;
  credits: number; // e.g., 9.0, 10.5
}

export interface Series {
  id: string;
  name: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: string;
}

export interface Match {
  id: string;
  seriesId: string;
  title: string; // e.g. "IND vs AUS - 1st T20"
  team1: string;
  team1Logo?: string;
  team2: string;
  team2Logo?: string;
  status: 'upcoming' | 'live' | 'completed';
  date: string;
  players: SportsPlayer[]; // Roster of players available for drafting in this match
}

export interface SelectedPlayer extends SportsPlayer {
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface FantasySquad {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  playerIds: string[]; // List of 11 selected player IDs
  captainId: string; // 2x points
  viceCaptainId: string; // 1.5x points
  totalCreditsUsed: number;
  totalPoints: number;
  createdAt: string;
}

export interface PointRule {
  id: string;
  category: 'Batting' | 'Bowling' | 'Fielding' | 'Other';
  name: string;
  points: number;
  description: string;
}

export interface MatchRosterRecord {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  maidens: number;
  runsConceded: number;
  catches: number;
  stumpings: number;
  runOuts: number;
}

export interface MatchResultUpdate {
  matchId: string;
  playerPerformance: Record<string, Partial<MatchRosterRecord>>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'player';
}

// Interactive Doc Guide Types
export interface DocSection {
  title: string;
  icon: string;
  content: string;
  subsections?: {
    title: string;
    content: string;
    codeBlock?: {
      language: string;
      code: string;
    };
  }[];
}
