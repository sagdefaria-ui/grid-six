import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = "gemini-3.6-flash";

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
    const { mimeType, data } = await req.json();

    const prompt = `Você é um assistente tático de airsoft. Analise esse documento de inteligência/briefing e responda SOMENTE com um JSON válido, sem nenhum texto antes ou depois, nesse formato exato:
{"resumo": "resumo curto da missão em português, até 4 frases", "pontos": [{"nome": "nome curto do ponto", "mgrs": "coordenada MGRS exata como aparece no documento"}]}
Liste em "pontos" todas as coordenadas em formato MGRS encontradas no documento. Se não encontrar nenhuma, retorne uma lista vazia em "pontos".`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: data } }
            ]
          }]
        }),
      }
    );

    const geminiJson = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(
        JSON.stringify({ error: geminiJson.error?.message || "Erro na Gemini" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Não consegui interpretar a resposta da IA", raw: text }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
