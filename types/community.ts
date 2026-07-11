export interface Prediction {
  matchId: string;
  userId: string;
  username: string;
  predictedHome: number;
  predictedAway: number;
  points?: number; // filled in once the match is FINISHED
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  predictionsCount: number;
}
