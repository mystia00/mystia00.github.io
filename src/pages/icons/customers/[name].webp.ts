// 빌드할 때 icons.json의 손님 초상을 /icons/customers/<이름>.webp 파일로 만들어요.
import type { APIRoute } from 'astro';
import icons from '../../../data/icons.json';

const map = icons.customers as Record<string, string>;
export function getStaticPaths() {
  return Object.keys(map).map((name) => ({ params: { name } }));
}
export const GET: APIRoute = ({ params }) => {
  const b64 = map[params.name!].split(',')[1];
  return new Response(Buffer.from(b64, 'base64'), { headers: { 'Content-Type': 'image/webp' } });
};
