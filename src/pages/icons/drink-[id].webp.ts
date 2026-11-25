// 빌드할 때 drink-icons.json의 술 아이콘을 /icons/drink-<id>.webp 파일로 만듦.
import type { APIRoute } from 'astro';
import icons from '../../data/drink-icons.json';

const map = icons as Record<string, string>;
export function getStaticPaths() {
  return Object.keys(map).map((id) => ({ params: { id } }));
}
export const GET: APIRoute = ({ params }) => {
  const b64 = map[params.id!].split(',')[1];
  return new Response(Buffer.from(b64, 'base64'), { headers: { 'Content-Type': 'image/webp' } });
};
