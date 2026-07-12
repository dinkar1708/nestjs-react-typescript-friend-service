/* eslint-disable */
// Reads DATABASE_URL from .env.dev and creates the target database if it does
// not already exist. Idempotent — safe to run on every `db:setup`.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const envPath = path.join(__dirname, '..', '.env.dev');
if (!fs.existsSync(envPath)) {
  console.error(`.env.dev not found at ${envPath}`);
  process.exit(1);
}

const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const url = env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing in .env.dev');
  process.exit(1);
}

// postgresql://user:pass@host:port/dbname
const parsed = new URL(url);
const user = decodeURIComponent(parsed.username);
const password = decodeURIComponent(parsed.password);
const host = parsed.hostname;
const port = parsed.port || '5432';
const dbName = parsed.pathname.replace(/^\//, '').split('?')[0];

if (!dbName) {
  console.error('DATABASE_URL has no database name');
  process.exit(1);
}

function psql(target, sql) {
  return spawnSync(
    'psql',
    ['-h', host, '-p', port, '-U', user, '-d', target, '-tAc', sql],
    { env: { ...process.env, PGPASSWORD: password }, encoding: 'utf8' },
  );
}

const check = psql(
  'postgres',
  `SELECT 1 FROM pg_database WHERE datname='${dbName.replace(/'/g, "''")}'`,
);

if (check.status !== 0) {
  console.error('Cannot reach Postgres. Is it running on ' + host + ':' + port + '?');
  console.error(check.stderr || check.stdout);
  process.exit(1);
}

if (check.stdout.trim() === '1') {
  console.log(`Database "${dbName}" already exists — skipping create.`);
  process.exit(0);
}

const create = psql('postgres', `CREATE DATABASE "${dbName}"`);
if (create.status !== 0) {
  console.error('CREATE DATABASE failed:');
  console.error(create.stderr || create.stdout);
  process.exit(1);
}

console.log(`Created database "${dbName}".`);
