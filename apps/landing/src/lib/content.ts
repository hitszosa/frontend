import type { ImageMetadata } from 'astro';

export type ContentImageSource = string | ImageMetadata;

export function contentPath(id: string): string {
  return id.endsWith('/index') ? id.slice(0, -'/index'.length) : id;
}
