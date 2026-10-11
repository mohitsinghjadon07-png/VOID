import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const action = body?.action === "reset" ? "reset" : "login";
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!username || username.length < 3 || username.length > 64) {
      return action === "reset" ? json({ ok: true }) : json({ error: "Invalid credentials" }, 401);
    }

    const projectUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!projectUrl || !anonKey || !serviceRoleKey) {
      console.error("Required Supabase function environment variables are missing.");
      return json({ error: "Cloud authentication is not configured" }, 500);
    }

    const admin = createClient(projectUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const authClient = createClient(projectUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: email, error: lookupError } = await admin.rpc("void_email_for_username", {
      input_username: username,
    });

    // Do not reveal whether an account ID exists.
    if (action === "reset") {
      if (lookupError || !email) return json({ ok: true });
      const redirectTo = typeof body?.redirectTo === "string" ? body.redirectTo : undefined;
      const { error: resetError } = await authClient.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) console.error("Password recovery request could not be delivered.");
      // Same outward response for unknown accounts and mail delivery trouble avoids ID enumeration.
      return json({ ok: true });
    }

    if (!password || password.length > 1024 || lookupError || !email) {
      return json({ error: "Invalid credentials" }, 401);
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      // A generic response avoids disclosing whether the username or password was wrong.
      return json({ error: "Invalid credentials" }, 401);
    }

    return json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        token_type: data.session.token_type,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
    });
  } catch (error) {
    console.error("VOID login request failed:", error instanceof Error ? error.name : "unknown");
    return json({ error: "Unable to complete the request" }, 400);
  }
});
