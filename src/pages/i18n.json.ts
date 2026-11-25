// 영문 모드용 사전. 게임 데이터의 한국어 이름→영문 이름 + UI 문구 + 주문 멘트 영문.
import type { APIRoute } from 'astro';
import dishes from '../data/dishes.json';
import drinks from '../data/drinks.json';
import customers from '../data/customers.json';
import ingredients from '../data/ingredients.json';
import i18n from '../data/i18n.json';

export const GET: APIRoute = () => {
  const words: Record<string, string> = { ...i18n.ui, ...i18n.tags, ...i18n.regions, ...i18n.tools };
  for (const d of dishes as { ko?: string; en: string }[]) if (d.ko) words[d.ko] = d.en;
  for (const d of drinks as { ko: string; en: string }[]) words[d.ko] = d.en;
  for (const c of customers as { name: string; en: string }[]) words[c.name] = c.en;
  for (const [ko, v] of Object.entries(ingredients as Record<string, { en: string }>)) words[ko] = v.en;
  return new Response(JSON.stringify({ words, lines: i18n.lines }), { headers: { 'Content-Type': 'application/json' } });
};
