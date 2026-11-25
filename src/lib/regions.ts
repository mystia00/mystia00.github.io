// 지역 목록 + 지도 핀 위치(지도 그림 기준 %). 지역 페이지 주소는 slug.
import { allCustomers, base } from './match';

export const regions = [
  { name: '요괴 짐승길', slug: 'youkai-trail', x: 61.7, y: 64.9 },
  { name: '인간 마을', slug: 'human-village', x: 47.6, y: 65.2 },
  { name: '하쿠레이 신사', slug: 'hakurei-shrine', x: 66.9, y: 52.2 },
  { name: '홍마관', slug: 'scarlet-devil-mansion', x: 30.8, y: 52.1 },
  { name: '미혹의 죽림', slug: 'bamboo-forest', x: 68.1, y: 80.8 },
  { name: '백옥루', slug: 'hakugyokurou', x: 9.3, y: 12.6 },
  { name: '마법의 숲', slug: 'forest-of-magic', x: 18.4, y: 53.2 },
  { name: '요괴의 산', slug: 'youkai-mountain', x: 25.0, y: 33.3 },
  { name: '옛 지옥', slug: 'former-hell', x: 56.6, y: 52.1 },
  { name: '지령전', slug: 'chireiden', x: 47.1, y: 52.1 },
  { name: '명련사', slug: 'myouren-temple', x: 29.1, y: 69.1 },
  { name: '신령묘', slug: 'mausoleum', x: 21.9, y: 84.7 },
  { name: '태양의 밭', slug: 'garden-of-the-sun', x: 48.9, y: 85.0 },
  { name: '휘침성', slug: 'shining-needle-castle', x: 48.0, y: 34.3 },
  { name: '달의 도시', slug: 'lunar-capital', x: 81.3, y: 28.0 },
  { name: '마계', slug: 'makai', x: 87.4, y: 57.7 },
];

/** 그 지역에 오는 손님: 그 지역 희귀손님 먼저, 그다음 그 지역에 출현하는 특별손님 */
export const visitors = (r: string) => [
  ...allCustomers.filter((c) => c.region === r),
  ...allCustomers.filter((c) => c.region !== r && ((c as any).where ?? []).includes(r)),
];
export const regionUrl = (r: string) => `${base}/regions/${regions.find((x) => x.name === r)?.slug}/`;
