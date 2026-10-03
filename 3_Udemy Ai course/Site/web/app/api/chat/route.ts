import { MODEL, systemPrompt } from "@/lib/twin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REPLY_TOKENS = 500; // keeps answers short (~120 words) and cheap
const TEMPERATURE = 0.6; // low enough to stay factual, high enough to sound natural
const MAX_HISTORY = 12; // most recent messages sent to the model
const MAX_MESSAGE_CHARS = 800; // per-message cap on visitor input
const RATE_LIMIT_PER_MIN = 12;

type Msg = { role: "user" | "assistant"; content: string };

// Minimal in-memory rate limit (per server instance) to protect the API key.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT_PER_MIN;
}

const text = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
  if (!key) return text("The twin is not configured yet.", 500);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) return text("You're sending messages quickly. Please wait a moment.", 429);

  let messages: Msg[];
  try {
    const body = await req.json();
    messages = (body.messages as Msg[])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  } catch {
    return text("Bad request.", 400);
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") return text("Bad request.", 400);

  const request = () =>
    fetch(`${process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Federico Fenoglio Digital Twin",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        max_tokens: MAX_REPLY_TOKENS,
        temperature: TEMPERATURE,
        messages: [{ role: "system", content: systemPrompt() }, ...messages],
      }),
    }).catch(() => null);

  // The free model is often briefly rate-limited upstream: retry with backoff.
  let upstream = await request();
  for (const wait of [1500, 3500, 6000]) {
    if (upstream && upstream.status !== 429 && upstream.status < 500) break;
    await new Promise((r) => setTimeout(r, wait));
    upstream = await request();
  }

  if (!upstream || !upstream.ok || !upstream.body) {
    const status = upstream?.status;
    console.error("[twin] OpenRouter error", status, upstream ? (await upstream.text()).slice(0, 300) : "network");
    return text(
      status === 429
        ? "The free model is busy right now. Please try again in a few seconds."
        : "The twin couldn't answer just now. Please try again.",
      502,
    );
  }

  // Convert OpenRouter's SSE stream into a plain text stream of content deltas.
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  const stream = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) ctl.enqueue(enc.encode(delta));
        } catch {
          /* ignore keep-alive / partial lines */
        }
      }
    },
  });

  return new Response(upstream.body.pipeThrough(stream), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
