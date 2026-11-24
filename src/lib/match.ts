// 손님 취향과 요리 태그를 맞춰 보는 계산. 데이터 파일만 바뀌면 전부 자동으로 다시 계산돼요.
import customers from '../data/customers.json';
import dishes from '../data/dishes.json';

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
