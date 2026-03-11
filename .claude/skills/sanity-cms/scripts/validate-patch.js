#!/usr/bin/env node
/**
 * Validate a Sanity patch payload against a named Zod schema.
 *
 * Usage:
 *   node validate-patch.js --schema refetch-discussion --json '{ ... }'
 *   node validate-patch.js --schema refetch-discussion --file /tmp/payload.json
 *
 * Exits 0 on success, 1 on validation failure.
 */
import { parseArgs, outputJSON, outputError } from './lib/client.js';
import fs from 'fs';

const args = parseArgs(process.argv.slice(2));

if (!args.schema) {
  outputError(new Error('--schema is required (e.g., refetch-discussion)'));
  process.exit(1);
}

if (!args.json && !args.file) {
  outputError(new Error('--json or --file is required'));
  process.exit(1);
}

// Load the schema module
let schemaModule;
try {
  schemaModule = await import(`./schemas/${args.schema}.js`);
} catch {
  outputError(new Error(`Unknown schema: "${args.schema}". No file found at schemas/${args.schema}.js`));
  process.exit(1);
}

// Find the exported schema (first export ending in "Schema")
const schemaKey = Object.keys(schemaModule).find((k) => k.endsWith('Schema'));
if (!schemaKey) {
  outputError(new Error(`Schema file schemas/${args.schema}.js has no export ending in "Schema"`));
  process.exit(1);
}
const schema = schemaModule[schemaKey];

// Load the payload
let payload;
try {
  const raw = args.file ? fs.readFileSync(args.file, 'utf-8') : args.json;
  payload = JSON.parse(raw);
} catch (err) {
  outputError(new Error(`Failed to parse JSON: ${err.message}`));
  process.exit(1);
}

// Validate
const result = schema.safeParse(payload);

if (result.success) {
  outputJSON({ success: true, schema: args.schema, fieldCount: Object.keys(result.data).length });
} else {
  const issues = result.error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
  console.error(
    JSON.stringify({ success: false, schema: args.schema, errorCount: issues.length, errors: issues }, null, 2),
  );
  process.exit(1);
}
