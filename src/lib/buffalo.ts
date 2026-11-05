const BUFFALO_HOST = ((import.meta.env.VITE_BUFFALO_GAME_HOST as string | undefined) ?? 'https://buffalo.cocodr.xyz').replace(/\/$/, '');

export const BUFFALO_GAME_NAME = 'buffalo777';

export const BUFFALO_ART_URL = `${BUFFALO_HOST}/assets/main/native/ef/ef8e0813-8390-4ab2-9551-477f9cc3c950.png`;

export function buildBuffaloLaunchUrl(): string {
  const params = new URLSearchParams({
    id: 'demo',
    game: BUFFALO_GAME_NAME,
    domain: new URL(BUFFALO_HOST).host,
    passcode: 'demo',
    exit: window.location.origin,
  });
  return `${BUFFALO_HOST}/?${params.toString()}`;
}
