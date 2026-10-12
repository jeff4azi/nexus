/**
 * Creates the superadmin account for Nexus Yield Group.
 * Run once on a trusted machine — safe to re-run (idempotent).
 *
 * Usage:
 *   node scripts/create-admins.mjs
 *
 * Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPER_ADMIN_PASSWORD
 * from your .env file automatically. No terminal env vars needed.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env from the project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envVars = readFileSync(envPath, "utf8");
for (const line of envVars.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex).trim();
  const value = trimmed.slice(eqIndex + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const SUPER_ADMIN_EMAIL = "superadmin@nexusyield.org";
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SUPER_ADMIN_PASSWORD;

if (!url) throw new Error("Missing SUPABASE_URL in .env");
if (!serviceRoleKey)
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env");
if (!password) throw new Error("Missing SUPER_ADMIN_PASSWORD in .env");
if (password.length < 8)
  throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters.");

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`\nSetting up super admin: ${SUPER_ADMIN_EMAIL}`);

// 1. Check if the auth user already exists
const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) throw listError;

let user = listed.users.find(
  (u) => u.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase(),
);

if (user) {
  console.log("  Auth user already exists — skipping creation.");
} else {
  // 2. Create the auth user (email pre-confirmed, no confirmation email needed)
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: SUPER_ADMIN_EMAIL,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Super", last_name: "Admin" },
    });
  if (createError) throw createError;
  user = created.user;
  console.log("  Auth user created.");
}

// 3. Stamp the profile row with super_admin role and Active status
const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: user.id,
      first_name: "Super",
      last_name: "Admin",
      role: "super_admin",
      account_status: "Active",
    },
    { onConflict: "id" },
  );

if (profileError) throw profileError;
console.log("  Profile stamped as super_admin / Active.");

console.log("\n✓ Done. You can now sign in at /login with:");
console.log(`  Email:    ${SUPER_ADMIN_EMAIL}`);
console.log(`  Password: (SUPER_ADMIN_PASSWORD from your .env)\n`);
