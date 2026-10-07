const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MIGRATION_LEDGER = '_prisma_migrations';
const sourcePath = path.resolve(process.argv[2] || 'dev.db');
const reportPath = path.resolve(process.argv[3] || path.join('backups', `migration-report-${new Date().toISOString().replaceAll(':', '').replaceAll('.', '')}.json`));
const targetUrl = process.env.POSTGRES_MIGRATION_URL || process.env.DATABASE_URL;

function fail(message) {
  throw new Error(message);
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function canonicalDate(value) {
  if (value instanceof Date) return value.toISOString();
  const raw = String(value);
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const withUtc = /(?:Z|[+-]\d\d(?::?\d\d)?)$/i.test(normalized) ? normalized : `${normalized}Z`;
  const date = new Date(withUtc);
  if (Number.isNaN(date.getTime())) fail(`Unparseable datetime encountered during validation: ${raw}`);
  return date.toISOString();
}

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]));
  }
  return value;
}

function normalize(value, column) {
  if (value === null || value === undefined) return null;
  const type = String(column.type).toUpperCase();
  if (type.includes('BOOL')) return value === true || value === 1 || value === 1n;
  if (type.includes('JSON')) {
    return canonicalJson(typeof value === 'string' ? JSON.parse(value) : value);
  }
  if (type.includes('DATE') || type.includes('TIME')) return canonicalDate(value);
  if (type.includes('INT') || type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE')) return Number(value);
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return Buffer.from(value).toString('base64');
  return value;
}

function rowFingerprint(rows, columns, primaryKeys) {
  const ordered = [...rows].sort((a, b) => {
    for (const key of primaryKeys) {
      const left = String(a[key] ?? '');
      const right = String(b[key] ?? '');
      if (left < right) return -1;
      if (left > right) return 1;
    }
    return 0;
  });
  const tuples = ordered.map((row) => columns.map((column) => normalize(row[column.name], column)));
  return hash(JSON.stringify(tuples));
}

function sqliteMetadata(db, table) {
  const name = quoteIdentifier(table);
  const columns = db.prepare(`PRAGMA table_info(${name})`).all();
  const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${name})`).all();
  const primaryKeys = columns.filter((column) => column.pk).sort((a, b) => a.pk - b.pk).map((column) => column.name);
  if (!primaryKeys.length) fail(`Table ${table} has no primary key; preserving IDs cannot be validated safely.`);
  return { columns, foreignKeys, primaryKeys };
}

function checkSourceUniqueIndexes(db, table, rows) {
  const tableName = quoteIdentifier(table);
  const uniqueIndexes = db.prepare(`PRAGMA index_list(${tableName})`).all().filter((index) => index.unique);
  for (const index of uniqueIndexes) {
    const columns = db.prepare(`PRAGMA index_info(${quoteIdentifier(index.name)})`).all().sort((a, b) => a.seqno - b.seqno).map((column) => column.name);
    if (!columns.length) continue;
    const found = new Set();
    for (const row of rows) {
      const values = columns.map((column) => row[column]);
      if (values.some((value) => value === null)) continue;
      const key = JSON.stringify(values);
      if (found.has(key)) fail(`Duplicate value in source unique index ${index.name} on ${table}.`);
      found.add(key);
    }
  }
}

function importOrder(tables, metadata) {
  const tableSet = new Set(tables);
  const visited = new Set();
  const active = new Set();
  const ordered = [];
  function visit(table) {
    if (visited.has(table)) return;
    if (active.has(table)) fail(`Circular table-level foreign-key dependency includes ${table}; refusing an unsafe import order.`);
    active.add(table);
    for (const fk of metadata.get(table).foreignKeys) {
      if (fk.table !== table && tableSet.has(fk.table)) visit(fk.table);
    }
    active.delete(table);
    visited.add(table);
    ordered.push(table);
  }
  for (const table of tables) visit(table);
  return ordered;
}

function sortSelfReferences(rows, foreignKeys, primaryKeys) {
  const selfKeys = foreignKeys.filter((fk) => fk.table === fk.tableName);
  if (!selfKeys.length) return rows;
  if (primaryKeys.length !== 1) fail('Self-referencing composite primary keys need manual migration review.');
  const byReference = new Map();
  for (const fk of selfKeys) {
    if (!byReference.has(fk.to)) byReference.set(fk.to, new Map());
    for (const row of rows) byReference.get(fk.to).set(String(row[fk.to]), row);
  }
  const result = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(row) {
    const rowId = String(row[primaryKeys[0]]);
    if (visited.has(rowId)) return;
    if (visiting.has(rowId)) fail(`Circular self-reference found for row ${rowId}; refusing an unsafe import.`);
    visiting.add(rowId);
    for (const fk of selfKeys) {
      const parentId = row[fk.from];
      const parent = parentId === null ? undefined : byReference.get(fk.to).get(String(parentId));
      if (parent) visit(parent);
    }
    visiting.delete(rowId);
    visited.add(rowId);
    result.push(row);
  }
  for (const row of rows) visit(row);
  return result;
}

function postgresValue(value, column) {
  if (value === null || value === undefined) return null;
  const type = String(column.type).toUpperCase();
  if (type.includes('BOOL')) return value === true || value === 1 || value === 1n;
  if (type.includes('JSON')) return JSON.stringify(JSON.parse(String(value)));
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return Buffer.from(value);
  return value;
}

function placeholder(column, position) {
  const type = String(column.type).toUpperCase();
  if (type.includes('JSON')) return `$${position}::jsonb`;
  if (type.includes('DATE') || type.includes('TIME')) return `$${position}::timestamp(3)`;
  return `$${position}`;
}

async function tableRows(client, table, columns, primaryKeys) {
  const select = `SELECT * FROM ${quoteIdentifier(table)}`;
  const orderBy = primaryKeys.map(quoteIdentifier).join(', ');
  return client.$queryRawUnsafe(`${select} ORDER BY ${orderBy}`);
}

async function validateTarget(tx, sourceTables, metadata, sourceRowsByTable) {
  const targetTables = await tx.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations' ORDER BY table_name",
  );
  const names = targetTables.map((row) => row.table_name);
  const missing = sourceTables.filter((table) => !names.includes(table));
  const unexpected = names.filter((table) => !sourceTables.includes(table));
  if (missing.length || unexpected.length) fail(`PostgreSQL table set mismatch. Missing: ${missing.join(', ') || 'none'}; unexpected: ${unexpected.join(', ') || 'none'}.`);

  const validation = [];
  for (const table of sourceTables) {
    const { columns, primaryKeys, foreignKeys } = metadata.get(table);
    const sourceRows = sourceRowsByTable.get(table);
    const targetRows = await tableRows(tx, table, columns, primaryKeys);
    const sourceHash = rowFingerprint(sourceRows, columns, primaryKeys);
    const targetHash = rowFingerprint(targetRows, columns, primaryKeys);
    const sourceCount = sourceRows.length;
    const targetCount = targetRows.length;
    const row = {
      table,
      sourceRows: sourceCount,
      targetRows: targetCount,
      difference: targetCount - sourceCount,
      sourceContentSha256: sourceHash,
      targetContentSha256: targetHash,
      primaryKeysPreserved: sourceHash === targetHash,
      status: sourceCount === targetCount && sourceHash === targetHash ? 'PASS' : 'FAIL',
    };
    validation.push(row);
    if (row.status !== 'PASS') fail(`Validation failed for table ${table}: row count or content checksum differs.`);

    for (const fk of foreignKeys) {
      const orphan = await tx.$queryRawUnsafe(
        `SELECT COUNT(*)::text AS count FROM ${quoteIdentifier(table)} c LEFT JOIN ${quoteIdentifier(fk.table)} p ON c.${quoteIdentifier(fk.from)} = p.${quoteIdentifier(fk.to)} WHERE c.${quoteIdentifier(fk.from)} IS NOT NULL AND p.${quoteIdentifier(fk.to)} IS NULL`,
      );
      if (Number(orphan[0].count) !== 0) fail(`Foreign-key validation failed for ${table}.${fk.from} -> ${fk.table}.${fk.to}.`);
    }
  }
  return validation;
}

async function main() {
  if (!targetUrl || !/^postgres(?:ql)?:\/\//i.test(targetUrl)) {
    fail('Set POSTGRES_MIGRATION_URL (or DATABASE_URL) to an empty PostgreSQL database. The URL is never printed or included in the report.');
  }
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  if (fs.existsSync(reportPath)) fail(`Report file already exists; refusing to overwrite it: ${reportPath}`);
  if (!fs.existsSync(sourcePath)) fail(`SQLite source database was not found: ${sourcePath}`);

  process.env.DATABASE_URL = targetUrl;
  const { PrismaClient } = require('../node_modules/.prisma/portal-postgres-client');
  const sourceSha256 = hash(fs.readFileSync(sourcePath));
  const sqlite = new DatabaseSync(sourcePath, { readOnly: true });
  const target = new PrismaClient();
  const startedAt = new Date().toISOString();
  let sourceDataVersion;
  let transactionCommitted = false;
  let report;

  try {
    sqlite.exec('BEGIN');
    sourceDataVersion = sqlite.prepare('PRAGMA data_version').get().data_version;
    const integrity = sqlite.prepare('PRAGMA integrity_check').get().integrity_check;
    if (integrity !== 'ok') fail(`SQLite integrity_check failed: ${integrity}`);
    const fkProblems = sqlite.prepare('PRAGMA foreign_key_check').all();
    if (fkProblems.length) fail(`SQLite has ${fkProblems.length} foreign-key violations.`);

    const sourceTables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> ? ORDER BY name").all(MIGRATION_LEDGER).map((row) => row.name);
    const metadata = new Map(sourceTables.map((table) => [table, sqliteMetadata(sqlite, table)]));
    const sourceRowsByTable = new Map();
    const totals = { rows: 0, textCells: 0, replacementCharacters: 0, booleanCells: 0, jsonCells: 0, datetimeCells: 0 };

    for (const table of sourceTables) {
      const tableName = quoteIdentifier(table);
      const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all();
      const tableMetadata = metadata.get(table);
      checkSourceUniqueIndexes(sqlite, table, rows);
      sourceRowsByTable.set(table, rows);
      totals.rows += rows.length;
      for (const column of tableMetadata.columns) {
        const type = String(column.type).toUpperCase();
        for (const row of rows) {
          const value = row[column.name];
          if (value === null || value === undefined) continue;
          if (type.includes('BOOL')) totals.booleanCells++;
          if (type.includes('JSON')) {
            JSON.parse(String(value));
            totals.jsonCells++;
          }
          if (type.includes('DATE') || type.includes('TIME')) {
            canonicalDate(value);
            totals.datetimeCells++;
          }
          if (typeof value === 'string') {
            totals.textCells++;
            totals.replacementCharacters += [...value].filter((char) => char === '\uFFFD').length;
          }
        }
      }
    }
    if (totals.replacementCharacters) fail(`Source contains ${totals.replacementCharacters} Unicode replacement characters; review required before import.`);
    if (sqlite.prepare('PRAGMA data_version').get().data_version !== sourceDataVersion) fail('SQLite changed while it was being read; stop application writes and retry from the unchanged source backup.');

    const targetNames = await target.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name <> '_prisma_migrations' ORDER BY table_name",
    );
    const targetSet = new Set(targetNames.map((row) => row.table_name));
    const missingTables = sourceTables.filter((table) => !targetSet.has(table));
    const extraTables = [...targetSet].filter((table) => !sourceTables.includes(table));
    if (missingTables.length || extraTables.length) fail(`PostgreSQL schema does not match the SQLite source. Missing tables: ${missingTables.join(', ') || 'none'}; unexpected tables: ${extraTables.join(', ') || 'none'}.`);

    for (const table of sourceTables) {
      const count = await target.$queryRawUnsafe(`SELECT COUNT(*)::text AS count FROM ${quoteIdentifier(table)}`);
      if (Number(count[0].count) !== 0) fail(`Target table ${table} is not empty; refusing to overwrite or merge existing PostgreSQL data.`);
    }

    const orderedTables = importOrder(sourceTables, metadata);
    await target.$transaction(async (tx) => {
      for (const table of orderedTables) {
        const { columns, foreignKeys, primaryKeys } = metadata.get(table);
        const rows = sourceRowsByTable.get(table);
        const orderedRows = sortSelfReferences(rows, foreignKeys.map((fk) => ({ ...fk, tableName: table })), primaryKeys);
        const names = columns.map((column) => column.name);
        const quotedNames = names.map(quoteIdentifier).join(', ');
        for (const row of orderedRows) {
          const values = columns.map((column) => postgresValue(row[column.name], column));
          const markers = columns.map((column, index) => placeholder(column, index + 1)).join(', ');
          await tx.$executeRawUnsafe(`INSERT INTO ${quoteIdentifier(table)} (${quotedNames}) VALUES (${markers})`, ...values);
        }
        console.log(`[IMPORT] ${table}: ${rows.length} rows`);
      }

      if (sqlite.prepare('PRAGMA data_version').get().data_version !== sourceDataVersion) fail('SQLite changed during import; target transaction will be rolled back.');
      const validation = await validateTarget(tx, sourceTables, metadata, sourceRowsByTable);
      report = {
        status: 'SUCCESS',
        startedAt,
        completedAt: new Date().toISOString(),
        source: { type: 'SQLite', path: sourcePath, sha256: sourceSha256 },
        target: { type: 'PostgreSQL', connection: 'redacted' },
        prismaVersion: '6.19.3',
        sourceIntegrity: integrity,
        sourceForeignKeyViolations: fkProblems.length,
        tablesMigrated: sourceTables.length,
        totalRowsMigrated: totals.rows,
        excludedTables: [{ name: MIGRATION_LEDGER, reason: 'Prisma migration ledgers are database-provider-specific; PostgreSQL owns its ledger.' }],
        transformations: { booleans: totals.booleanCells, jsonb: totals.jsonCells, datetimeValuesValidated: totals.datetimeCells, changedSemanticValues: 0 },
        unicode: { textCellsChecked: totals.textCells, replacementCharacters: totals.replacementCharacters },
        sequences: 'No integer auto-increment primary keys exist in the source application tables.',
        validation,
        result: 'All table counts, row contents, primary keys, and foreign keys matched.',
      };
    }, { timeout: 600000, maxWait: 30000 });
    transactionCommitted = true;

    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    console.log(`Tables migrated: ${report.tablesMigrated}/${report.tablesMigrated}`);
    console.log(`Rows migrated: ${report.totalRowsMigrated}`);
    console.log('Foreign-key errors: 0');
    console.log('Content checksum mismatches: 0');
    console.log(`Report: ${reportPath}`);
    console.log('Status: SUCCESS');
  } catch (error) {
    report = {
      status: 'MIGRATION FAILED — REVIEW REQUIRED',
      startedAt,
      completedAt: new Date().toISOString(),
      sourcePath,
      error: error instanceof Error ? error.message : String(error),
      target: { type: 'PostgreSQL', connection: 'redacted' },
      note: transactionCommitted
        ? 'The data transaction committed, but a later reporting step failed. Do not rerun against this non-empty database; validate it and create the report separately.'
        : 'Any active data import transaction was rolled back. No target table is truncated or overwritten.',
    };
    if (!transactionCommitted && !fs.existsSync(reportPath)) fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    console.error(report.status);
    console.error(report.error);
    process.exitCode = 1;
  } finally {
    await target.$disconnect().catch(() => undefined);
    sqlite.close();
  }
}

main().catch((error) => {
  console.error('MIGRATION FAILED — REVIEW REQUIRED');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
