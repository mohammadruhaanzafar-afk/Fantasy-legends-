import { DocSection } from './types';

export const guideSections: DocSection[] = [
  {
    title: "1. System Architecture",
    icon: "Network",
    content: "A detailed breakdown of the private fantasy sports app, engineered to minimize hosting bills (targeting $0/month) while offering a premium real-time mobile experience for friends.",
    subsections: [
      {
        title: "The Architecture Blueprint",
        content: "A full-stack decoupling utilizing a React Native / Expo mobile interface for native feel, supported by an Express/Node.js API proxying Firebase Firestore. For private groups, this eliminates server state-management overhead completely.",
        codeBlock: {
          language: "ascii",
          code: `
+--------------------------------------------------------+
|                   CLIENT-SIDE APPS                     |
|  React Native (iOS & Android via Expo) or Responsive Web|
|  - Renders Lineup Wizards                              |
|  - Resolves Credit Checking & C/VC Assignments         |
|  - Handles Instant Join URL Links                      |
+--------------------------------------------------------+
                           │ (HTTPS / WebSockets)
                           ▼
+--------------------------------------------------------+
|                SERVERLESS API MIDDLEWARE               |
|      Express.js on Google Cloud Run (Autoscales to Red) |
|  - Encapsulates Scoring Calculation Engine             |
|  - Guards Admin Dashboard Actions                      |
|  - Performs Atomic Transactions for Join Codes        |
+--------------------------------------------------------+
                           │ (Cloud Native SDK)
                           ▼
+--------------------------------------------------------+
|                 PERSISTENCE DATA STORE                 |
|       Google Cloud Firestore (NoSQL, Real-time)        |
|  - Collections: Users, Matches, PlayerStats, Squads    |
|  - Near Zero cost under 50,000 reads/day (Always Free)  |
|  - Auto-streams live scores & ranks to Active Clients  |
+--------------------------------------------------------+
`
        }
      },
      {
        title: "Role Boundaries",
        content: "The system models two highly isolated security lanes: Admin and Player interfaces. The Admin UI is protected via server-verified role flags on user tokens, guaranteeing players cannot overwrite team points or alter credit values."
      }
    ]
  },
  {
    title: "2. Database Schema",
    icon: "Database",
    content: "The database structures needed to support Series-wide aggregation, team constraints, and multi-game points tracking. We provide standard relational SQL models (PostgreSQL) alongside the optimized NoSQL (Firestore) mapping.",
    subsections: [
      {
        title: "Relational SQL (PostgreSQL / Cloud SQL) DDL",
        content: "For a relational system, this clean layout handles constraint validations (like credits and player count) at the schema level.",
        codeBlock: {
          language: "sql",
          code: `-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(15) DEFAULT 'player' CHECK (role IN ('admin', 'player')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Series / Tournaments
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  start_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  team1 VARCHAR(50) NOT NULL,
  team2 VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  match_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master Players Pool
CREATE TABLE sports_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  team VARCHAR(10) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Wicketkeeper', 'Batsman', 'All-rounder', 'Bowler')),
  credits NUMERIC(4,1) NOT NULL DEFAULT 9.0 CHECK (credits BETWEEN 5.0 AND 15.0)
);

-- Match Lineups (Fantasy Squads Drafted by Friends)
CREATE TABLE fantasy_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  player_ids UUID[] NOT NULL, -- Array of exactly 11 player IDs
  captain_id UUID NOT NULL,
  vice_captain_id UUID NOT NULL,
  total_credits VARCHAR(10) NOT NULL,
  total_points NUMERIC(6,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_match UNIQUE (user_id, match_id)
);`
        }
      },
      {
        title: "Firestore NoSQL Hierarchic Mapping",
        content: "For frictionless real-time queries. We choose an organized nested layout structure:",
        codeBlock: {
          language: "javascript",
          code: `// Collection /v1/users/{userId}
{
  "name": "Alex Mercer",
  "email": "alex@fantasy.friend",
  "role": "player"
}

// Collection /v1/matches/{matchId}
{
  "seriesId": "t20_world_cup_2026",
  "title": "IND vs AUS - Quarterfinal",
  "team1": "IND",
  "team2": "AUS",
  "status": "live",
  "players": [
    { "id": "p1", "name": "Virat Kohli", "team": "IND", "role": "Batsman", "credits": 10.5 },
    { "id": "p2", "name": "Pat Cummins", "team": "AUS", "role": "Bowler", "credits": 9.5 }
  ]
}

// Collection /v1/squads/{squadId} (Document ID matches: \`\${userId}_\${matchId}\` for easy unique retrieval)
{
  "matchId": "IND_AUS_M1",
  "userId": "u821",
  "userName": "Alex",
  "playerIds": ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11"],
  "captainId": "p1",
  "viceCaptainId": "p2",
  "totalCreditsUsed": 98.5,
  "totalPoints": 245.50
}`
        }
      }
    ]
  },
  {
    title: "3. Points Engine Design",
    icon: "Sliders",
    content: "The math engine. Points are calculated relative to physical match stats manually submitted by the Commissioner or pasted via simple CSV strings on the Admin Dashboard.",
    subsections: [
      {
        title: "Official Custom Scoring Formula",
        content: "We outline standard and customizable metrics mapped to general gameplay styles (Cricket scoring rules shown here as the MVP flagship):",
        codeBlock: {
          language: "typescript",
          code: `// Core Calculation Class for Fantasy Verification
export function calculatePlayerPoints(stats: PlayerStats, role: PlayerRole, rules: ScoringRules): number {
  let points = 0;

  // Batting Rules
  points += stats.runs * rules.run;
  points += stats.fours * rules.fourBonus;
  points += stats.sixes * rules.sixBonus;
  if (stats.runs >= 100) points += rules.centuryBonus;
  else if (stats.runs >= 50) points += rules.halfCenturyBonus;

  // Bowling Rules
  points += stats.wickets * rules.wicket;
  points += stats.maidens * rules.maidenBonus;
  points += Math.floor(stats.wickets / 3) * rules.threeWicketBonus;

  // Fielding Rules
  points += stats.catches * rules.catch;
  points += stats.stumpings * rules.stumping;
  points += stats.runOuts * rules.runOut;

  return points;
}`
        }
      },
      {
        title: "Captain Modifiers",
        content: "Crucial for strategy: Captain scores 2.0x standard points. Vice-Captain scores 1.5x standard points. This multiplier is calculated dynamically at the score-sheet compilation stage to prevent storing redundant values in base player collections."
      }
    ]
  },
  {
    title: "4. Development Roadmap",
    icon: "GitPullRequest",
    content: "The agile roadmap designed to launch the fully persistent platform within one to two weeks, ensuring immediate fun without drowning in boilerplate code.",
    subsections: [
      {
        title: "Sprint 1: The Core Draft & Engine Validator (Days 1-4)",
        content: "Goals: Perfect the Team Drafting Wizard UI.\n- User selects exactly 11 players.\n- Strictly checks role ratios (e.g. Min 1 Wicketkeeper, 3-5 Batsmen, 1-3 All-rounders, 3-5 Bowlers).\n- Enforces strict credit ceiling of 100 max credits.\n- Ensures Captain and Vice-Captain selections are mandatory.\n- Standard Client State with localStorage sync is constructed."
      },
      {
        title: "Sprint 2: Room Admin & Invite Codes (Days 5-7)",
        content: "Goals: Give the organizer direct power to host custom matchups.\n- Set up unique room code generator (e.g., base-36 matches-hash: MB7X2).\n- Create the Admin Panel where matches, rosters, and player values are custom-entered.\n- Build the shared state database (Firebase Firestore setup)."
      },
      {
        title: "Sprint 3: Scorer Interface & Standings Loop (Days 8-10)",
        content: "Goals: Enable manual score inputs & point crunching.\n- Implement Scorer interface: the Admin views a grid of players and increments runs/wickets post-match.\n- A single button 'Compile Standing' resolves all fantasy squads' captains, sums credits, and updates ranking indexes.\n- Display overall 'Series Leaderboard' showing sum of points across all matched drafts."
      },
      {
        title: "Sprint 4: Auth, Hosting & Group Chat Integration (Days 11-14)",
        content: "Goals: Security hardening and launch.\n- Fast passwordless Auth (Email or single-click Google Join).\n- Build production files via Vite/Docker, deploying instantly to Google Cloud Run's free tier."
      }
    ]
  },
  {
    title: "5. Auth & Hosting Guide",
    icon: "ShieldAlert",
    content: "Our exact recipe for professional user authentication and robust, zero-maintenance, zero-cost cloud deployments.",
    subsections: [
      {
        title: "User Authentication (Firebase Auth)",
        content: "The premium solution for private leagues in Firebase Authentication. It supports Google Sign-In and Passwordless Email Sign-In out of the box, with zero server-side maintenance required.",
        codeBlock: {
          language: "typescript",
          code: `import { getAuth, signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth";

// Direct passwordless Magic Link onboarding - no heavy passwords for friends to forget!
const auth = getAuth();
if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    email = window.prompt('Welcome back! Please enter your email to confirm joining:');
  }
  signInWithEmailLink(auth, email || '', window.location.href)
    .then((result) => {
      window.localStorage.removeItem('emailForSignIn');
      console.log("Logged in!", result.user);
    });
}`
        }
      },
      {
        title: "Scalable Hosting & Zero-Cost Limits",
        content: "Where do we host to stay entirely free while avoiding slow 'cold start' servers?\n\n1. Front-end Web Panel: Vercel or Netlify (100% Free for amateur custom sites, automatic SSL, CDN-backed global speeds).\n2. Backend Scorer proxy: Google Cloud Run (Allocates 2 million requests/month completely free, scales absolute down to zero instances, avoiding idle bills).\n3. Database: Google Cloud Firestore (Free up to 1GB stored data, and 20,000 writes + 50,000 reads per day, more than enough to handle 100 players hitting leaderboards every second of a match)."
      }
    ]
  }
];
