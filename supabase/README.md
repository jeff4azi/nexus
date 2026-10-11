# Supabase setup

1. Create a new Supabase project and put its URL and publishable (or legacy anon) key in a local `.env` file, using `.env.example` as the template.
2. Install the Supabase CLI, run `supabase login`, then from this repository run `supabase link --project-ref <new-project-ref>` and `supabase db push`.
3. In **Authentication > URL Configuration**, add the deployed site URL and `http://localhost:5173`. This is required for password-reset redirects.

The migrations create every table used by the portal, a private `documents` storage bucket, row-level security, profile creation from `auth.users`, and starter plans. Financial records and investment state deliberately have no client write policies: create or approve them from a trusted server/Edge Function using the service-role key.

## Initial admin accounts

After `supabase db push`, copy `.env.admin.example` to a private environment file, replace all placeholder emails and secrets, and run `node scripts/create-admins.mjs`. It creates or upgrades exactly three accounts: one `super_admin` and two `admin` accounts. The script needs the **service-role** key and must never run in a browser or expose that key.

The payment placeholder deliberately stores only amount, currency, provider state, and failure details. It does not accept or retain PAN, CVV, or expiry. Likewise, the optional identity field stores only an SSN's final four digits; use a dedicated compliant KYC provider before collecting a full SSN.
