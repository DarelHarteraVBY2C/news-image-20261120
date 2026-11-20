// A working news-image-20261120 entry (Node 22, standard library only): its image is the
// entry.jpg beside this file, and the program copies it to /output/entry.png, validating it
// first: a whole JPEG, 1024 by 1024 pixels, at most 1 MiB, and byte-identical after the copy,
// so two runs write the same bytes. A starting point is not a winner: the image is the entry.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const IMAGE = 'entry.jpg';
const MAX_BYTES = 1_048_576;
const SIZE = 1024;

/** The image's dimensions out of its JPEG SOF0/SOF2 marker, or null when it has none. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let at = 2;
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 0xff) return null;
    const marker = bytes[at + 1];
    if (marker === 0xd9 || marker === 0x01) return null;
    if (marker >= 0xd0 && marker <= 0xd7) {
      at += 2;
      continue;
    }
    const len = bytes.readUInt16BE(at + 2);
    if (len < 2 || at + 2 + len > bytes.length) return null;
    if (marker === 0xc0 || marker === 0xc2) {
      return { height: bytes.readUInt16BE(at + 5), width: bytes.readUInt16BE(at + 7) };
    }
    at += 2 + len;
  }
  return null;
}

const src = join(here, IMAGE);
if (!existsSync(src)) {
  process.stderr.write(`news image: no ${IMAGE} beside main.ts: run compose.py first\n`);
  process.exit(2);
}
const bytes = readFileSync(src);
if (bytes.length > MAX_BYTES) {
  process.stderr.write(`news image: ${IMAGE} is ${bytes.length} bytes, over the ${MAX_BYTES} the gate takes\n`);
  process.exit(1);
}
const size = jpegSize(bytes);
if (size === null) {
  process.stderr.write(`news image: ${IMAGE} is not a JPEG with a size marker\n`);
  process.exit(1);
}
if (size.width !== SIZE || size.height !== SIZE) {
  process.stderr.write(`news image: ${IMAGE} is ${size.width}x${size.height}, the gate takes ${SIZE}x${SIZE}\n`);
  process.exit(1);
}

const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
const dest = join(out, 'entry.png');
copyFileSync(src, dest);
const copied = readFileSync(dest);
const sha = (b: Buffer): string => createHash('sha256').update(b).digest('hex');
if (sha(copied) !== sha(bytes) || copied.length !== bytes.length) {
  process.stderr.write(`news image: the copy to ${dest} is not byte-identical\n`);
  process.exit(1);
}
// Re-read the copy's own size marker: a truncated or swapped destination fails here
// even when the byte count happens to match.
const copiedSize = jpegSize(copied);
if (copiedSize === null || copiedSize.width !== SIZE || copiedSize.height !== SIZE) {
  process.stderr.write(`news image: the copy at ${dest} does not parse as a ${SIZE}x${SIZE} JPEG\n`);
  process.exit(1);
}
process.stdout.write(`news image: wrote ${dest} (${copied.length} bytes, ${SIZE}x${SIZE} JPEG, sha256 ${sha(copied).slice(0, 16)}...)\n`);
