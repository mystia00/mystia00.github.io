// 빌드할 때 icons.json의 재료 아이콘을 /icons/ingredients/<영문>.webp 파일로 만듦.
import type { APIRoute } from 'astro';
import icons from '../../../data/icons.json';
import ingredients from '../../../data/ingredients.json';

const map = ((icons as any).ingredients ?? {}) as Record<string, string>;
const ing = ingredients as Record<string, { slug: string; en: string }>;
export function getStaticPaths() {
  return Object.entries(ing)
    .filter(([ko]) => map[ko])
    .map(([ko, v]) => ({ params: { name: v.slug }, props: { ko } }));
}
export const GET: APIRoute = ({ props }) => {
  const b64 = map[(props as { ko: string }).ko].split(',')[1];
  return new Response(Buffer.from(b64, 'base64'), { headers: { 'Content-Type': 'image/webp' } });
};
