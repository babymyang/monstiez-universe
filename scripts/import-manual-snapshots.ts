/**
 * Manual metric-snapshot importer (brief §5.3).
 *
 * The person entering a snapshot MUST have visited the public source page and
 * recorded value + time + URL by hand. This tool only formats/merges entries —
 * it never visits YouTube/Spotify itself.
 *
 * CSV format (header row required):
 *   entityId,entityTitle,metric,value,observedAt,sourceUrl,notes
 *
 * Usage: bun scripts/import-manual-snapshots.ts path/to/snapshots.csv
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SNAPSHOTS = new URL("../data/metric-snapshots.json", import.meta.url);

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath || !existsSync(csvPath)) {
    console.error("Usage: bun scripts/import-manual-snapshots.ts <snapshots.csv>");
    console.error(
      "Columns: entityId,entityTitle,metric,value,observedAt,sourceUrl,notes",
    );
    process.exit(2);
  }
  const rows = parseCsv(readFileSync(csvPath, "utf-8"));
  const [header, ...data] = rows;
  const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
  const required = ["entityId", "entityTitle", "metric", "value", "observedAt", "sourceUrl"];
  for (const col of required) {
    if (!(col in idx)) {
      console.error(`Missing required column: ${col}`);
      process.exit(2);
    }
  }

  const db = JSON.parse(readFileSync(SNAPSHOTS, "utf-8"));
  let added = 0;
  let skipped = 0;
  for (const r of data) {
    const value = Number(r[idx.value]);
    const observedAt = r[idx.observedAt].trim();
    const sourceUrl = r[idx.sourceUrl].trim();
    if (!Number.isFinite(value) || value <= 0) {
      console.warn(`SKIP ${r[idx.entityId]}: value must be a positive observed number`);
      skipped++;
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}T/.test(observedAt) || !sourceUrl.startsWith("https://")) {
      console.warn(`SKIP ${r[idx.entityId]}: observedAt must be ISO and sourceUrl must be https`);
      skipped++;
      continue;
    }
    const dup = db.snapshots.some(
      (s: { entityId: string; metric: string; observedAt: string }) =>
        s.entityId === r[idx.entityId].trim() &&
        s.metric === r[idx.metric].trim() &&
        s.observedAt === observedAt,
    );
    if (dup) {
      skipped++;
      continue; // idempotent: identical observation exists
    }
    db.snapshots.push({
      entityId: r[idx.entityId].trim(),
      entityTitle: r[idx.entityTitle].trim(),
      metric: r[idx.metric].trim(),
      value,
      observedAt,
      sourceUrl,
      collectionMethod: "manual-public-observation",
      status: "verified",
      notes: r[idx.notes]?.trim() || undefined,
    });
    added++;
  }
  db.snapshotsMeta.lastObservation = new Date().toISOString();
  writeFileSync(SNAPSHOTS, JSON.stringify(db, null, 2) + "\n");
  console.log(`Imported ${added} snapshot(s), skipped ${skipped} (invalid or duplicate).`);
}

main();
