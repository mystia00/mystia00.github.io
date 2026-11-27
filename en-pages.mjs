// 빌드가 끝난 뒤 한국어 페이지를 복사해서 /en/ 영문 페이지를 만듦.
// - .ko-only 블록 삭제, data-en 이름 교체, i18n.json 사전으로 글자 교체
// - 내부 링크를 /en/... 으로, hreflang·canonical·사이트맵 추가
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://mystiaguide.com';
const SITE_EN = "Mystia's Izakaya Notes";

async function walk(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const dec = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
const enc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encAttr = (s) => enc(s).replace(/"/g, '&quot;');

function makeTr(dict) {
  const w = (s) => (dict.words[s] !== undefined ? dict.words[s] : null);
  const wl = (s) => w(s) || s;
  const RULES = [
    [/^(\d[\d,]*)엔$/, (m) => `¥${m[1]}`],
    [/^(\d[\d,]*)엔 · (.+)$/, (m) => `¥${m[1]} · ${wl(m[2])}`],
    [/^방문 손님 (\d+)명$/, (m) => `${m[1]} guests`],
    [/^(.+) 방문 손님(?: (\d+)명)?$/, (m) => `${wl(m[1])} guests${m[2] ? ` (${m[2]})` : ''}`],
    [/^주문 멘트 (\d+)개$/, (m) => `${m[1]} order lines`],
    [/^(?:출현|등장): (.+)$/, (m) => `Appears in: ${m[1].split(', ').map(wl).join(', ')}`],
    [/^(.+) · 예산 (.+)$/, (m) => `${wl(m[1])} · Budget ${m[2]}`],
    [/^예산 (.+)$/, (m) => `Budget ${m[1]}`],
    [/^(\d+)개 지역$/, (m) => `${m[1]} ${m[1] === '1' ? 'area' : 'areas'}`],
    [/^(\d+)명$/, (m) => `${m[1]} guests`],
    [/^(\d+)개$/, (m) => `${m[1]}`],
    [/^레벨 (\d+) 달성(?: \+ (.+) 해금)?$/, (m) => `Reach Lv ${m[1]}${m[2] ? ` + unlock ${wl(m[2])}` : ''}`],
    [/^(.+) 인연 (\d+)레벨 보상$/, (m) => `${wl(m[1])} bond Lv ${m[2]} reward`],
    [/^서브 퀘스트 완료 \(원문: (.+)\)$/, (m) => `Side quest: ${m[1]}`],
    [/^섹션 제목: “(.+)”$/, (m) => `Section titled “${wl(m[1])}”`],
    [/^(.+) 추천 요리·술$/, (m) => `${wl(m[1])} — Best Dishes & Drinks`],
    [/^(.+) 레시피$/, (m) => `${wl(m[1])} Recipe`],
  ];
  return (text) => {
    const t = text.trim();
    if (!t || !/[가-힣]/.test(t)) return null;
    let out = w(t);
    if (out === null) {
      const q = t.match(/^[“"](.+)[”"]$/);
      if (q && dict.lines[q[1]]) out = `“${dict.lines[q[1]]}”`;
    }
    if (out === null && dict.lines[t]) out = dict.lines[t];
    if (out === null) {
      for (const [re, f] of RULES) {
        const m = t.match(re);
        if (m) {
          out = f(m);
          break;
        }
      }
    }
    if (out === null) return null;
    return text.replace(t, out);
  };
}

/** class 에 name 이 들어간 요소를 통째로 지움 (중첩 태그 고려) */
function removeByClass(html, name) {
  const open = new RegExp(`<([a-z][a-z0-9]*)\\b[^>]*\\bclass="[^"]*\\b${name}\\b[^"]*"[^>]*>`, 'i');
  let guard = 0;
  for (;;) {
    const m = open.exec(html);
    if (!m || guard++ > 500) return html;
    const tag = m[1].toLowerCase();
    const start = m.index;
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = start + m[0].length;
    let depth = 1;
    let end = -1;
    let x;
    while ((x = re.exec(html))) {
      if (x[0].endsWith('/>')) continue;
      depth += x[1] ? -1 : 1;
      if (depth === 0) {
        end = x.index + x[0].length;
        break;
      }
    }
    if (end < 0) return html;
    html = html.slice(0, start) + html.slice(end);
  }
}

const isPageHref = (h) => {
  if (!h.startsWith('/') || h.startsWith('//')) return false;
  if (/^\/(en|_astro|pagefind|icons)(\/|$)/.test(h)) return false;
  const p = h.split(/[?#]/)[0];
  return !/\.[a-z0-9]+$/i.test(p);
};

function toEn(html, urlPath, tr) {
  const enUrl = '/en' + urlPath;
  html = removeByClass(html, 'ko-only');

  // <html lang>
  html = html.replace(/<html([^>]*?)\blang="ko"/, '<html$1lang="en" data-lang="en"');

  // 제목
  const te = html.match(/data-title-en="([^"]*)"/);
  const titleEn = te ? dec(te[1]) : null;
  html = html.replace(/<title>([^<]*)<\/title>/, (all, t) => {
    const [page, site] = dec(t).split(' | ');
    const p = titleEn || (tr(page) ?? page);
    const s = site ? SITE_EN : '';
    return `<title>${enc(s && p !== s ? `${p} | ${s}` : p)}</title>`;
  });
  if (titleEn) html = html.replace(/(<h1[^>]*id="_top"[^>]*>)[^<]*(<\/h1>)/, `$1${enc(titleEn)}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${encAttr(titleEn || SITE_EN)}"`);
  html = html.replace(/(<meta property="og:site_name" content=")[^"]*"/, `$1${encAttr(SITE_EN)}"`);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*"/, '$1en_US"');
  const desc = `${titleEn || SITE_EN} — Touhou Mystia's Izakaya guide: guests' favorite dishes and drinks, recipes, events and DLC tips.`;
  html = html.replace(/(<meta name="description" content=")[^"]*"/, `$1${encAttr(desc)}"`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${encAttr(desc)}"`);

  // 주소: canonical, og:url
  const abs = SITE + urlPath;
  html = html.split(`"${abs}"`).join(`"${SITE}${enUrl}"`);

  // data-en 이름
  html = html.replace(/(<([a-z0-9]+)\b[^>]*\bdata-en="([^"]*)"[^>]*>)([^<]*)(<\/\2>)/gi, (all, open, tag, en, inner, close) =>
    `${open}${en}${close}`,
  );

  // 글자와 속성 번역 (script/style 안은 건드리지 않음)
  const parts = html.split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i]
      .replace(/>([^<]+)</g, (all, text) => {
        const out = tr(dec(text));
        return out === null ? all : `>${enc(out)}<`;
      })
      .replace(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g, (all, a, v) => {
        const out = tr(dec(v));
        return out === null ? all : `${a}="${encAttr(out)}"`;
      })
      .replace(/\bhref="([^"]*)"/g, (all, h) => (isPageHref(h) ? `href="/en${h}"` : all));
  }
  return parts.join('');
}

function hreflang(urlPath) {
  return (
    `<link rel="alternate" hreflang="ko" href="${SITE}${urlPath}">` +
    `<link rel="alternate" hreflang="en" href="${SITE}/en${urlPath}">` +
    `<link rel="alternate" hreflang="x-default" href="${SITE}${urlPath}">`
  );
}

export { toEn, makeTr, removeByClass };
export default function enPages() {
  return {
    name: 'en-pages',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const dict = JSON.parse(await fs.readFile(path.join(root, 'i18n.json'), 'utf8'));
        const tr = makeTr(dict);
        const files = (await walk(root)).filter((f) => !path.relative(root, f).startsWith('en' + path.sep));
        let n = 0;
        const added = [];
        for (const f of files) {
          const rel = path.relative(root, f).split(path.sep).join('/');
          let html = await fs.readFile(f, 'utf8');
          if (/http-equiv="refresh"/i.test(html) || rel === '404.html') continue;
          const urlPath = '/' + rel.replace(/index\.html$/, '');
          const en = toEn(html, urlPath, tr).replace('</head>', hreflang(urlPath) + '</head>');
          await fs.writeFile(f, removeByClass(html, 'en-only').replace('</head>', hreflang(urlPath) + '</head>'));
          const out = path.join(root, 'en', ...rel.split('/'));
          await fs.mkdir(path.dirname(out), { recursive: true });
          await fs.writeFile(out, en);
          added.push(`${SITE}/en${urlPath}`);
          n++;
        }
        // 사이트맵에 영문 주소 추가
        for (const sm of (await fs.readdir(root)).filter((x) => /^sitemap-\d+\.xml$/.test(x))) {
          const p = path.join(root, sm);
          let xml = await fs.readFile(p, 'utf8');
          const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => !u.startsWith(SITE + '/en/'));
          const extra = urls.map((u) => `<url><loc>${u.replace(SITE, SITE + '/en')}</loc></url>`).join('');
          xml = xml.replace('</urlset>', extra + '</urlset>');
          await fs.writeFile(p, xml);
        }
        logger.info(`영문 페이지 ${n}개 생성`);
      },
    },
  };
}
