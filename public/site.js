// 영문/국문 전환 + 맨 위로 버튼
// 영문 페이지(/en/...)는 빌드 때 이미 번역돼 있음. 여기선 버튼으로 주소를 오가고,
// 화면에서 새로 생기는 글자(검색 결과 개수 등)만 /i18n.json 사전으로 바꿈.
(() => {
  const K = 'mystia-lang';
  const set = (l) => { try { localStorage.setItem(K, l); } catch {} };
  // 언어는 주소로 정해짐: /en/... 은 영문, 나머지는 국문
  const P = location.pathname;
  const IS_EN = P === '/en' || P.startsWith('/en/');
  const LANG = IS_EN ? 'en' : 'ko';
  const other = (l) => {
    const rest = location.search + location.hash;
    if (l === 'en') return IS_EN ? null : '/en' + P + rest;
    return IS_EN ? (P.slice(3) || '/') + rest : null;
  };
  document.documentElement.dataset.lang = LANG;

  let dict = null;
  let loading = null;
  const orig = new WeakMap(); // 텍스트 노드 → 원래 한국어
  const origAttr = new WeakMap(); // 요소 → {속성: 원래 값}
  let origTitle = null;
  let observer = null;

  const load = () => {
    if (dict) return Promise.resolve(dict);
    if (!loading) loading = fetch('/i18n.json').then((r) => r.json()).then((d) => (dict = d)).catch(() => (dict = { words: {}, lines: {} }));
    return loading;
  };

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
  ];

  function tr(text) {
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
        if (m) { out = f(m); break; }
      }
    }
    if (out === null) return null;
    return text.replace(t, out);
  }

  const SKIP = 'script,style,.ko-only,[data-no-tr],.pagefind-ui__results';
  function walk(root, l) {
    if (root.nodeType === 3) return node(root, l);
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const list = [];
    let n;
    while ((n = it.nextNode())) list.push(n);
    list.forEach((x) => node(x, l));
    for (const el of root.querySelectorAll('[placeholder],[aria-label],[title]')) attrs(el, l);
  }
  function node(n, l) {
    if (l === 'en') {
      const cur = n.textContent;
      if (orig.has(n) && cur !== orig.get(n).en) orig.delete(n);
      if (orig.has(n)) return;
      const out = tr(cur);
      if (out !== null && out !== cur) {
        orig.set(n, { ko: cur, en: out });
        n.textContent = out;
      }
    } else if (orig.has(n)) {
      n.textContent = orig.get(n).ko;
      orig.delete(n);
    }
  }
  function attrs(el, l) {
    if (el.closest(SKIP)) return;
    const saved = origAttr.get(el) || {};
    for (const a of ['placeholder', 'aria-label', 'title']) {
      if (!el.hasAttribute(a)) continue;
      if (l === 'en') {
        const v = saved[a] !== undefined ? saved[a] : el.getAttribute(a);
        const out = tr(v);
        if (out !== null) { saved[a] = v; el.setAttribute(a, out); }
      } else if (saved[a] !== undefined) {
        el.setAttribute(a, saved[a]);
        delete saved[a];
      }
    }
    origAttr.set(el, saved);
  }

  // 오른쪽 목차: 지금 언어 블록에 있는 제목만 보이게
  function toc() {
    for (const a of document.querySelectorAll('starlight-toc a, mobile-starlight-toc a')) {
      const id = decodeURIComponent((a.getAttribute('href') || '').slice(1));
      const h = id && document.getElementById(id);
      const li = a.closest('li') || a;
      const blk = h && h.closest('.ko-only, .en-only');
      li.hidden = !!blk && getComputedStyle(blk).display === 'none';
    }
  }

  function names(l) {
    for (const el of document.querySelectorAll('[data-en]')) {
      if (el.dataset.ko == null) el.dataset.ko = el.textContent;
      el.textContent = l === 'en' ? el.dataset.en : el.dataset.ko;
    }
    const t = document.querySelector('[data-title-en]');
    const h = document.querySelector('main h1');
    if (origTitle === null) origTitle = document.title;
    if (t && h) {
      if (h.dataset.ko == null) h.dataset.ko = h.textContent;
      h.textContent = l === 'en' ? t.dataset.titleEn : h.dataset.ko;
    }
    if (l === 'en' && dict) {
      const site = w('야작식당 공략노트') || '';
      const [page] = origTitle.split(' | ');
      const p = (t && t.dataset.titleEn) || w(page) || page;
      document.title = site && p !== site ? `${p} | ${site}` : p;
    } else {
      document.title = origTitle;
    }
  }

  async function apply(l) {
    document.documentElement.dataset.lang = l;
    document.documentElement.lang = l === 'en' ? 'en' : 'ko';
    for (const b of document.querySelectorAll('.lang-sw button')) b.setAttribute('aria-pressed', String(b.dataset.l === l));
    if (l === 'en') await load();
    if (document.documentElement.dataset.lang !== l) return;
    names(l);
    walk(document.body, l);
    toc();
    if (l === 'en' && !observer) {
      observer = new MutationObserver((ms) => {
        if (document.documentElement.dataset.lang !== 'en') return;
        observer.disconnect();
        for (const m of ms) for (const n of m.addedNodes) walk(n, 'en');
        observer.observe(document.body, { childList: true, subtree: true });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } else if (l !== 'en' && observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function makeSwitch(extra) {
    const sw = document.createElement('div');
    sw.className = 'lang-sw' + (extra ? ' ' + extra : '');
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', '언어 / Language');
    sw.setAttribute('data-no-tr', '');
    sw.innerHTML = '<button type="button" data-l="ko">국문</button><button type="button" data-l="en">EN</button>';
    sw.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      set(b.dataset.l);
      const to = other(b.dataset.l);
      if (to) location.href = to;
    });
    return sw;
  }

  function init() {
    const slot = document.querySelector('header .right-group');
    if (slot) slot.prepend(makeSwitch());
    // 휴대폰: 오른쪽 메뉴가 숨겨지니 검색창 옆에 하나 더
    const search = document.querySelector('header site-search');
    if (search && search.parentElement) search.parentElement.append(makeSwitch('m'));
    else if (!slot) document.body.append(makeSwitch());

    const top = document.createElement('button');
    top.type = 'button';
    top.className = 'to-top';
    top.setAttribute('aria-label', '맨 위로');
    top.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7h4.5v7h5v-7H19z" fill="currentColor"/></svg>';
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.append(top);
    const onScroll = () => top.classList.toggle('show', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    apply(LANG);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
