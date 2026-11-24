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
      description: '동방야작식당 한국어 공략: 희귀 손님 취향, 요리·술 태그, DLC 정리',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      head: ADSENSE_ID
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
        : [],
      sidebar: [
        {
          label: '시작하기',
          items: [
            { label: '초보자 가이드', slug: 'guide/beginner' },
            { label: '용어 대조표 (한·일·영)', slug: 'guide/terms' },
          ],
        },
        {
          label: '손님',
          items: [{ label: '희귀 손님 취향 정리', slug: 'customers/rare' }],
        },
        {
          label: '태그',
          items: [
            { label: '요리 태그', slug: 'tags/food' },
            { label: '술 태그', slug: 'tags/drink' },
          ],
        },
        {
          label: 'DLC·업데이트',
          items: [{ label: 'DLC와 업데이트 정리', slug: 'dlc' }],
        },
        {
          label: '사이트 정보',
          items: [
            { label: '소개', slug: 'about' },
            { label: '개인정보처리방침', slug: 'privacy' },
          ],
        },
      ],
    }),
  ],
});
