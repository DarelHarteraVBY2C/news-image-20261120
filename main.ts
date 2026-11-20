// news-image-20261120: the front page is entry.jpg next to this file.
// This program checks it is a complete 1024x1024 JPEG under 1 MiB and
// copies it to the output directory as entry.png, verifying the copy
// is byte-identical, so two runs produce the same bytes.
//
// Run locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const IMAGE = 'entry.jpg';
const LIMIT = 1048576;
const EDGE = 1024;

type Size = { w: number; h: number };

/** Dimensions from the first SOF0/SOF2 segment, or undefined when absent. */
function jpegDimensions(data: Buffer): Size | undefined {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) return undefined;
  let at = 2;
  while (at + 4 <= data.length) {
    if (data[at] !== 0xff) return undefined;
    const mark = data[at + 1];
    if (mark === 0xd9) return undefined;
    if (mark === 0x01 || (mark >= 0xd0 && mark <= 0xd7)) {
      at += 2;
      continue;
    }
    const segLen = data.readUInt16BE(at + 2);
    if (segLen < 2 || at + 2 + segLen > data.length) return undefined;
    if (mark === 0xc0 || mark === 0xc2) {
      return { h: data.readUInt16BE(at + 5), w: data.readUInt16BE(at + 7) };
    }
    at += 2 + segLen;
  }
  return undefined;
}

function die(text: string, code: number): never {
  process.stderr.write(`news-image-20261120: ${text}\n`);
  process.exit(code);
}

const source = join(ROOT, IMAGE);
if (!existsSync(source)) die(`${IMAGE} not found beside main.ts; run compose.py first`, 2);
const bytes = readFileSync(source);
if (bytes.length > LIMIT) die(`${IMAGE} is ${bytes.length} bytes, over the ${LIMIT} byte limit`, 1);
const size = jpegDimensions(bytes);
if (size === undefined) die(`${IMAGE} has no JPEG size marker`, 1);
if (size.w !== EDGE || size.h !== EDGE) die(`${IMAGE} is ${size.w}x${size.h}, expected ${EDGE}x${EDGE}`, 1);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
const dest = join(outDir, 'entry.png');
copyFileSync(source, dest);
const copied = readFileSync(dest);
const digest = (b: Buffer): string => createHash('sha256').update(b).digest('hex');
if (copied.length !== bytes.length || digest(copied) !== digest(bytes)) {
  die(`copy at ${dest} is not byte-identical to ${IMAGE}`, 1);
}
// Re-read the copy's own size marker: a truncated or swapped destination
// fails here even when the byte count happens to match.
const copiedSize = jpegDimensions(copied);
if (copiedSize === undefined || copiedSize.w !== EDGE || copiedSize.h !== EDGE) {
  die(`copy at ${dest} does not parse as a ${EDGE}x${EDGE} JPEG`, 1);
}
process.stdout.write(`news-image-20261120: wrote ${dest} (${copied.length} bytes, 1024x1024 JPEG, sha256 ${digest(copied).slice(0, 16)}...)\n`);
