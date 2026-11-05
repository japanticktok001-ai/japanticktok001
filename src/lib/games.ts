import { apiRequest, resolveAssetUrl } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

export interface Game {
  name: string;
  title: string;
  provider: string;
  category: string;
  thumbnail: string | null;
  thumbnailFallback: string | null;
}

type RawRecord = Record<string, unknown>;

const MAX_CATALOG_PAGES = 20;

// The backend ships no FirePhoenixVP assets; listing it would only produce broken launches.
const UNAVAILABLE_GAME_PATTERN = /fire\s*phoenix/i;

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

function extractList(payload: unknown): RawRecord[] {
  if (Array.isArray(payload)) return payload.map(asRecord).filter((item): item is RawRecord => item !== null);

  const record = asRecord(payload);
  if (!record) return [];

  for (const key of ['data', 'games', 'items', 'results']) {
    if (key in record) {
      const nested = extractList(record[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function readLastPage(payload: unknown): number {
  const record = asRecord(payload);
  const lastPage = record ? Number(record.last_page) : NaN;
  return Number.isFinite(lastPage) && lastPage > 1 ? lastPage : 1;
}

function normalizeGame(raw: RawRecord): Game | null {
  const name = pickString(raw, ['name', 'game_name', 'slug', 'game']);
  if (!name) return null;

  return {
    name,
    title: pickString(raw, ['title', 'display_name', 'label']) ?? name,
    provider: pickString(raw, ['provider', 'provider_name', 'vendor']) ?? 'Featured',
    category: pickString(raw, ['category', 'type', 'genre']) ?? 'Slots',
    thumbnail: `${API_BASE_URL}/game-icons/${encodeURIComponent(name)}.jpg`,
    thumbnailFallback: resolveAssetUrl(pickString(raw, ['thumbnail', 'image', 'cover', 'icon', 'preview'])),
  };
}

function isAvailable(game: Game): boolean {
  return !UNAVAILABLE_GAME_PATTERN.test(`${game.name} ${game.title} ${game.provider}`);
}

export async function fetchGames(): Promise<Game[]> {
  const games: Game[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await apiRequest<unknown>(`/games?page=${page}`);
    games.push(
      ...extractList(payload)
        .map(normalizeGame)
        .filter((game): game is Game => game !== null),
    );
    lastPage = readLastPage(payload);
    page += 1;
  } while (page <= lastPage && page <= MAX_CATALOG_PAGES);

  return games.filter(isAvailable);
}

export async function fetchGame(name: string): Promise<Game | null> {
  const payload = await apiRequest<unknown>(`/games/${encodeURIComponent(name)}`);
  const record = asRecord(payload);
  const raw = record && asRecord(record.data) ? asRecord(record.data) : record;
  return raw ? normalizeGame(raw) : null;
}

export async function launchGame(name: string): Promise<string> {
  const payload = await apiRequest<unknown>(`/games/${encodeURIComponent(name)}/launch`);
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
