#!/usr/bin/env bun
// Compress article images in place with sharp.
//
// Usage:
//   bun run images:compress [paths...]   # resize + recompress (default: content/)
//   bun run images:check [paths...]      # report only, no modifications
//
// Options:
//   --max-size <px>     max edge length (default 2000)
//   --quality <n>       JPEG/WebP quality (default 82)
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const maxEdge = Number(args[args.indexOf('--max-size') + 1]) || 2000;
const quality = Number(args[args.indexOf('--quality') + 1]) || 82;
const roots = args.filter((a) => !a.startsWith('--') && Number.isNaN(Number(a)));
const searchRoots = roots.length > 0 ? roots : ['content'];

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
// Keep original extension for these: PNG screenshots with few colors compress
// badly as JPEG. Everything photo-like is converted to .jpg.
const KEEP_EXT = new Set(['.webp']);

const formatFor = (ext) =>
  KEEP_EXT.has(ext) ? undefined : ext === '.png' ? 'jpeg' : ext === '.webp' ? 'webp' : 'jpeg';

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) yield p;
  }
}

const fmtKB = (n) => `${(n / 1024).toFixed(0)}KB`;
let totalBefore = 0;
let totalAfter = 0;

for (const root of searchRoots) {
  for await (const file of walk(root)) {
    const meta = await sharp(file).metadata();
    const longEdge = Math.max(meta.width, meta.height);
    const { size } = await stat(file);

    const oversize = longEdge > maxEdge;
    const tooHeavy = size > 500 * 1024;
    if (checkOnly) {
      if (oversize || tooHeavy) {
        console.log(
          `⚠ ${file}: ${meta.width}x${meta.height}, ${fmtKB(size)}${oversize ? `, long edge > ${maxEdge}px` : ''}${tooHeavy ? ', > 500KB' : ''}`,
        );
      }
      totalBefore += size;
      continue;
    }

    const img = sharp(file).rotate();
    if (!oversize && !tooHeavy) {
      console.log(`- ${file}: already ok (${meta.width}x${meta.height}, ${fmtKB(size)})`);
      totalBefore += size;
      totalAfter += size;
      continue;
    }
    if (oversize) img.resize({ width: maxEdge, height: maxEdge, fit: 'inside' });
    const outFormat = formatFor(extname(file).toLowerCase());
    if (outFormat) img.toFormat(outFormat, { quality });
    else img.webp({ quality });

    const tmp = join(file, '..', `.${basename(file)}.tmp`);
    const info = await img.toFile(tmp);
    const newExt = outFormat === 'jpeg' ? '.jpg' : extname(file);
    const dest = file.replace(/\.[^.]+$/, newExt);
    await rename(tmp, dest);
    if (dest !== file) await unlink(file);

    totalBefore += size;
    totalAfter += info.size;
    console.log(`✓ ${file}: ${meta.width}x${meta.height} ${fmtKB(size)} → ${info.width}x${info.height} ${fmtKB(info.size)}`);
  }
}

if (checkOnly) {
  console.log(`\nScanned ${fmtKB(totalBefore)} of images. No files were modified.`);
} else {
  console.log(`\nTotal: ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)}`);
}
