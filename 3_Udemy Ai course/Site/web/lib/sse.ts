// Pure SSE helpers: turn OpenRouter's server-sent events into plain text deltas.

/** Extract the content delta from one SSE line, or null if the line carries none. */
export function parseSseLine(line: string): string | null {
  if (!line.startsWith("data:")) return null;
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return null;
  try {
    const delta = JSON.parse(data).choices?.[0]?.delta?.content;
    return typeof delta === "string" && delta ? delta : null;
  } catch {
    return null; // keep-alive / partial line
  }
}

/** TransformStream converting an SSE byte stream into a stream of text-delta bytes. */
export function sseToTextStream(): TransformStream<Uint8Array, Uint8Array> {
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const delta = parseSseLine(line);
        if (delta) ctl.enqueue(enc.encode(delta));
      }
    },
  });
}
