/* Konsola yapıştır — CSS'i URL'den çekip head sonuna sabitler.
   CSS_URL'i kendi dosyanızın adresiyle değiştirin. */
(async (CSS_URL = '/css/jackbom-theme.css') => {
  document.getElementById('jackbom-ember-theme')?.remove();
  const css = await (await fetch(CSS_URL, { cache: 'no-cache' })).text();
  const s = Object.assign(document.createElement('style'), { id: 'jackbom-ember-theme', textContent: css });
  document.head.appendChild(s);
  new MutationObserver(() => {
    if (document.head.lastElementChild !== s) document.head.appendChild(s);
  }).observe(document.head, { childList: true });
  console.log('%c[jackbom] tema yüklendi', 'color:#ee3524;font-weight:bold', css.length + ' karakter');
})();