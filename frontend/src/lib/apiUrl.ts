/**
 * Helper to ensure API URLs are correctly formatted absolute URLs or relative paths.
 * Prevents browser relative resolution bugs when protocol (https://) is omitted.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api/v1';
  }

  let trimmed = envUrl.trim();
  // If user entered e.g. "forexmate-production.up.railway.app" without protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed.replace(/\/$/, '')}/api/v1`;
}

export function getWorkforceApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : 'http://localhost:3001/api/v1';
  }

  let trimmed = envUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed.replace(/\/$/, '')}/api/v1`;
}
