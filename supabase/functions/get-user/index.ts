// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, errorHandler } from "../utils.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") as string,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const res = await supabase.auth.admin.listUsers({
    perPage: Number.MAX_SAFE_INTEGER,
  });
  if (res.error) {
    return errorHandler(res.error, 500);
  }
  const { q, secret } = await req.json();

  if (secret !== Deno.env.get("SECRET")) {
    return errorHandler(new Error("unauthorized"), 401);
  }

  const user = res.data.users.find((user) => user.user_metadata.userName === q);

  if (!user) {
    return errorHandler(new Error("not find"), 404);
  }

  return new Response(
    JSON.stringify(user),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  1.5: supabase functions serve --no-verify-jwt --env-file ./supabase/.env.local
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-user' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

    for deploy:
    supabase functions deploy get-user --no-verify-jwt
*/
