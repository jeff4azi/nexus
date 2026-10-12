/**
 * Edge Function: create-admin
 *
 * Called by the admin panel (super_admin only) to create a new admin account.
 * Uses the service-role key server-side so it never reaches the browser.
 *
 * POST body: { email, password, first_name, last_name }
 *
 * Deploy with:
 *   supabase functions deploy create-admin
 *
 * No secrets need to be set manually. SUPABASE_URL, SUPABASE_ANON_KEY, and
 * SUPABASE_SERVICE_ROLE_KEY are automatically injected by the Supabase runtime
 * into every Edge Function — you cannot and do not need to set them via
 * `supabase secrets set`.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    // 1. Verify the caller is authenticated and is a super_admin.
    //    We use the anon key + user JWT so RLS applies.
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const {
      data: { user },
      error: userErr,
    } = await anonClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile, error: profileErr } = await anonClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || callerProfile?.role !== "super_admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: super_admin only" }),
        {
          status: 403,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    // 2. Parse and validate the request body.
    const { email, password, first_name, last_name } = await req.json();

    if (!email || !password || !first_name || !last_name) {
      return new Response(
        JSON.stringify({
          error: "email, password, first_name and last_name are required",
        }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }
    if (password.length < 12) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 12 characters" }),
        {
          status: 400,
          headers: { ...CORS, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Create the auth user with the service-role client.
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: created, error: createErr } =
      await adminClient.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
        },
      });

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // 4. Stamp the profile with role = 'admin' and status = 'Active'.
    //    The handle_new_user trigger already created the row; we update it.
    const { error: stampErr } = await adminClient
      .from("profiles")
      .update({ role: "admin", account_status: "Active" })
      .eq("id", created.user.id);

    if (stampErr) {
      return new Response(JSON.stringify({ error: stampErr.message }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, id: created.user.id }),
      {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
