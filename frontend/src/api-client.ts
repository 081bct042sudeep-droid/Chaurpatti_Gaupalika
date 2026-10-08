const apiOrigin = (
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.PROD ? 'https://chaurpati-api.onrender.com' : '')
).replace(/\/+$/, '');

// This public tourism photo was already referenced by the production database,
// but its original upload was on Render's ephemeral filesystem. Keep a Vercel-
// served copy so this existing place does not show a broken image after deploys.
const packagedPublicUploads: Record<string, string> = {
  '/api/uploads/tourism/f7619adf-6d18-4c02-b1ec-6a8ba6f242c0.jpg':
    '/tourism-media/f7619adf-6d18-4c02-b1ec-6a8ba6f242c0.jpg',
};

export function apiUrl(value: string | null | undefined) {
  if (!value || !value.startsWith('/api/')) return value || '';
  if (packagedPublicUploads[value]) return packagedPublicUploads[value];
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
