// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import enPages from './en-pages.mjs';

// ★ 도메인을 사면 아래 주소를 내 도메인으로 바꾸세요. 예: 'https://mystia.kr'
const SITE = 'https://mystiaguide.com';

// ★ 애드센스 번호('ca-pub-...')는 깃헙 저장소 Settings › Variables에 PUBLIC_ADSENSE_ID로 넣어요.
//    비어 있으면 광고 스크립트를 넣지 않아요.
const ADSENSE_ID = process.env.PUBLIC_ADSENSE_ID ?? '';

export default defineConfig({
  site: SITE,
  // 예전 주소로 들어오면 첫 화면(손님별 추천 요리)으로
  redirects: { '/customers/favorites': '/' },
  integrations: [
    starlight({
      title: '야작식당 공략노트',
      description: '동방야작식당 희귀 손님 태그 검색, 요리·술 태그 정리, DLC 정리',
      defaultLocale: 'root',
      locales: { root: { label: '한국어', lang: 'ko' } },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      head: [
        // 네이버 서치어드바이저 소유확인
        { tag: 'link', attrs: { rel: 'alternate', type: 'application/rss+xml', title: '야작식당 공략노트', href: '/rss.xml' } },
        // 클라우드플레어 웹 애널리틱스 (조회수, 쿠키 없음)
        { tag: 'script', attrs: { defer: true, src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "13c6bfd1fcbc4dcd929686e56983d831"}' } },
        // 링크 미리보기 이미지 (카톡·디스코드·트위터 등)
        { tag: 'meta', attrs: { property: 'og:image', content: SITE + '/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: SITE + '/og.png' } },
        { tag: 'meta', attrs: { name: 'naver-site-verification', content: 'cd64907d1f8313c62fc1114eb849106262746e97' } },
        // 저장된 언어(없으면 브라우저 언어)에 맞는 주소로 보내기. 검색 로봇은 제외
        { tag: 'script', content: "(function(){var p=location.pathname,en=p==='/en'||p.indexOf('/en/')===0,s=null;try{s=localStorage.getItem('mystia-lang')}catch(e){}var a=s||(/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)||/^ko/i.test(navigator.language||'ko')?null:'en');var q=location.search+location.hash;if(a==='en'&&!en){location.replace('/en'+p+q);return}if(s==='ko'&&en){location.replace((p.slice(3)||'/')+q);return}document.documentElement.dataset.lang=en?'en':'ko'})()" },
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
            { label: '손님별 추천 요리', link: '/' },
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
    // 빌드 후 /en/ 영문 페이지 만들기
    enPages(),
  ],
});
