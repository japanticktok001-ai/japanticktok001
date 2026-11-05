export const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://bxbet.asia/api'
).replace(/\/api\/?$/, '').replace(/\/$/, '');

export const API_PREFIX = `${API_BASE_URL}/api/mobile`;
