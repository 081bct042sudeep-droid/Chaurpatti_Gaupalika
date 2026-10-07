const apiOrigin = (
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.PROD ? 'https://chaurpati-api.onrender.com' : '')
).replace(/\/+$/, '');

export function apiUrl(value: string | null | undefined) {
  if (!value || !value.startsWith('/api/')) return value || '';
  return `${apiOrigin}${value}`;
}

export function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input === 'string') return fetch(apiUrl(input), init);
  if (input instanceof URL) return fetch(apiUrl(input.href), init);
  if (input instanceof Request && input.url.startsWith(window.location.origin + '/api/')) {
    return fetch(new Request(apiUrl(input.url), input), init);
  }
  return fetch(input, init);
}
