// 영문/국문 전환 + 맨 위로 버튼
(() => {
  const K = 'mystia-lang';
  const get = () => { try { return localStorage.getItem(K) || 'ko'; } catch { return 'ko'; } };
  const set = (l) => { try { localStorage.setItem(K, l); } catch {} };
  document.documentElement.dataset.lang = get();

  function apply(l) {
    document.documentElement.dataset.lang = l;
    for (const el of document.querySelectorAll('[data-en]')) {
      if (el.dataset.ko == null) el.dataset.ko = el.textContent;
      el.textContent = l === 'en' ? el.dataset.en : el.dataset.ko;
    }
    const t = document.querySelector('[data-title-en]');
    const h = document.querySelector('main h1');
    if (t && h) {
      if (h.dataset.ko == null) h.dataset.ko = h.textContent;
      h.textContent = l === 'en' ? t.dataset.titleEn : h.dataset.ko;
    }
    for (const b of document.querySelectorAll('.lang-sw button')) b.setAttribute('aria-pressed', String(b.dataset.l === l));
  }

  function init() {
    const sw = document.createElement('div');
    sw.className = 'lang-sw';
    sw.setAttribute('role', 'group');
    sw.setAttribute('aria-label', '이름 표기');
    sw.innerHTML = '<button type="button" data-l="ko">국문</button><button type="button" data-l="en">EN</button>';
    sw.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      set(b.dataset.l);
      apply(b.dataset.l);
    });
    const slot = document.querySelector('header .right-group') || document.querySelector('header');
    if (slot) slot.prepend(sw); else document.body.append(sw);

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

    apply(get());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
