// onexbet.wiki Laravel API. The mobile player routes live under /api/mobile.
// Override the base with VITE_API_BASE_URL only when targeting another verified deployment.
const RAW_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://onexbet.wiki/api'
).replace(/\/$/, '');

// Normalize the legacy https://api.bxbet.asia/api form to the verified base, if it ever reappears.
export const API_BASE_URL = RAW_BASE.replace(/^https:\/\/api\.bxbet\.asia\/api$/, 'https://bxbet.asia/api');

export const API_PREFIX = API_BASE_URL; // routes are already /mobile/...
