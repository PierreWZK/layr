// Lance un Postgres local (dev uniquement) sur le port 5433, données dans .pgdata/.
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';

const databaseDir = '.pgdata';
const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'layr',
  password: 'layr',
  port: 5433,
  persistent: true,
  onError: (msg) => console.error(msg),
});

if (!existsSync(databaseDir)) {
  await pg.initialise();
}
await pg.start();
try {
  await pg.createDatabase('layr');
} catch {
  // la base existe déjà
}

console.log('Postgres dev prêt : postgresql://layr:layr@localhost:5433/layr (Ctrl+C pour arrêter)');

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
setInterval(() => {}, 1 << 30);
