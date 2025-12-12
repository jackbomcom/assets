
<script>
    (() => {
    // ===== Ayarlar =====
    const CFG = {
    snowflakeCount: 120,        // aynı anda ekranda
    spawnPerSecond: 35,         // saniyede kaç yeni kar tanesi
    minSize: 2,
    maxSize: 6,
    minSpeed: 35,               // px/s
    maxSpeed: 120,
    wind: 20,                   // sağa sola rüzgar (px/s)
    sway: 18,                   // salınım şiddeti
    fps: 60,

    // Birikme
    accumulate: true,
    maxPileHeight: 120,         // px (ne kadar yükselsin)
    meltPerSecond: 1.2,         // erime (0 yaparsan birikim kalır)
    pileSoftness: 28            // üst dalgalılık
};

    // Tercih: reduced motion olanlarda kapat
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // ===== Stil =====
    const style = document.createElement("style");
    style.textContent = `
    #snowCanvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
    }
  `;
    document.head.appendChild(style);

    // ===== Canvas =====
    const canvas = document.createElement("canvas");
    canvas.id = "snowCanvas";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d", { alpha: true });

    let W = 0, H = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function resize() {
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
    window.addEventListener("resize", resize, { passive: true });
    resize();

    // ===== Kar Tanesi Modeli =====
    const rnd = (a,b)=>a+Math.random()*(b-a);
    const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

    const flakes = [];
    function makeFlake(x = rnd(0, W), y = rnd(-H, 0)) {
    const r = rnd(CFG.minSize, CFG.maxSize);
    const speed = rnd(CFG.minSpeed, CFG.maxSpeed);
    const phase = rnd(0, Math.PI * 2);
    return {
    x, y,
    r,
    vy: speed,
    vx: rnd(-CFG.wind, CFG.wind),
    phase,
    sway: rnd(0.6, 1.4),
    opacity: rnd(0.45, 0.95),
    alive: true
};
}

    // başlangıç doldur
    for (let i=0;i<CFG.snowflakeCount;i++) flakes.push(makeFlake());

    // ===== Birikme Katmanı =====
    let pile = 0; // px
    let lastAcc = 0;

    function drawPile() {
    if (!CFG.accumulate) return;

    // pile yüksekliği
    const h = pile;

    if (h <= 0.5) return;

    // Zeminde yumuşak dalgalı bir kar tepesi çiz
    const yBase = H;
    const yTop = H - h;

    ctx.save();
    ctx.globalAlpha = 0.95;

    // gradient: üstü daha parlak, altı daha koyu
    const g = ctx.createLinearGradient(0, yTop, 0, yBase);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(220,235,255,0.90)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, yBase);

    const steps = 16;
    for (let i=0;i<=steps;i++) {
    const t = i/steps;
    const x = t * W;
    const wiggle = Math.sin((t* Math.PI*2) + (performance.now()*0.0006)) * (CFG.pileSoftness * 0.25);
    const wiggle2 = Math.sin((t* Math.PI*6) + (performance.now()*0.0009)) * (CFG.pileSoftness * 0.12);
    const yy = yTop + wiggle + wiggle2;
    ctx.lineTo(x, yy);
}

    ctx.lineTo(W, yBase);
    ctx.closePath();
    ctx.fill();

    // hafif parıltı çizgisi
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i=0;i<=steps;i++) {
    const t = i/steps;
    const x = t * W;
    const wiggle = Math.sin((t* Math.PI*2) + (performance.now()*0.0006)) * (CFG.pileSoftness * 0.25);
    const wiggle2 = Math.sin((t* Math.PI*6) + (performance.now()*0.0009)) * (CFG.pileSoftness * 0.12);
    const yy = yTop + wiggle + wiggle2;
    if (i === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
}
    ctx.stroke();

    ctx.restore();
}

    // ===== Animasyon Döngüsü =====
    let last = performance.now();
    let spawnCarry = 0;

    function tick(now) {
    const dt = Math.min(0.033, (now - last) / 1000); // max 33ms
    last = now;

    ctx.clearRect(0,0,W,H);

    // erime
    if (CFG.accumulate && CFG.meltPerSecond > 0) {
    pile = clamp(pile - CFG.meltPerSecond * dt, 0, CFG.maxPileHeight);
}

    // spawn
    spawnCarry += CFG.spawnPerSecond * dt;
    const spawnN = Math.floor(spawnCarry);
    spawnCarry -= spawnN;

    for (let i=0;i<spawnN;i++) {
    if (flakes.length < CFG.snowflakeCount * 2) flakes.push(makeFlake(rnd(0,W), rnd(-80, -10)));
}

    // çizim + güncelleme
    for (let i=flakes.length-1;i>=0;i--) {
    const f = flakes[i];
    if (!f.alive) { flakes.splice(i,1); continue; }

    // salınım
    const swayX = Math.sin((now*0.001) * (1.2*f.sway) + f.phase) * CFG.sway;

    f.y += f.vy * dt;
    f.x += (f.vx + swayX) * dt;

    // wrap
    if (f.x < -20) f.x = W + 20;
    if (f.x > W + 20) f.x = -20;

    // zemine çarpma kontrolü (pile ile)
    const groundY = H - (CFG.accumulate ? pile : 0);
    if (f.y >= groundY - f.r) {
    // birikme artır
    if (CFG.accumulate) {
    // her çarpan tanecik az da olsa pile'ı yükseltsin
    pile = clamp(pile + (0.06 + f.r*0.02), 0, CFG.maxPileHeight);
}
    // taneyi yeniden yukarıdan başlat
    flakes[i] = makeFlake(rnd(0,W), rnd(-120, -10));
    continue;
}

    // kar tanesi çiz
    ctx.save();
    ctx.globalAlpha = f.opacity;
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
    ctx.fill();

    // minik highlight
    ctx.globalAlpha = f.opacity * 0.25;
    ctx.fillStyle = "rgba(230,245,255,1)";
    ctx.beginPath();
    ctx.arc(f.x - f.r*0.25, f.y - f.r*0.25, f.r*0.45, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
}

    // birikintiyi en son çiz (üstte görünür)
    drawPile();

    requestAnimationFrame(tick);
}

    requestAnimationFrame(tick);
})();
</script>
