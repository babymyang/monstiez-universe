/**
 * Data validator CLI — refuses placeholder/unverified records (brief §5.6).
 * Usage: bun scripts/validate-data.ts  (exit 1 on blocking errors)
 * In production builds the same rules run via src/lib/validation.ts assertProductionSafe().
 */
import { validateData } from "../src/lib/validation";

const issues = validateData();
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

for (const i of issues) {
  const line = `[${i.severity.toUpperCase()}] ${i.file} · ${i.id}: ${i.problem}`;
  if (i.severity === "error") console.error(line);
  else console.warn(line);
}

console.log(`\n${errors.length} errors, ${warnings.length} warnings`);
if (errors.length > 0) {
  console.error("FAIL — placeholder or unverified records must be fixed before shipping.");
  process.exit(1);
}
console.log("PASS — data provenance checks OK.");
