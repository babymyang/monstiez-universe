/**
 * Generates public/sw-precache.json — the list of hashed /_next/static assets
 * for the current build, so the service worker can precache the full shell
 * at install time (first visit is enough for offline).
 * Run AFTER `next build` (see package.json build script).
 */
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const STATIC_DIR = join(process.cwd(), ".next", "static");
const OUT = join(process.cwd(), "public", "sw-precache.json");

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(STATIC_DIR).map((f) => "/_next/static/" + relative(STATIC_DIR, f).split("\\").join("/"));
writeFileSync(OUT, JSON.stringify(files, null, 0));
console.log(`sw-precache: ${files.length} assets listed`);
