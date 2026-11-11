// onexbet.wiki Laravel API. The mobile player routes live under /api/mobile,
// while frontend assets (game icons, etc.) live at the site root /frontend/...
const RAW_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://onexbet.wiki/api'
).replace(/\/$/, '');

// Strip the /api suffix to get the site root for asset URLs.
const SITE_ROOT = RAW_BASE.replace(/\/api$/, '');

export const API_PREFIX = RAW_BASE;
export const SITE_ORIGIN = SITE_ROOT;
