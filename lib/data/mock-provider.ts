import type { Article, Match, Standing, ClubProfile, Comment, User, Sponsor, SeoSettings, FeatureFlags } from '@/types';
import type { DataProvider } from './provider';
import {
  INITIAL_ARTICLES,
  MOCK_MATCHES,
  MOCK_STANDINGS,
  CLUB_DATABASE,
} from './seed';
import { MOCK_USERS } from './seed-users';
import { MOCK_SPONSORS, DEFAULT_SEO_SETTINGS, DEFAULT_FEATURE_FLAGS } from './seed-admin';

// ⚠️ DEVELOPMENT ONLY. All mutations below happen on plain in-memory
// arrays/objects that reset the moment the server restarts (or on every
// request in serverless environments). This is intentional: it lets us
// build and click through the full admin dashboard before Appwrite is
// wired in as the real, persistent backend in the final phase.
const articles: Article[] = [...INITIAL_ARTICLES];
const users: User[] = [...MOCK_USERS];
const comments: Comment[] = [];
const clubs: Record<string, ClubProfile> = { ...(CLUB_DATABASE as Record<string, ClubProfile>) };
const sponsors: Sponsor[] = [...MOCK_SPONSORS];
let seoSettings: SeoSettings = { ...DEFAULT_SEO_SETTINGS };
let featureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

function delay<T>(value: T, ms = 80): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockProvider: DataProvider = {
  async getArticles() {
    return delay([...articles]);
  },
  async getArticleById(id) {
    return delay(articles.find((a) => a.id === id) ?? null);
  },
  async getBreakingArticles() {
    return delay(articles.filter((a) => a.isBreaking));
  },
  async getTrendingArticles() {
    return delay([...articles].sort((a, b) => b.views - a.views).slice(0, 6));
  },
  async addArticle(article) {
    articles.unshift(article);
    return delay(undefined);
  },
  async updateArticle(article) {
    const idx = articles.findIndex((a) => a.id === article.id);
    if (idx > -1) articles[idx] = article;
    return delay(undefined);
  },
  async deleteArticle(id) {
    const idx = articles.findIndex((a) => a.id === id);
    if (idx > -1) articles.splice(idx, 1);
    return delay(undefined);
  },

  async getMatches() {
    return delay(MOCK_MATCHES as Match[]);
  },
  async getMatchById(id) {
    return delay((MOCK_MATCHES as Match[]).find((m) => m.id === id) ?? null);
  },

  async getStandings(league) {
    const all = MOCK_STANDINGS as Standing[];
    return delay(league ? all.filter((s) => s.league === league) : all);
  },

  async getClubs() {
    return delay(Object.values(clubs).filter((c) => c.id !== 'generic'));
  },
  async getClubById(id) {
    return delay(clubs[id] ?? null);
  },
  async addClub(club) {
    clubs[club.id] = club;
    return delay(undefined);
  },
  async updateClub(club) {
    clubs[club.id] = club;
    return delay(undefined);
  },
  async deleteClub(id) {
    delete clubs[id];
    return delay(undefined);
  },

  async getPlayerById(clubId, playerId) {
    const club = clubs[clubId];
    if (!club) return delay(null);
    const player = (club.squad || []).find((p) => p.id === playerId);
    if (!player) return delay(null);
    return delay({ player, club });
  },

  async getCommentsForArticle(articleId) {
    return delay(comments.filter((c) => c.articleId === articleId));
  },
  async getAllComments() {
    return delay([...comments]);
  },
  async updateCommentStatus(id, status) {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx > -1) comments[idx] = { ...comments[idx], status };
    return delay(undefined);
  },

  async getUsers() {
    return delay([...users]);
  },
  async updateUserStatus(id, status) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx > -1) users[idx] = { ...users[idx], status };
    return delay(undefined);
  },
  async deleteUser(id) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx > -1) users.splice(idx, 1);
    return delay(undefined);
  },

  async getSponsors() {
    return delay([...sponsors]);
  },
  async addSponsor(sponsor) {
    sponsors.unshift(sponsor);
    return delay(undefined);
  },
  async updateSponsor(sponsor) {
    const idx = sponsors.findIndex((s) => s.id === sponsor.id);
    if (idx > -1) sponsors[idx] = sponsor;
    return delay(undefined);
  },
  async deleteSponsor(id) {
    const idx = sponsors.findIndex((s) => s.id === id);
    if (idx > -1) sponsors.splice(idx, 1);
    return delay(undefined);
  },

  async getSeoSettings() {
    return delay({ ...seoSettings });
  },
  async updateSeoSettings(settings) {
    seoSettings = settings;
    return delay(undefined);
  },

  async getFeatureFlags() {
    return delay({ ...featureFlags });
  },
  async setFeatureFlag(key, value) {
    featureFlags = { ...featureFlags, [key]: value };
    return delay(undefined);
  },
};
