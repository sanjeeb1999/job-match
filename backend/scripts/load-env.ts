/**
 * Shared env loader for development scripts. Never prints secret values.
 */
import * as fs from 'fs';
import * as path from 'path';

export function loadBackendEnv(): void {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

export function requireCognoDbEnv(): {
  uri: string;
  user: string;
  password: string;
} {
  loadBackendEnv();

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER;
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error(
      'Missing COGNODB_URI, COGNODB_USER, or COGNODB_PASSWORD in backend/.env',
    );
  }

  return { uri, user, password };
}
