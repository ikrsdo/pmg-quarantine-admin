function escapeCsvField(value) {
  let s = value === null || value === undefined ? '' : String(value);
  // Prefix a leading =, +, -, or @ with a quote so spreadsheet apps treat
  // the cell as text instead of a formula (CSV/formula injection guard -
  // subject/from fields come from attacker-controlled mail content).
  if (/^[=+\-@]/.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// columns: [{ key, label }] - `key` reads the row field, `label` is the CSV header
export function downloadCsv(filename, rows, columns) {
  const header = columns.map((c) => escapeCsvField(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvField(row[c.key])).join(','),
  );
  // Leading BOM so Excel opens UTF-8 files (Turkish characters) without mangling them.
  const csv = '﻿' + [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
