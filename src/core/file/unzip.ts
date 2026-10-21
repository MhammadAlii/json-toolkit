export type UnzipResult = { ok: true; files: Map<string, Uint8Array> } | { ok: false; error: string };

// Real archives this tool reads (.xlsx) are far smaller; this stops a "zip bomb" from filling memory.
const maxTotal = 512 * 1024 * 1024;

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads the files of a ZIP archive (stored or deflated entries), from its central directory. */
export async function unzip(bytes: Uint8Array, wanted?: (name: string) => boolean): Promise<UnzipResult> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The end-of-central-directory record sits in the last 64 KB (after an optional comment).
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end === -1) return { ok: false, error: "This isn't a ZIP archive, or it's damaged." };
  const count = view.getUint16(end + 10, true);
  let at = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  const files = new Map<string, Uint8Array>();
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (at + 46 > bytes.length || view.getUint32(at, true) !== 0x02014b50) return { ok: false, error: "The archive's file list is damaged." };
    const method = view.getUint16(at + 10, true);
    const compressed = view.getUint32(at + 20, true);
    const size = view.getUint32(at + 24, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const local = view.getUint32(at + 42, true);
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extraLength + commentLength;
    if (name.endsWith("/") || (wanted && !wanted(name))) continue;
    if (compressed === 0xffffffff || size === 0xffffffff) return { ok: false, error: "ZIP64 archives (over 4 GB) aren't supported." };
    total += size;
    if (total > maxTotal) return { ok: false, error: "The archive unpacks to more than 512 MB, which is too large to read here." };
    if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50) return { ok: false, error: `The entry ${name} is damaged.` };
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + compressed);
    if (method === 0) files.set(name, data);
    else if (method === 8) {
      try {
        files.set(name, await inflate(data));
      } catch {
        return { ok: false, error: `The entry ${name} couldn't be decompressed; the file may be damaged.` };
      }
    } else return { ok: false, error: `The entry ${name} uses a compression method (${method}) that isn't supported.` };
  }
  return { ok: true, files };
}
