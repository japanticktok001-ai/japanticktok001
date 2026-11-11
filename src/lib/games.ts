import { apiRequest, resolveAssetUrl } from '@/lib/api';
import { API_PREFIX } from '@/lib/config';
import { BUFFALO_ART_URL, BUFFALO_GAME_NAME, buildBuffaloLaunchUrl } from '@/lib/buffalo';

export interface Game {
  name: string;
  title: string;
  provider: string;
  category: string;
  thumbnail: string | null;
  thumbnailFallback: string | null;
  isHot: boolean;
  isNew: boolean;
  requiresLogin: boolean;
}

type RawRecord = Record<string, unknown>;

const MAX_CATALOG_PAGES = 20;

// The backend ships no FirePhoenixVP assets; listing it would only produce broken launches.
const UNAVAILABLE_GAME_PATTERN = /fire\s*phoenix/i;

const BUFFALO_GAME: Game = {
  name: BUFFALO_GAME_NAME,
  title: 'African Buffalo',
  provider: 'Buffalo Studio',
  category: 'Slots',
  thumbnail: BUFFALO_ART_URL,
  thumbnailFallback: null,
  isHot: true,
  isNew: false,
  requiresLogin: false,
};

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : null;
}

function pickString(record: RawRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function pickBoolean(record: RawRecord, keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || value === 'true') return true;
  }
  return false;
}

function normalizeGame(raw: RawRecord): Game | null {
  const name = pickString(raw, ['name', 'game_name', 'slug', 'game']);
  if (!name) return null;

  const image = resolveAssetUrl(pickString(raw, ['image', 'icon', 'thumbnail', 'cover']));

  return {
    name,
    title: pickString(raw, ['title', 'label', 'display_name']) ?? name,
    provider: pickString(raw, ['provider', 'provider_name', 'vendor']) ?? 'Featured',
    category: pickString(raw, ['type', 'category', 'genre']) ?? 'Slots',
    thumbnail: image,
    thumbnailFallback: `${API_PREFIX}/game-icons/${encodeURIComponent(name)}.jpg`,
    isHot: pickBoolean(raw, ['hot', 'is_hot', 'featured']),
    isNew: pickBoolean(raw, ['new', 'is_new']),
    requiresLogin: true,
  };
}

function isAvailable(game: Game): boolean {
  return !UNAVAILABLE_GAME_PATTERN.test(`${game.name} ${game.title} ${game.provider}`);
}

interface GamesPage {
  games: RawRecord[];
  lastPage: number;
}

async function fetchGamesPage(page: number): Promise<GamesPage> {
  const payload = await apiRequest<unknown>(`/mobile/games?limit=500&page=${page}`);
  const record = asRecord(payload) ?? {};
  const list = Array.isArray(record.games)
    ? record.games.map(asRecord).filter((item): item is RawRecord => item !== null)
    : [];
  const lastPage = Number(record.last_page);
  return { games: list, lastPage: Number.isFinite(lastPage) && lastPage > 1 ? lastPage : 1 };
}

async function fetchApiGames(): Promise<Game[]> {
  const firstPage = await fetchGamesPage(1);
  const games: Game[] = [];

  const processPage = (page: GamesPage) => {
    for (const raw of page.games) {
      const game = normalizeGame(raw);
      if (game && isAvailable(game)) games.push(game);
    }
  };

  processPage(firstPage);

  for (let page = 2; page <= firstPage.lastPage && page <= MAX_CATALOG_PAGES; page += 1) {
    processPage(await fetchGamesPage(page));
  }

  return games;
}

export async function fetchGames(): Promise<Game[]> {
  const apiGames = await fetchApiGames().catch(() => []);
  return [BUFFALO_GAME, ...apiGames];
}

export async function fetchCategories(): Promise<string[]> {
  const payload = await apiRequest<unknown>('/mobile/games/categories');
  const record = asRecord(payload) ?? {};
  const list = Array.isArray(record.categories) ? record.categories : Array.isArray(record.data) ? record.data : [];
  return list
    .filter((item): item is string => typeof item === 'string')
    .sort((a, b) => a.localeCompare(b));
}

export async function fetchGame(name: string): Promise<Game | null> {
  if (name === BUFFALO_GAME_NAME) return BUFFALO_GAME;

  const payload = await apiRequest<unknown>(`/mobile/games/${encodeURIComponent(name)}`);
  const record = asRecord(payload);
  const raw = record && asRecord(record.data) ? asRecord(record.data) : record;
  return raw ? normalizeGame(raw) : null;
}

export async function launchGame(name: string): Promise<string> {
  if (name === BUFFALO_GAME_NAME) return buildBuffaloLaunchUrl();

  const payload = await apiRequest<unknown>(`/mobile/games/${encodeURIComponent(name)}/launch`);
  const record = asRecord(payload);
  const nested = record ? asRecord(record.data) : null;
  const url =
    (record && pickString(record, ['url', 'launch_url', 'game_url'])) ||
    (nested && pickString(nested, ['url', 'launch_url', 'game_url']));
  if (!url) throw new Error('The game could not be launched right now.');
  return url;
}

export function deriveProviders(games: Game[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const game of games) counts.set(game.provider, (counts.get(game.provider) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function deriveCategories(games: Game[]): string[] {
  return [...new Set(games.map((game) => game.category))].sort((a, b) => a.localeCompare(b));
}
