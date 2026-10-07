const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const file = path.resolve(process.argv[2] || 'backend/dev.db');
const db = new DatabaseSync(file, { readOnly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(({ name }) => name);
const report = {
  databaseFile: file,
  databaseSize: fs.statSync(file).size,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
  sqliteVersion: db.prepare('SELECT sqlite_version() AS version').get().version,
  integrityCheck: db.prepare('PRAGMA integrity_check').get().integrity_check,
  foreignKeyViolations: db.prepare('PRAGMA foreign_key_check').all(),
  tables: tables.map((name) => {
    const quoted = `"${name.replaceAll('"', '""')}"`;
    return {
      name,
      rows: db.prepare(`SELECT COUNT(*) AS count FROM ${quoted}`).get().count,
      columns: db.prepare(`PRAGMA table_info(${quoted})`).all(),
      foreignKeys: db.prepare(`PRAGMA foreign_key_list(${quoted})`).all(),
      indexes: db.prepare(`PRAGMA index_list(${quoted})`).all(),
    };
  }),
};
if (process.argv[3] === '--summary') {
  console.log(JSON.stringify({
    databaseFile: report.databaseFile,
    databaseSize: report.databaseSize,
    sha256: report.sha256,
    sqliteVersion: report.sqliteVersion,
    integrityCheck: report.integrityCheck,
    foreignKeyViolations: report.foreignKeyViolations.length,
    tableCount: report.tables.length,
    totalRows: report.tables.reduce((sum, table) => sum + table.rows, 0),
    tables: report.tables.map(({ name, rows, columns, foreignKeys }) => ({ name, rows, columnCount: columns.length, foreignKeyCount: foreignKeys.length })),
  }, null, 2));
} else {
  console.log(JSON.stringify(report, null, 2));
}
db.close();
