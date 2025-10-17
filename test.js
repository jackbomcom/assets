
(() => {
    'use strict';
    const hasJQ = !!(window.jQuery && window.$);
    if (!hasJQ) { console.error('[custom-init] jQuery is required'); return; }
    const $ = window.jQuery;
    const log = (...a) => console.debug('[custom-init]', ...a);
    const err = (...a) => console.error('[custom-init]', ...a);
    const State = { processing:new Set(), eventsBound:false, isMobile:()=>window.innerWidth<992 };
    const onceGuard = async (key, fn) => { if (State.processing.has(key)) return; State.processing.add(key); try { await fn(); } finally { State.processing.delete(key); } };
    const waitForEl = (selector, count = 1, root = document) => new Promise((resolve) => {
        const found = () => $(selector, root).length >= count;
        if (found()) return resolve($(selector, root));
        const obs = new MutationObserver(() => { if (found()) { obs.disconnect(); resolve($(selector, root)); } });
        obs.observe(root === document ? document.documentElement : root, { childList: true, subtree: true });
    });

    // ---------- Feature: Remove Last Bets section (id:kill-last-bets) ----------
    const killLastBets = async () => onceGuard('killLastBets', async () => {
        // CSS-level hard hide as first line of defense
        if (!document.getElementById('kill-last-bets-style')) {
            const st = document.createElement('style');
            st.id = 'kill-last-bets-style';
            st.textContent = `#last-bets-wrapper{display:none !important; visibility:hidden !important;}`;
            document.head.appendChild(st);
        }
        const yankAll = () => {
            const list = document.querySelectorAll('#last-bets-wrapper, [id="last-bets-wrapper"]');
            list.forEach(n => { try { n.remove(); } catch(_) {} });
        };
        yankAll();
        const mo = new MutationObserver(() => yankAll());
        mo.observe(document.documentElement, { childList: true, subtree: true });
        let sweeps = 0; const iv = setInterval(() => { yankAll(); if (++sweeps > 40) clearInterval(iv); }, 500);
    });

    async function handleRouteChange () {
        await killLastBets();
    }

    (async () => {
        try {
            await handleRouteChange();
            let lastPath = window.location.pathname;
            setInterval(() => {
                const p = window.location.pathname;
                if (p !== lastPath) { lastPath = p; handleRouteChange(); }
            }, 500);
        } catch (e) { err('bootstrap failed', e); }
    })();
})();
