/**
 * Creates the initial operations team. Run only on a trusted machine:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ADMIN_PASSWORD=... node scripts/create-admins.mjs
 *
 * The service-role key must never be put in VITE_ variables or committed.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.ADMIN_PASSWORD;
if (!url || !serviceRoleKey || !password) {
  throw new Error("SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_PASSWORD are required.");
}
if (password.length < 16) throw new Error("Use an ADMIN_PASSWORD with at least 16 characters.");

const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const administrators = [
  { email: process.env.ADMIN_1_EMAIL || "admin1@example.com", firstName: "Operations", lastName: "Admin", role: "super_admin" },
  { email: process.env.ADMIN_2_EMAIL || "admin2@example.com", firstName: "Payments", lastName: "Admin", role: "admin" },
  { email: process.env.ADMIN_3_EMAIL || "admin3@example.com", firstName: "Compliance", lastName: "Admin", role: "admin" },
];

for (const admin of administrators) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw listError;
  let user = listed.users.find((candidate) => candidate.email?.toLowerCase() === admin.email.toLowerCase());
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password,
      email_confirm: true,
      user_metadata: { first_name: admin.firstName, last_name: admin.lastName },
    });
    if (error) throw error;
    user = data.user;
  }
  const { error } = await supabase.from("profiles").update({ role: admin.role, account_status: "Active" }).eq("id", user.id);
  if (error) throw error;
  console.log(`Configured ${admin.role}: ${admin.email}`);
}
