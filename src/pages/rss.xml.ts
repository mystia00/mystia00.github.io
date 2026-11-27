// 네이버·구글 수집용 RSS. 글 페이지 + 요리 레시피 페이지 전부.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import dishes from '../data/dishes.json';

const SITE = 'https://mystiaguide.com';
const esc = (s: string) => s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');

export const GET: APIRoute = async () => {
  const now = new Date().toUTCString();
  const items: { title: string; link: string; desc: string }[] = [];
  for (const d of await getCollection('docs')) {
    const path = d.id === 'index' ? '' : d.id.endsWith('/index') ? d.id.slice(0, -6) : d.id;
    items.push({ title: d.data.title, link: SITE + '/' + (path ? path + '/' : ''), desc: d.data.description ?? '' });
  }
  for (const x of dishes as { id: string; ko?: string; en: string; price: number; ing: string[]; tags: string[] }[]) {
    const name = x.ko || x.en;
    items.push({
      title: name + ' 레시피',
      link: SITE + '/dishes/' + x.id + '/',
      desc: name + ' 재료: ' + x.ing.join(', ') + '. 태그: ' + x.tags.join(', ') + '. 가격 ' + x.price + '엔.',
    });
  }
  const body = items
    .map((i) => '<item><title>' + esc(i.title) + '</title><link>' + i.link + '</link><guid>' + i.link + '</guid><description>' + esc(i.desc) + '</description><pubDate>' + now + '</pubDate></item>')
    .join('');
  const xml = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>야작식당 공략노트</title><link>' + SITE + '/</link><description>동방야작식당 손님별 추천 요리, 요리 레시피, 이벤트·보스전 공략</description><language>ko</language><lastBuildDate>' + now + '</lastBuildDate>' + body + '</channel></rss>';
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
