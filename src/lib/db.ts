import { Pool } from 'pg';

declare global {
  var __layrPool: Pool | undefined;
}

// Pool unique par process. Renvoie null si DATABASE_URL n'est pas renseigné.
export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  globalThis.__layrPool ??= new Pool({ connectionString, max: 5 });
  return globalThis.__layrPool;
}
