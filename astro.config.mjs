// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// ★ 도메인을 사면 아래 주소를 내 도메인으로 바꾸세요. 예: 'https://mystia.kr'
const SITE = 'https://example.com';

// ★ 애드센스 번호('ca-pub-...')는 깃헙 저장소 Settings › Variables에 PUBLIC_ADSENSE_ID로 넣어요.
//    비어 있으면 광고 스크립트를 넣지 않아요.
const ADSENSE_ID = process.env.PUBLIC_ADSENSE_ID ?? '';

export default defineConfig({
  site: SITE,
  integrations: [
    starlight({
      title: '야작식당 공략노트',
      description: '동방야작식당 희귀 손님 태그 검색, 요리·술 태그 정리, DLC 정리',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      head: [
        { tag: 'script', attrs: { src: '/site.js', defer: true } },
        ...(ADSENSE_ID
          ? [
              {
                tag: 'script',
                attrs: {
                  async: true,
                  src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`,
                  crossorigin: 'anonymous',
                },
              },
            ]
          : []),
      ],
      sidebar: [
        {
          label: '데이터',
          items: [
            { label: '손님별 추천 요리', slug: 'customers/favorites' },
            { label: '요리 레시피 전체', slug: 'dishes' },
            { label: '희귀·특별 손님 전체표', slug: 'customers/rare' },
            { label: '요리 태그별 손님', slug: 'tags/food' },
            { label: '술 태그별 손님', slug: 'tags/drink' },
          ],
        },
        {
          label: '이벤트 · 보스전',
          autogenerate: { directory: 'events' },
        },
        {
          label: '공략',
          items: [
            { label: '영업 기본기', slug: 'guide/beginner' },
            { label: '가성비 요리 모음', slug: 'guide/value-dishes' },
            { label: 'DLC 정리', slug: 'dlc' },
          ],
        },
        {
          label: '사이트',
          items: [
            { label: '소개', slug: 'about' },
            { label: '개인정보처리방침', slug: 'privacy' },
          ],
        },
      ],
    }),
  ],
});
