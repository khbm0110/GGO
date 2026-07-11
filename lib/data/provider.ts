import type { Article, Match, Standing, ClubProfile, Comment, User, Sponsor, SeoSettings, FeatureFlags, Player } from '@/types';

// This is the single "contract" the whole app talks to for data.
// Right now `mock-provider.ts` implements it using local seed data
// (lib/data/seed.ts, ported from the original project). Later, when
// Appwrite is ready, we write `appwrite-provider.ts` implementing the
// exact same interface and swap ONE line in `index.ts` — no page or
// component needs to change.
export interface DataProvider {
  getArticles(): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | null>;
  getBreakingArticles(): Promise<Article[]>;
  getTrendingArticles(): Promise<Article[]>;
  addArticle(article: Article): Promise<void>;
  updateArticle(article: Article): Promise<void>;
  deleteArticle(id: string): Promise<void>;

  getMatches(): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;

  getStandings(league?: string): Promise<Standing[]>;

  getClubs(): Promise<ClubProfile[]>;
  getClubById(id: string): Promise<ClubProfile | null>;
  addClub(club: ClubProfile): Promise<void>;
  updateClub(club: ClubProfile): Promise<void>;
  deleteClub(id: string): Promise<void>;

  getPlayerById(clubId: string, playerId: string): Promise<{ player: Player; club: ClubProfile } | null>;

  getCommentsForArticle(articleId: string): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
  updateCommentStatus(id: string, status: Comment['status']): Promise<void>;

  getUsers(): Promise<User[]>;
  updateUserStatus(id: string, status: 'active' | 'banned'): Promise<void>;
  deleteUser(id: string): Promise<void>;

  getSponsors(): Promise<Sponsor[]>;
  addSponsor(sponsor: Sponsor): Promise<void>;
  updateSponsor(sponsor: Sponsor): Promise<void>;
  deleteSponsor(id: string): Promise<void>;

  getSeoSettings(): Promise<SeoSettings>;
  updateSeoSettings(settings: SeoSettings): Promise<void>;

  getFeatureFlags(): Promise<FeatureFlags>;
  setFeatureFlag(key: keyof FeatureFlags, value: boolean): Promise<void>;
}
