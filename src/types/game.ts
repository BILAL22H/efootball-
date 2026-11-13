export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'DMF'
  | 'CMF'
  | 'AMF'
  | 'LMF'
  | 'RMF'
  | 'LWF'
  | 'RWF'
  | 'CF'
  | 'SS';

export type CardType =
  | 'epic'
  | 'bigtime'
  | 'legendary'
  | 'highlight'
  | 'featured'
  | 'standard';

export interface PlayerStats {
  pac: number; // Pace
  sho: number; // Shooting
  pas: number; // Passing
  dri: number; // Dribbling
  def: number; // Defending
  phy: number; // Physicality
}

export interface Player {
  id: string;
  name: string;
  arName: string;
  rating: number; // 75 - 107
  position: Position;
  secondaryPositions: Position[];
  club: string;
  clubAr: string;
  clubLogo: string;
  nation: string;
  nationAr: string;
  flag: string;
  cardType: CardType;
  stats: PlayerStats;
  avatarColor: string;
  jerseyNumber: number;
  highlightYear?: string;
}

export type FormationKey = '4-3-3' | '4-2-3-1' | '4-4-2' | '3-5-2' | '4-1-2-3';

export interface PitchSlot {
  id: string; // e.g. 'pos-0'
  position: Position;
  label: string;
  labelAr: string;
  x: number; // 0 - 100% from left
  y: number; // 0 - 100% from top (GK at ~88%, CF at ~15%)
}

export interface Formation {
  key: FormationKey;
  name: string;
  nameAr: string;
  slots: PitchSlot[];
}

export interface DraftRound {
  roundNumber: number; // 1 to 11
  targetSlotId: string;
  targetPosition: Position;
  mysteryCards: Player[]; // 4 players
  selectedIndices: number[]; // up to 2
  chosenPlayer: Player | null; // chosen 1
  isRevealedTwo: boolean;
  isConfirmed: boolean;
}

export interface MatchEvent {
  id: string;
  minute: number;
  type: 'goal' | 'save' | 'post' | 'tackle' | 'pass' | 'yellow' | 'red' | 'kickoff' | 'fulltime';
  team: 'home' | 'away';
  playerName: string;
  playerRating: number;
  textEn: string;
  textAr: string;
  score: [number, number];
}

export interface MatchSummary {
  id: string;
  date: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  mvp: Player;
  coinsEarned: number;
  homeStats: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    xG: number;
  };
  awayStats: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    xG: number;
  };
}

export interface SavedSquad {
  id: string;
  name: string;
  formation: FormationKey;
  players: Record<string, Player>; // slotId -> Player
  substitutes: Player[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  coins: number;
  level: number;
  xp: number;
  avatarUrl: string;
  collection: Player[];
  savedSquads: SavedSquad[];
  matchHistory: MatchSummary[];
  lastDailyReward?: string;
}

export interface MultiplayerRoomState {
  code: string;
  hostName: string;
  guestName?: string;
  status: 'waiting' | 'drafting' | 'ready_for_match' | 'simulating' | 'completed';
  currentRound: number; // 1 to 11
  formation: FormationKey;
  hostSquad: Record<string, Player>;
  guestSquad: Record<string, Player>;
  hostCurrentPick?: { round: number; picked: boolean };
  guestCurrentPick?: { round: number; picked: boolean };
  matchResult?: MatchSummary;
  updatedAt: number;
}
