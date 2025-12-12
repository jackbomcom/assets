<script>
    (function () {
    function startSnow() {
        const prefersReduced =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        const CFG = {
            snowflakeCount: 120,
            spawnPerSecond: 35,
            minSize: 2,
            maxSize: 6,
            minSpeed: 35,
            maxSpeed: 120,
            wind: 20,
            sway: 18,
            accumulate: true,
            maxPileHeight: 120,
            meltPerSecond: 1.2,
            pileSoftness: 28
        };

        if (!document.getElementById("snowStyle")) {
            const style = document.createElement("style");
            style.id = "snowStyle";
            style.textContent =
                "#snowCanvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:999999}";
            document.head.appendChild(style);
        }

        let canvas = document.getElementById("snowCanvas");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "snowCanvas";
            document.body.appendChild(canvas);
        }
        const ctx = canvas.getContext("2d", { alpha: true });

        let W = 0, H = 0;
        const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

        function resize() {
            W = Math.floor(window.innerWidth);
            H = Math.floor(window.innerHeight);
            canvas.width = Math.floor(W * dpr);
            canvas.height = Math.floor(H * dpr);
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        window.addEventListener("resize", resize, { passive: true });
        resize();

        const rnd = (a, b) => a + Math.random() * (b - a);
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        const flakes = [];
        function makeFlake(x = rnd(0, W), y = rnd(-H, 0)) {
            const r = rnd(CFG.minSize, CFG.maxSize);
            return {
                x, y, r,
                vy: rnd(CFG.minSpeed, CFG.maxSpeed),
                vx: rnd(-CFG.wind, CFG.wind),
                phase: rnd(0, Math.PI * 2),
                sway: rnd(0.6, 1.4),
                opacity: rnd(0.45, 0.95)
            };
        }
        for (let i = 0; i < CFG.snowflakeCount; i++) flakes.push(makeFlake());

        let pile = 0;

        function drawPile(now) {
            if (!CFG.accumulate) return;
            if (pile <= 0.5) return;

            const yBase = H;
            const yTop = H - pile;

            const g = ctx.createLinearGradient(0, yTop, 0, yBase);
            g.addColorStop(0, "rgba(255,255,255,0.95)");
            g.addColorStop(1, "rgba(220,235,255,0.90)");

            ctx.save();
            ctx.globalAlpha = 0.95;
            ctx.fillStyle = g;

            ctx.beginPath();
            ctx.moveTo(0, yBase);

            const steps = 16;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = t * W;
                const wiggle = Math.sin((t * Math.PI * 2) + (now * 0.0006)) * (CFG.pileSoftness * 0.25);
                const wiggle2 = Math.sin((t * Math.PI * 6) + (now * 0.0009)) * (CFG.pileSoftness * 0.12);
                ctx.lineTo(x, yTop + wiggle + wiggle2);
            }

            ctx.lineTo(W, yBase);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        let last = performance.now();
        let spawnCarry = 0;

        function tick(now) {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            ctx.clearRect(0, 0, W, H);

            if (CFG.accumulate && CFG.meltPerSecond > 0) {
                pile = clamp(pile - CFG.meltPerSecond * dt, 0, CFG.maxPileHeight);
            }

            spawnCarry += CFG.spawnPerSecond * dt;
            const spawnN = Math.floor(spawnCarry);
            spawnCarry -= spawnN;

            for (let i = 0; i < spawnN; i++) {
                if (flakes.length < CFG.snowflakeCount * 2) flakes.push(makeFlake(rnd(0, W), rnd(-80, -10)));
            }

            for (let i = flakes.length - 1; i >= 0; i--) {
                const f = flakes[i];
                const swayX = Math.sin((now * 0.001) * (1.2 * f.sway) + f.phase) * CFG.sway;

                f.y += f.vy * dt;
                f.x += (f.vx + swayX) * dt;

                if (f.x < -20) f.x = W + 20;
                if (f.x > W + 20) f.x = -20;

                const groundY = H - (CFG.accumulate ? pile : 0);

                if (f.y >= groundY - f.r) {
                    if (CFG.accumulate) pile = clamp(pile + (0.06 + f.r * 0.02), 0, CFG.maxPileHeight);
                    flakes[i] = makeFlake(rnd(0, W), rnd(-120, -10));
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = f.opacity;
                ctx.fillStyle = "rgba(255,255,255,1)";
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            drawPile(now);
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }

    if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSnow, { once: true });
} else {
    startSnow();
}
})();
</script>
