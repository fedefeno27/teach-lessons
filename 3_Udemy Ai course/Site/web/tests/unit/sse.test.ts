import { describe, it, expect } from "vitest";
import { parseSseLine, sseToTextStream } from "@/lib/sse";

const ev = (content: string) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;

async function run(chunks: string[]): Promise<string> {
  const enc = new TextEncoder();
  const src = new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
  return new Response(src.pipeThrough(sseToTextStream())).text();
}

describe("parseSseLine", () => {
  it("extracts delta content", () => expect(parseSseLine(ev("Hi").trim())).toBe("Hi"));
  it("ignores non-data lines, [DONE], empty and malformed JSON", () => {
    expect(parseSseLine(": keep-alive")).toBeNull();
    expect(parseSseLine("data: [DONE]")).toBeNull();
    expect(parseSseLine("data:")).toBeNull();
    expect(parseSseLine("data: {not json")).toBeNull();
    expect(parseSseLine('data: {"choices":[{"delta":{}}]}')).toBeNull();
  });
});

describe("sseToTextStream", () => {
  it("concatenates deltas", async () => {
    expect(await run([ev("Hello"), ev(", world"), "data: [DONE]\n\n"])).toBe("Hello, world");
  });
  it("handles events split across chunks", async () => {
    const full = ev("split");
    expect(await run([full.slice(0, 10), full.slice(10, 25), full.slice(25)])).toBe("split");
  });
  it("handles multi-byte characters split across chunks", async () => {
    const bytes = new TextEncoder().encode(ev("caffè ☕"));
    const enc = new TextEncoder();
    const src = new ReadableStream<Uint8Array>({
      start(c) {
        for (let i = 0; i < bytes.length; i += 3) c.enqueue(bytes.slice(i, i + 3));
        c.close();
      },
    });
    void enc;
    expect(await new Response(src.pipeThrough(sseToTextStream())).text()).toBe("caffè ☕");
  });
  it("skips keep-alives and bad lines", async () => {
    expect(await run([": ping\n", "data: oops\n", ev("ok")])).toBe("ok");
  });
});
