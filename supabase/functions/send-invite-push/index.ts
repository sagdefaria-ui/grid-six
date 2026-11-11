import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");

webpush.setVapidDetails("mailto:contato@gridsix.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    if (!record) {
      return new Response(JSON.stringify({ error: "sem record" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // busca o nome de quem convidou
    const { data: fromProfile } = await supabase
      .from("profiles").select("callsign").eq("id", record.from_user).single();
    const fromName = fromProfile?.callsign || "Alguém";

    // busca as inscricoes push de quem recebeu o convite
    const { data: subs } = await supabase
      .from("push_subscriptions").select("*").eq("user_id", record.to_user);

    const notifPayload = JSON.stringify({
      title: "Grid Six — Convite de party",
      body: `${fromName} te convidou pra party ${record.party_code}`,
      url: "./",
    });

    const results = [];
    for (const sub of subs || []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notifPayload
        );
        results.push({ endpoint: sub.endpoint, ok: true });
      } catch (err) {
        results.push({ endpoint: sub.endpoint, ok: false, error: String(err) });
        // inscricao invalida/expirada: remove do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
