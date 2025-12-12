<script>
    (() => {

    var CFG = {
    flakes: 70,             // ekrandaki toplam tanecik
    minSize: 6,
    maxSize: 16,
    minDur: 6,              // saniye
    maxDur: 14,             // saniye
    wind: 30,               // px (sağa sola kayma)
    zIndex: 999999,
    pileMax: 120,           // px
    pileGrowPerHit: 0.6,    // her tanecik düştüğünde kaç px artsın (yaklaşık)
    meltPerSecond: 0.25     // 0 yaparsan erimez

    };

    // reduced motion
    try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
} catch (e) {}

    // --- Stil (tek sefer) ---
    if (!document.getElementById("simpleSnowStyle")) {
    var st = document.createElement("style");
    st.id = "simpleSnowStyle";
    st.textContent = `
#snow-wrap{position:fixed;inset:0;pointer-events:none;z-index:${CFG.zIndex};overflow:hidden}
.snowflake{position:absolute;top:-20px;border-radius:50%;background:rgba(255,255,255,.92);
  filter: drop-shadow(0 0 6px rgba(255,255,255,.25));
  animation-name:snow-fall; animation-timing-function:linear; animation-iteration-count:infinite;
}
@keyframes snow-fall{
  from { transform: translate3d(0,0,0); }
  to   { transform: translate3d(var(--drift), 110vh, 0); }
}
#snow-pile{
  position:fixed;left:0;right:0;bottom:0;height:0px;
  z-index:${CFG.zIndex};
  pointer-events:none;
  background: linear-gradient(to top, rgba(255,255,255,.95), rgba(220,235,255,.88));
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  box-shadow: 0 -10px 35px rgba(255,255,255,.12) inset;
  transform: translateZ(0);
}
`;
    document.head.appendChild(st);
}

    // --- DOM (tek sefer) ---
    var wrap = document.getElementById("snow-wrap");
    if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "snow-wrap";
    document.body.appendChild(wrap);
}

    var pileEl = document.getElementById("snow-pile");
    if (!pileEl) {
    pileEl = document.createElement("div");
    pileEl.id = "snow-pile";
    document.body.appendChild(pileEl);
}

    // --- Birikme ---
    var pile = 0;
    function setPile(h) {
    pile = Math.max(0, Math.min(CFG.pileMax, h));
    pileEl.style.height = pile.toFixed(1) + "px";
}

    // Erime döngüsü
    var last = performance.now();
    function melt(now) {
    var dt = (now - last) / 1000;
    last = now;
    if (CFG.meltPerSecond > 0) {
    setPile(pile - CFG.meltPerSecond * dt);
}
    requestAnimationFrame(melt);
}
    requestAnimationFrame(melt);

    // --- Kar taneleri oluştur ---
    function rnd(a, b) { return a + Math.random() * (b - a); }

    // önce temizle (aynı id ile tekrar eklenmişse)
    wrap.innerHTML = "";

    var W = window.innerWidth || 1200;

    for (var i = 0; i < CFG.flakes; i++) {
    var f = document.createElement("div");
    f.className = "snowflake";

    var size = rnd(CFG.minSize, CFG.maxSize);
    var left = rnd(0, 100); // vw
    var dur = rnd(CFG.minDur, CFG.maxDur);
    var delay = rnd(-CFG.maxDur, 0); // hemen başlasın
    var drift = rnd(-CFG.wind, CFG.wind);

    f.style.width = size + "px";
    f.style.height = size + "px";
    f.style.left = left + "vw";
    f.style.opacity = rnd(0.35, 0.95).toFixed(2);
    f.style.animationDuration = dur.toFixed(2) + "s";
    f.style.animationDelay = delay.toFixed(2) + "s";
    f.style.setProperty("--drift", drift.toFixed(1) + "px");

    // Her döngü bittiğinde (tanecik yere ulaştı sayalım) birikmeyi artır
    f.addEventListener("animationiteration", function () {
    setPile(pile + CFG.pileGrowPerHit);
});

    wrap.appendChild(f);
}

    // resize’da yeniden hizala
    window.addEventListener("resize", function () {
    W = window.innerWidth || W;
}, { passive: true });

})();
</script>
