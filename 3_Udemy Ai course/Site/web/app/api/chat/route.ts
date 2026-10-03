import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { MODEL, systemPrompt } from "@/lib/twin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Optional env override; falls back to the default if unset or not a number.
const num = (v: string | undefined, d: number) => {
  const n = v?.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : d;
};

const MAX_REPLY_TOKENS = num(process.env.CHAT_MAX_TOKENS, 500); // keeps answers short (~120 words) and cheap
const TEMPERATURE = num(process.env.CHAT_TEMPERATURE, 0.6); // low enough to stay factual, high enough to sound natural
const MAX_HISTORY = num(process.env.CHAT_MAX_HISTORY, 12); // most recent messages sent to the model
const MAX_MESSAGE_CHARS = num(process.env.CHAT_MAX_MESSAGE_CHARS, 800); // per-message cap on visitor input
const RATE_LIMIT_PER_MIN = 12;

const BodySchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().transform((s) => s.slice(0, MAX_MESSAGE_CHARS)), // truncate, don't reject
    }),
  ),
});
type Msg = z.infer<typeof BodySchema>["messages"][number];

// Rate limit to protect the API key. In production set the Upstash env vars so the
// limit is shared across serverless instances; otherwise fall back to in-memory
// (per instance only, fine for local dev).
const upstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(RATE_LIMIT_PER_MIN, "1 m"),
        prefix: "twin-chat",
      })
    : null;

const hits = new Map<string, number[]>();
function limitedInMemory(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  if (recent.length) hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
  return recent.length > RATE_LIMIT_PER_MIN;
}

async function limited(ip: string) {
  if (!upstash) return limitedInMemory(ip);
  try {
    return !(await upstash.limit(ip)).success;
  } catch (e) {
    console.error("[twin] rate limiter unavailable, using in-memory", e);
    return limitedInMemory(ip);
  }
}

// x-forwarded-for / x-real-ip are only trustworthy behind a host that sets them
// (e.g. Vercel overwrites them); on a bare server a client can spoof these headers.
function clientIp(req: Request) {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const first = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || "unknown";
}

const text = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY?.trim().replace(/^['"]|['"]$/g, "");
  if (!key) return text("The twin is not configured yet.", 500);

  if (await limited(clientIp(req))) return text("You're sending messages quickly. Please wait a moment.", 429);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return text("Bad request: body must be valid JSON.", 400);
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return text(`Bad request: ${[...issue.path].join(".") || "body"} ${issue.message}`, 400);
  }
  const messages: Msg[] = parsed.data.messages.slice(-MAX_HISTORY);
  if (!messages.length || messages[messages.length - 1].role !== "user")
    return text("Bad request: the last message must be from the user.", 400);

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
