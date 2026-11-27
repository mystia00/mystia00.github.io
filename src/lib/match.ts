// 손님 취향과 요리 태그를 맞춰 보는 계산. 데이터 파일만 바뀌면 전부 자동으로 다시 계산돼요.
import customers from '../data/customers.json';
import dishes from '../data/dishes.json';
import icons from '../data/icons.json';

export type Customer = (typeof customers)[number] & { special?: boolean };
export type Dish = (typeof dishes)[number] & { icon?: string };

export const allCustomers = customers as Customer[];
export const allDishes = dishes as Dish[];

export const dishName = (d: Dish) => d.ko || d.en;
export const budgetMax = (c: Customer) => Number(String(c.budget).split('~')[1] ?? 0);

/** 요리가 손님 선호 태그를 몇 개 맞추는지. 싫어하는 태그가 하나라도 있으면 -1 */
export function score(c: Customer, d: Dish): number {
  if (d.tags.some((t) => c.dislike.includes(t))) return -1;
  return d.tags.filter((t) => c.like.includes(t)).length;
}

/** 손님별 추천 요리: 싫어하는 태그 없음, 선호 태그 2개 이상, 많이 맞는 순 → 싼 순 */
export function recommend(c: Customer, n = 6): { dish: Dish; hits: string[] }[] {
  return allDishes
    .map((d) => ({ dish: d, s: score(c, d) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s || a.dish.price - b.dish.price)
    .slice(0, n)
    .map((x) => ({ dish: x.dish, hits: x.dish.tags.filter((t) => c.like.includes(t)) }));
}

/** 이 요리를 좋아하는 손님 */
export function fans(d: Dish): { customer: Customer; hits: string[] }[] {
  return allCustomers
    .map((c) => ({ customer: c, s: score(c, d) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .map((x) => ({ customer: x.customer, hits: d.tags.filter((t) => x.customer.like.includes(t)) }));
}

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const dishUrl = (d: Dish) => `${base}/dishes/${d.id}/`;

const dishIcons = icons.dishes as Record<string, string>;
const portraits = icons.customers as Record<string, string>;
/** 요리 아이콘 주소 (없으면 null) */
export const dishIcon = (d: Dish) => (dishIcons[d.id] ? `${base}/icons/dishes/${d.id}.webp` : null);
/** 손님 초상 주소 (없으면 null) */
export const portrait = (name: string) => (portraits[name] ? `${base}/icons/customers/${encodeURIComponent(name)}.webp` : null);

// ── 영문/국문 전환용 ──
import ingredients from '../data/ingredients.json';
const ingMap = ingredients as Record<string, { slug: string; en: string }>;
const ingIcons = ((icons as any).ingredients ?? {}) as Record<string, string>;
/** 재료 영문 이름 */
export const ingEn = (ko: string) => ingMap[ko]?.en ?? ko;
/** 재료 아이콘 주소 (없으면 null) */
export const ingIcon = (ko: string) => (ingIcons[ko] && ingMap[ko] ? `${base}/icons/ingredients/${ingMap[ko].slug}.webp` : null);
/** 손님 영문 이름 */
export const custEn = (name: string) => allCustomers.find((c) => c.name === name)?.en ?? name;

// ── 특별손님 주문 멘트 ──
import orders from '../data/orders.json';
const ord = orders as Record<string, [string, string][]>;
/** 손님 주문 멘트 목록 [멘트, 태그] */
export const customerLines = (name: string) => ord[name] ?? [];
/** 이 요리로 응대 가능한 손님 멘트 (요리 태그와 맞는 주문, 선호 많이 맞는 손님 순) */
export function quotes(d: Dish, n = 3, first?: string): { customer: Customer; line: string; tag: string }[] {
  return fans(d)
    .sort((a, b) => Number(b.customer.name === first) - Number(a.customer.name === first))
    .flatMap((f) => {
      const o = customerLines(f.customer.name).find(([, t]) => d.tags.includes(t));
      return o ? [{ customer: f.customer, line: o[0], tag: o[1] }] : [];
    })
    .slice(0, n);
}

// ── 손님 개별 페이지 ──
import drinkData from '../data/drinks.json';
export type Drink = (typeof drinkData)[number];
export const allDrinks = drinkData as Drink[];
export const customerSlug = (c: { en: string }) => c.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/** 손님 개별 페이지 주소 */
export const customerUrl = (name: string) => {
  const c = allCustomers.find((x) => x.name === name);
  return c ? `${base}/customers/${customerSlug(c)}/` : `${base}/`;
};
/** 손님 술 태그를 많이 맞추는 술 (같으면 싼 것부터) */
export const drinkRecs = (want: string[], n = 4) =>
  allDrinks
    .map((d) => ({ d, s: d.tags.filter((t) => want.includes(t)).length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.d.price - b.d.price)
    .slice(0, n)
    .map((x) => x.d);
