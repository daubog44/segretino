// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import generateKeyPair, { corsHeaders, errorHandler } from "../utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const { record } = await req.json();
  const { data, error } = await supabase.auth.admin.getUserById(record.userId);

  if (error) {
    return errorHandler(error, 500);
  }
  const { publicKey, privateKey } = await generateKeyPair(
    data.user.user_metadata.userName,
  );

  const updateTable = await supabase.from("partecipantsChatRoom").update({
    public_key: publicKey,
    private_key: privateKey,
  })
    .eq("id", record.id);

  if (updateTable.error) {
    return errorHandler(new Error(updateTable.error.message), 500);
  }
  // record.chatRoomId

  return new Response(
    "ok",
    { headers: { "Content-Type": "application/json" } },
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generete-keys' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

    supabase functions deploy generete-keys --no-verify-jwt

*/
