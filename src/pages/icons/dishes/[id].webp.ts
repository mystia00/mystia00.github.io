// 빌드할 때 icons.json의 요리 아이콘을 /icons/dishes/<id>.webp 파일로 만들어요.
import type { APIRoute } from 'astro';
import icons from '../../../data/icons.json';

const map = icons.dishes as Record<string, string>;
export function getStaticPaths() {
  return Object.keys(map).map((id) => ({ params: { id } }));
}
export const GET: APIRoute = ({ params }) => {
  const b64 = map[params.id!].split(',')[1];
  return new Response(Buffer.from(b64, 'base64'), { headers: { 'Content-Type': 'image/webp' } });
};
