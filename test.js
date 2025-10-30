/* eslint-disable */
(() => {
    "use strict";

    // ------------------------------
    // Guard helpers (avoid $/Swiper errors)
    // ------------------------------
    const get$ = () => (window.jQuery || window.$);
    const when = (cond, cb) => {
        const tick = () => (cond() ? cb() : setTimeout(tick, 100));
        tick();
    };

    const waitForElement = (selector, length = 0) =>
        new Promise((resolve) => {
            const tick = () => {
                const $ = get$();
                if ($ && $(selector).length > length) return resolve($(selector));
                setTimeout(tick, 100);
            };
            tick();
        });

    const waitForValue = (selector, length = 0) =>
        new Promise((resolve) => {
            const tick = () => {
                const $ = get$();
                if ($ && $(selector).length > length && $(selector).val() !== "") return resolve($(selector));
                setTimeout(tick, 100);
            };
            tick();
        });

    const waitForSwiper = (selector, language) =>
        new Promise((resolve) => {
            const tick = () => {
                const $ = get$();
                const el = $ && $(selector)[0];
                if (el && el.swiper && el.swiper.slides && el.swiper.slides.length) {
                    const slides = el.swiper.slides;
                    if (
                        slides.length > 2 &&
                        (!language || ($(slides[0]).find("a").attr("href") || "").includes(`/${language}`))
                    ) {
                        return resolve(slides);
                    }
                }
                setTimeout(tick, 100);
            };
            tick();
        });

    // ------------------------------
    // Safe stubs & state
    // ------------------------------
    let userVipState = null; // local shadow; we also mirror to window.userVipState when resolved
    let lastPathname = window.location.pathname;
    let isProcessingCustomizeSidebar = false;
    let isProcessingInitMainSlider = false;
    let isProcessingInitVipStatus = false;
    let isProcessingInitFullBanner = false;
    let isProcessingInitGamesLanding = false;
    let isProcessingInitCryptoSlider = false;

    // Fallback no-op: will be (re)assigned below.
    let handleRouteChange = () => {
        // 💡 Perf CSS (tek sefer)
        if (!document.getElementById("custom-perf-css")) {
            const st = document.createElement("style");
            st.id = "custom-perf-css";
            st.textContent = `
        #custom-section-1 .swiper, #custom-section-4 .swiper, #custom-section-5 .swiper { will-change: transform; contain: layout paint style; }
        #custom-section-1 .swiper-wrapper, #custom-section-4 .swiper-wrapper, #custom-section-5 .swiper-wrapper { will-change: transform; }
        #custom-section-1 .swiper-slide, #custom-section-4 .swiper-slide, #custom-section-5 .swiper-slide { backface-visibility: hidden; transform: translateZ(0); }
        #custom-section-4 img, #custom-section-1 img, #custom-section-5 img { content-visibility: auto; max-width: 100%; height: auto; }
        #custom-section-1 .swiper-button-prev, #custom-section-1 .swiper-button-next,
        #custom-section-4 .swiper-button-prev, #custom-section-4 .swiper-button-next { touch-action: manipulation; }
      `;
            document.head.appendChild(st);
        }

        const isMobile = window.matchMedia && window.matchMedia("(max-width: 1023px)").matches;
        const isHomePage = /^(\/(tr|en|ru|fr|ch|it|ar)\/?|\/)$/i.test(window.location.pathname);
        const isUserLoggedIn = !!(document.querySelector("header #dropdownUser") || document.querySelector(".header__wallet"));

        customizeSidebar(isMobile, isHomePage, isUserLoggedIn);
        initMainSlider(isMobile);
        initVipStatus(isUserLoggedIn);
        initFullBanner(isMobile, isUserLoggedIn);
        initGamesLanding(isUserLoggedIn);
        initCryptoSlider(isUserLoggedIn);
    };

    // ------------------------------
    // XHR monkey-patch (with strict try/catch and no hard deps)
    // ------------------------------
    try {
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, ...rest) {
            try {
                this._url = url;
                this._method = method;

                const currentPathname = window.location.pathname;
                if (currentPathname !== lastPathname) {
                    lastPathname = currentPathname;
                    // Defer to next tick so our handlers are defined
                    setTimeout(() => handleRouteChange(), 0);
                }

                // Some flows (verify/logout) often imply UI/state changes
                if (typeof url === "string" && (url.includes("verify") || url.includes("logout"))) {
                    setTimeout(() => handleRouteChange(), 0);
                }
            } catch (e) {
                console.error(e);
            }
            return originalXHROpen.apply(this, [method, url, ...rest]);
        };

        XMLHttpRequest.prototype.send = function (...args) {
            try {
                this.addEventListener("readystatechange", function () {
                    try {
                        if (this.readyState === 4 && typeof this._url === "string" && this._url.includes("state/") && !userVipState) {
                            const json = JSON.parse(this.responseText || "{}");
                            const state = json && json.data;
                            if (state) {
                                userVipState = state;
                                window.userVipState = state;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                });
            } catch (e) {
                console.error(e);
            }
            return originalXHRSend.apply(this, args);
        };
    } catch (error) {
        console.error(error);
    }

    // ------------------------------
    // Section 0 — Sidebar customization
    // ------------------------------
    const customizeSidebar = async (isMobile, isHomePage, isUserLoggedIn) => {
        if (isProcessingCustomizeSidebar) return;
        isProcessingCustomizeSidebar = true;

        const $ = get$();
        if (!$) {
            isProcessingCustomizeSidebar = false;
            return;
        }

        try {
            // Temizlik
            if ($(".sidebar .custom, .header .custom").length) $(".sidebar .custom, .header .custom").remove();

            const language = window.localStorage.language || "tr";

            const langMap = {
                tr: {
                    telegramChannel: "Telegram Kanalı",
                    telegramSupport: "Telegram Destek",
                    whatsappSupport: "WhatsApp Destek",
                    liveTV: "Jackbom Canlı TV",
                    mobileApp: "Mobil Uygulama",
                    promotions: "Promosyonlar",
                    howToInvest: "Nasıl Yatırım Yaparım?",
                    bigWins: "Büyük Kazançlar",
                    new: "Yeni",
                    live: "Live",
                },
                en: {
                    telegramChannel: "Telegram Channel",
                    telegramSupport: "Telegram Support",
                    whatsappSupport: "WhatsApp Support",
                    liveTV: "Jackbom Live TV",
                    mobileApp: "Mobile Application",
                    promotions: "Promotions",
                    howToInvest: "How To Invest?",
                    bigWins: "Big Wins",
                    new: "New",
                    live: "Live",
                },
                ru: {
                    telegramChannel: "Канал В Telegram",
                    telegramSupport: "Поддержка В Telegram",
                    whatsappSupport: "Поддержка В WhatsApp",
                    liveTV: "Jackbom ТВ В Прямом Эфире",
                    mobileApp: "Мобильное Приложение",
                    promotions: "Акции",
                    howToInvest: "Как Инвестировать?",
                    bigWins: "Большие Выигрыши",
                    new: "Новый",
                    live: "Живой",
                },
                fr: {
                    telegramChannel: "Chaîne Telegram",
                    telegramSupport: "Support Telegram",
                    whatsappSupport: "Support WhatsApp",
                    liveTV: "Jackbom TV En Direct",
                    mobileApp: "Application Mobile",
                    promotions: "Promotions",
                    howToInvest: "Comment Investir?",
                    bigWins: "Gros Gains",
                    new: "Nouveau",
                    live: "En Direct",
                },
                ch: {
                    telegramChannel: "电报频道",
                    telegramSupport: "电报支持",
                    whatsappSupport: "WhatsApp 支持",
                    liveTV: "Jackbom 直播电视",
                    mobileApp: "移动应用",
                    promotions: "促销",
                    howToInvest: "如何投资？",
                    bigWins: "大赢家",
                    new: "新的",
                    live: "直播",
                },
                it: {
                    telegramChannel: "Canale Telegram",
                    telegramSupport: "Supporto Telegram",
                    whatsappSupport: "Supporto WhatsApp",
                    liveTV: "Jackbom TV In Diretta",
                    mobileApp: "Applicazione Mobile",
                    promotions: "Promozioni",
                    howToInvest: "Come Investire?",
                    bigWins: "Grandi Vincite",
                    new: "Nuovo",
                    live: "Dal Vivo",
                },
                ar: {
                    telegramChannel: "قناة تيليجرام",
                    telegramSupport: "دعم تيليجرام",
                    whatsappSupport: "دعم واتساب",
                    liveTV: "جاكبوم تلفزيون مباشر",
                    mobileApp: "تطبيق الهاتف المحمول",
                    promotions: "عروض ترويجية",
                    howToInvest: "كيف تستثمر؟",
                    bigWins: "أرباح كبيرة",
                    new: "جديد",
                    live: "مباشر",
                },
            };

            const menuItems = [
                { name: "Instagram", url: "https://www.instagram.com/jackbomresmi", icon: "fa-brands fa-instagram" },
                { name: "Twitter", url: "https://x.com/jackbom_tr", icon: "fa-brands fa-x-twitter" },
                { name: "YouTube", url: "https://www.youtube.com/@Jackbomyt", icon: "fa-brands fa-youtube" },
                { name: langMap[language].telegramChannel, url: "https://t.me/jackbomtr", icon: "fa-brands fa-telegram" },
                { name: langMap[language].whatsappSupport, url: "https://api.whatsapp.com/send/?phone=33753456653&text&type=phone_number&app_absent=0", icon: "fa-brands fa-whatsapp" },
                { name: langMap[language].telegramSupport, url: "https://t.me/+37258520425", icon: "fa-brands fa-telegram" },
                { name: langMap[language].liveTV, url: "https://jackbomtv8.com", icon: "fa-solid fa-circle-play" },
                { name: langMap[language].mobileApp, url: "https://jackbom.app", icon: "fa-solid fa-mobile-screen" },
            ];

            const sidebarMenuHtml = `
        <div class="sidebar__menu custom">
          <div class="sidebar__title">${(language === "tr" ? "Linkler" : "Links")}</div>
          <ul class="sidebar__nav">
            ${menuItems
                .map(
                    (item) => `
                  <li class="sidebar__item">
                    <a class="sidebar__link" href="${item.url}" target="_blank" rel="noopener">
                      <i class="${item.icon}"></i>
                      <span>${item.name}</span>
                    </a>
                  </li>`
                )
                .join("")}
          </ul>
        </div>`;

            const headerButtons = `
        <div class="header__actions custom">
          <a class="btn btn--accent" href="https://jackbomtv8.com" target="_blank" rel="noopener">Jack TV</a>
          ${language === "tr" ? `<button type="button" class="btn btn--ghost howto2-desktop">${langMap[language].howToInvest}</button>` : ""}
        </div>`;

            $(document).on("click", '.sidebar__links.custom-promo a:not([class*="howto"]), .sidebar__link-small.custom-promo', function () {
                const btn = document.querySelector('.sidebar__big a[href*="/promotions"]:not(a[href*="?"])');
                if (btn) btn.click();
            });

            $(document).on("click", '.sidebar__links.custom-promo a[class*="howto"], .howto2-desktop', function () {
                if (!document.getElementById("custom-modal-howto")) {
                    openPopup(isMobile);
                }
            });

            $(document).on("click", ".sidebar__links .custom-live, .sidebar__link-small.custom-live", function () {
                const btn = document.querySelector('.sidebar__big a[href*="/live-casino"]:not(a[href*="?"])');
                if (btn) btn.click();
            });

            $(document).on("click", ".sidebar__lang-menu a", function () {
                if (isMobile && isHomePage) {
                    const targetPath = ($(this).find("span").text() || "").toLowerCase();
                    if (targetPath) window.location.href = `${window.location.origin}/${targetPath}/`;
                }
            });

            $(document).on("click", '.sidebar__link--casino[href*=sportsbook]', function () {
                if (isMobile) {
                    const lowbarBtn = document.querySelector(".lowbar__btn--menu");
                    if (lowbarBtn) lowbarBtn.click();
                }
            });

            // Inject menu into sidebar
            const sidebarBigMenu = await waitForElement(".sidebar__big > .sidebar__menu");
            sidebarBigMenu.append(sidebarMenuHtml);

            const headerActions = await waitForElement(".header__actions");
            headerActions.prepend(headerButtons);

            $(".header__wallet").addClass("glow-on-hover");
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingCustomizeSidebar = false;
        }
    };

    // ------------------------------
    // Remove tournament-leaderboard / "Son Kazananlar"
    // ------------------------------
    const removeBlock = () => {
        const byId = document.getElementById("tournament-leaderboard");
        if (byId) {
            byId.remove();
            return true;
        }
        const headings = [...document.querySelectorAll("h2.post__title")];
        for (const h of headings) {
            if ((h.textContent || "").trim().toLowerCase() === "son kazananlar") {
                (h.closest(".content") || h).remove();
                return true;
            }
        }
        return false;
    };

    let removed = removeBlock();
    new MutationObserver(() => { if (!removed) removed = removeBlock(); })
        .observe(document.body, { childList: true, subtree: true });

    // Expand wheel column on /tr/ or /tr/wheel
    const path = location.pathname;
    const shouldExpandWheel = /^\/tr(\/wheel)?\/?$/.test(path);

    const swapClass = (el, fromCls, toCls) => {
        if (!el || !el.classList.contains(fromCls)) return false;
        el.classList.remove(fromCls);
        el.classList.add(toCls);
        return true;
    };

    const expandWheelColumn = () => {
        const wheelRoots = [
            document.getElementById("general-everything"),
            document.getElementById("general-wheel"),
            document.querySelector("#wheel-container"),
        ].filter(Boolean);

        for (const root of wheelRoots) {
            const col = root.closest(".col-12.col-xxl-7");
            if (col && swapClass(col, "col-xxl-7", "col-xxl-12")) return true;
        }

        const possibleCols = document.querySelectorAll(".col-12.col-xxl-7");
        for (const col of possibleCols) {
            if (col.querySelector("#general-everything, #general-wheel, #wheel-container, #wheel")) {
                if (swapClass(col, "col-xxl-7", "col-xxl-12")) return true;
            }
        }
        return false;
    };

    if (shouldExpandWheel) {
        let done = expandWheelColumn();
        const obs = new MutationObserver(() => { if (!done) done = expandWheelColumn(); });
        const startObs = () => {
            if (!document.body) return;
            obs.observe(document.body, { childList: true, subtree: true });
        };
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => { done = expandWheelColumn() || done; startObs(); });
        } else {
            startObs();
        }
    }

    // ------------------------------
    // Section 1 — Main slider clone to custom section
    // ------------------------------
    const initMainSlider = async (isMobile) => {
        if (isProcessingInitMainSlider) return;
        isProcessingInitMainSlider = true;

        const $ = get$();
        if (!$) { isProcessingInitMainSlider = false; return; }

        try {
            if ($("#custom-section-1").length) $("#custom-section-1").remove();

            const language = window.localStorage.language || "tr";
            const mainContent = await waitForElement("#main__content");

            window.sliderItems = window.sliderItems || {};

            if (!window.sliderItems[language] || !window.sliderItems[language].length) {
                await waitForSwiper("#main-slider .mySwiper", language);
                const slides = (document.querySelector("#main-slider .mySwiper") || {}).swiper?.slides || [];

                const cleaned = Array.from(slides).map((e) => {
                    const div = document.createElement("div");
                    div.innerHTML = e.innerHTML.replace(/href="\/[a-z]{2}https/g, 'href="https');
                    return { html: div.innerHTML, idx: parseInt(e.dataset.swiperSlideIndex || "0", 10) || 0 };
                });

                cleaned.sort((a, b) => b.idx - a.idx);
                window.sliderItems[language] = cleaned.map((x) => x.html);
            }

            const selected = window.sliderItems[language];

            const sectionHtml = `
        <section id="custom-section-1" class="section custom-section mini-slider">
          <div class="container">
            <div class="swiper">
              <div class="swiper-wrapper">
                ${selected.map((html) => `<div class=\"swiper-slide\">${html}</div>`).join("")}
              </div>
              <div class="swiper-pagination"></div>
              <div class="swiper-button-prev"></div>
              <div class="swiper-button-next"></div>
            </div>
          </div>
        </section>`;

            mainContent.prepend(sectionHtml);

            if (window.Swiper) {
                const mainSwiper = new window.Swiper("#custom-section-1 .swiper", {
                    // ⚙️ Mobile kaydırma için optimize edilmiş ayarlar
                    loop: !isMobile, // mobilde loop kapalı (DOM kopyalama -> jank)
                    autoplay: { delay: 3000, disableOnInteraction: false },
                    slidesPerView: !isMobile ? 2 : 1,
                    spaceBetween: !isMobile ? 20 : 12,
                    centeredSlides: !!isMobile,
                    pagination: { el: "#custom-section-1 .swiper-pagination", type: !isMobile ? "bullets" : "progressbar" },
                    navigation: { prevEl: "#custom-section-1 .swiper-button-prev", nextEl: "#custom-section-1 .swiper-button-next" },

                    // 🚀 Perf tweaks
                    speed: 450,
                    roundLengths: true,
                    resistanceRatio: 0.5,
                    threshold: 8,
                    touchRatio: 1,
                    followFinger: true,
                    touchStartPreventDefault: false,
                    cssMode: false,
                    preloadImages: false,
                    lazy: { loadPrevNext: true, loadPrevNextAmount: 2 },
                    watchSlidesProgress: false,
                    updateOnWindowResize: false,
                });

                // 🚀 Butonlara basınca hızlı kaydırma
                const fastSlide = (dir) => {
                    const prevSpeed = mainSwiper.params.speed;
                    mainSwiper.params.speed = 200; // hızlı kayma (200 ms)
                    if (dir === "next") mainSwiper.slideNext();
                    else mainSwiper.slidePrev();
                    setTimeout(() => { mainSwiper.params.speed = prevSpeed; }, 300);
                };

                document
                    .querySelector("#custom-section-1 .swiper-button-prev")
                    ?.addEventListener("click", (e) => { e.preventDefault(); fastSlide("prev"); });

                document
                    .querySelector("#custom-section-1 .swiper-button-next")
                    ?.addEventListener("click", (e) => { e.preventDefault(); fastSlide("next"); });
            }

            const mainSlider = document.querySelector("#main-slider");
            if (mainSlider) mainSlider.style.display = "none";
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitMainSlider = false;
        }
    };

    // ------------------------------
    // Section 2 — VIP status cards (only when logged in)
    // ------------------------------
    const initVipStatus = async (isUserLoggedIn) => {
        if (isProcessingInitVipStatus) return;
        isProcessingInitVipStatus = true;

        const $ = get$();
        if (!$) { isProcessingInitVipStatus = false; return; }

        try {
            if ($("#custom-section-2").length) $("#custom-section-2").remove();
            if (!isUserLoggedIn) return;

            await waitForElement('.section:not(.custom-section) #next-rank img[src]:not([src=""])');

            const language = window.localStorage.language || "tr";
            const state = window.userVipState || userVipState;
            if (!state) return;

            const formatTimestamp = (timestamp) => {
                const date = new Date(timestamp * 1000);
                // Server tz -> TR (+3)
                date.setHours(date.getHours() + 3);
                const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
                return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear().toString().slice(-2)}`;
            };

            const registration = formatTimestamp(state.registration);

            const sectionHtml = `
        <section id="custom-section-2" class="section custom-section vip">
          <div class="container">
            <div class="cards">
              <div class="card vip-status" data-href="casino">
                <div class="card__body">
                  <div class="title">${state.username}</div>
                  <div class="subtitle">${registration}</div>
                  <div class="progress">VIP ${(state.percentage || 0)}%</div>
                  <div class="levels">${state.current?.name || "-"} → ${state.next?.name || "-"}</div>
                </div>
              </div>
              <div class="card" data-href="casino"><div class="card__body">Casino</div></div>
              <div class="card" data-href="sportsbook"><div class="card__body">Sports</div></div>
            </div>
          </div>
        </section>`;

            $(document).on("click", "#custom-section-2 .card", function () {
                const href = $(this).data("href");
                const btn = document.querySelector(`.sidebar__link[href*="/${href}"]`);
                if (btn) btn.click();
            });

            const prev = await waitForElement("#custom-section-1");
            prev.after(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitVipStatus = false;
        }
    };

    // ------------------------------
    // Section 3 — Full banner (per language, mobile/desktop)
    // ------------------------------
    const initFullBanner = async (isMobile, isUserLoggedIn) => {
        if (isProcessingInitFullBanner) return;
        isProcessingInitFullBanner = true;

        try {
            const $ = get$();
            if (!$) { isProcessingInitFullBanner = false; return; }

            if ($("#custom-section-3").length) $("#custom-section-3").remove();

            const language = window.localStorage.language || "tr";
            const imageMap = {
                ar: { mobile: "https://jackbomcom.github.io/assets/images/ar_mobile.gif", web: "https://jackbomcom.github.io/assets/images/ar_web.gif" },
                ch: { mobile: "https://jackbomcom.github.io/assets/images/ch_mobile.gif", web: "https://jackbomcom.github.io/assets/images/ch_web.gif" },
                fr: { mobile: "https://jackbomcom.github.io/assets/images/fr_mobile.gif", web: "https://jackbomcom.github.io/assets/images/fr_web.gif" },
                it: { mobile: "https://jackbomcom.github.io/assets/images/it_mobile.gif", web: "https://jackbomcom.github.io/assets/images/it_web.gif" },
                ru: { mobile: "https://jackbomcom.github.io/assets/images/ru_mobile.gif", web: "https://jackbomcom.github.io/assets/images/ru_web.gif" },
                en: { mobile: "https://jackbomcom.github.io/assets/images/6gvfrjzsc5u4n8ha.gif", web: "https://jackbomcom.github.io/assets/images/rqawmp69bsv5thux.gif" },
                tr: { mobile: "https://jackbomcom.github.io/assets/images/24cjrkhd7xqwps9z.gif", web: "https://jackbomcom.github.io/assets/images/rpxd3f27nzqew695.gif" },
            };

            const selected = (isMobile ? imageMap[language].mobile : imageMap[language].web);
            const sectionHtml = `
        <section id="custom-section-3" class="section custom-section full-banner">
          <div class="container">
            <img src="${selected}" alt="banner" />
          </div>
        </section>`;

            const anchor = await waitForElement(isUserLoggedIn ? ".section.pt-24:not(.mini-slider)" : ".section.section--first");
            anchor.before(sectionHtml);
        } catch (error) {
            console.error(error);
        } finally {
            isProcessingInitFullBanner = false;
        }
    };

    // ------------------------------
    // Section 4 — Games landing (only when logged out)
    // ------------------------------
    const initGamesLanding = async (isUserLoggedIn) => {
        if (isProcessingInitGamesLanding) return;
        isProcessingInitGamesLanding = true;

        const $ = get$();
        if (!$) { isProcessingInitGamesLanding = false; return; }

        try {
            if ($("#custom-section-4").length) $("#custom-section-4").remove();
            if (isUserLoggedIn) return;

            const isMobile = window.matchMedia && window.matchMedia("(max-width: 1023px)").matches;
            const language = window.localStorage.language || "tr";
            const contentMap = {
                tr: {
                    casinoText1: "Binlerce heyecan verici oyunla büyük kazançlara ulaşmanın sayısız yolu.",
                    casinoIcon1: "Yeni Çıkanlar",
                    casinoIcon2: "Yüksek RTP",
                    casinoIcon3: "Canlı Casino",
                    casinoIcon4: "Turnuvalar",
                    casinoButton: "Casino Bölümünü Keşfedin",
                    sportsText1: "Spor dünyasının en büyük anlarına bahis yaparak oyunun bir parçası olun.",
                    sportsIcon1: "Spor",
                    sportsIcon2: "Espor",
                    sportsIcon3: "Canlı Yayınlar",
                    sportsIcon4: "Artırılmış Oranlar",
                    sportsButton: "Sporlar Bölümünü Keşfedin",
                },
                en: {
                    casinoText1: "Countless ways to achieve big wins with thousands of exciting games.",
                    casinoIcon1: "New Releases",
                    casinoIcon2: "High RTP",
                    casinoIcon3: "Live Casino",
                    casinoIcon4: "Tournaments",
                    casinoButton: "Explore the Casino Section",
                    sportsText1: "Be part of the game by betting on the biggest moments in sports.",
                    sportsIcon1: "Sports",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Live Streams",
                    sportsIcon4: "Boosted Odds",
                    sportsButton: "Explore the Sports Section",
                },
                ru: {
                    casinoText1: "Бесчисленные способы получить крупные выигрыши в тысячах захватывающих игр.",
                    casinoIcon1: "Новые Выпуски",
                    casinoIcon2: "Высокий RTP",
                    casinoIcon3: "Живое Казино",
                    casinoIcon4: "Турниры",
                    casinoButton: "Исследуйте Раздел Казино",
                    sportsText1: "Станьте частью игры, делая ставки на крупнейшие моменты в спорте.",
                    sportsIcon1: "Спорт",
                    sportsIcon2: "Киберспорт",
                    sportsIcon3: "Прямые Трансляции",
                    sportsIcon4: "Повышенные Коэффициенты",
                    sportsButton: "Исследуйте Раздел Спорта",
                },
                fr: {
                    casinoText1: "D'innombrables façons de remporter de gros gains avec des milliers de jeux passionnants.",
                    casinoIcon1: "Nouveautés",
                    casinoIcon2: "RTP Élevé",
                    casinoIcon3: "Casino En Direct",
                    casinoIcon4: "Tournois",
                    casinoButton: "Explorer la Section Casino",
                    sportsText1: "Faites partie du jeu en pariant sur les plus grands moments du sport.",
                    sportsIcon1: "Sports",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Diffusions En Direct",
                    sportsIcon4: "Cotes Améliorées",
                    sportsButton: "Explorer la Section Sports",
                },
                ch: {
                    casinoText1: "通过数千种刺激的游戏赢得丰厚奖金的无数方式。",
                    casinoIcon1: "新发布",
                    casinoIcon2: "高RTP",
                    casinoIcon3: "真人赌场",
                    casinoIcon4: "锦标赛",
                    casinoButton: "探索赌场部分",
                    sportsText1: "通过投注体育界的重大时刻成为比赛的一部分。",
                    sportsIcon1: "体育",
                    sportsIcon2: "电子竞技",
                    sportsIcon3: "现场直播",
                    sportsIcon4: "增强赔率",
                    sportsButton: "探索体育部分",
                },
                it: {
                    casinoText1: "Innumerevoli modi per ottenere grandi vincite con migliaia di giochi emozionanti.",
                    casinoIcon1: "Nuove Uscite",
                    casinoIcon2: "RTP Elevato",
                    casinoIcon3: "Casinò Dal Vivo",
                    casinoIcon4: "Tornei",
                    casinoButton: "Esplora la Sezione Casinò",
                    sportsText1: "Fai parte del gioco scommettendo sui momenti più importanti dello sport.",
                    sportsIcon1: "Sport",
                    sportsIcon2: "Esports",
                    sportsIcon3: "Streaming Dal Vivo",
                    sportsIcon4: "Quote Maggiorate",
                    sportsButton: "Esplora la Sezione Sport",
                },
                ar: {
                    casinoText1: "طرق لا حصر لها لتحقيق مكاسب كبيرة مع آلاف الألعاب المثيرة.",
                    casinoIcon1: "الإصدارات الجديدة",
                    casinoIcon2: "RTP مرتفع",
                    casinoIcon3: "كازينو مباشر",
                    casinoIcon4: "البطولات",
                    casinoButton: "استكشف قسم الكازينو",
                    sportsText1: "كن جزءًا من اللعبة عن طريق المراهنة على أكبر لحظات الرياضة.",
                    sportsIcon1: "الرياضة",
                    sportsIcon2: "الرياضات الإلكترونية",
                    sportsIcon3: "البث المباشر",
                    sportsIcon4: "احتمالات محسنة",
                    sportsButton: "استكشف قسم الرياضة",
                },
            };

            const casinoImage = "https://jackbomcom.github.io/assets/images/4w85hndbspgjxrqc.webp";
            const sportsImage = "https://jackbomcom.github.io/assets/images/7xmhb6qu3prt4sza.webp";

            // Swiper'lı games landing (prev/next + hızlı kaydırma)
            const sectionHtml = `
        <section id="custom-section-4" class="section custom-section landing">
          <div class="container">
            <div class="swiper">
              <div class="swiper-wrapper">
                <div class="swiper-slide">
                  <div class="landing__col">
                    <img src="${casinoImage}" alt="casino"/>
                    <h2>${contentMap[language].casinoText1}</h2>
                    <div class="icons">
                      <span>${contentMap[language].casinoIcon1}</span>
                      <span>${contentMap[language].casinoIcon2}</span>
                      <span>${contentMap[language].casinoIcon3}</span>
                      <span>${contentMap[language].casinoIcon4}</span>
                    </div>
                    <button class="landing-button" data-href="casino">${contentMap[language].casinoButton}</button>
                  </div>
                </div>
                <div class="swiper-slide">
                  <div class="landing__col">
                    <img src="${sportsImage}" alt="sports"/>
                    <h2>${contentMap[language].sportsText1}</h2>
                    <div class="icons">
                      <span>${contentMap[language].sportsIcon1}</span>
                      <span>${contentMap[language].sportsIcon2}</span>
                      <span>${contentMap[language].sportsIcon3}</span>
                      <span>${contentMap[language].sportsIcon4}</span>
                    </div>
                    <button class="landing-button" data-href="sportsbook">${contentMap[language].sportsButton}</button>
                  </div>
                </div>
              </div>
              <div class="swiper-pagination"></div>
              <div class="swiper-button-prev"></div>
              <div class="swiper-button-next"></div>
            </div>
          </div>
        </section>`;

            const section = await waitForElement(".section.pt-24:not(.mini-slider)");
            section.before(sectionHtml);

            $(document).on("click", "#custom-section-4 .landing-button", function () {
                const href = $(this).data("href");
                const btn = document.querySelector(`.sidebar__link[href*="/${href}"]`);
                if (btn) btn.click();
            });

            if (window.Swiper) {
                const landingSwiper = new window.Swiper("#custom-section-4 .swiper", {
                    loop: !isMobile, // mobilde loop kapalı
                    autoplay: { delay: 3500, disableOnInteraction: false },
                    slidesPerView: isMobile ? 1 : 2,
                    spaceBetween: isMobile ? 12 : 20,
                    centeredSlides: !!isMobile,
                    pagination: { el: "#custom-section-4 .swiper-pagination", type: "bullets" },
                    navigation: {
                        prevEl: "#custom-section-4 .swiper-button-prev",
                        nextEl: "#custom-section-4 .swiper-button-next",
                    },
                    // 🚀 Perf tweaks
                    speed: 450,
                    roundLengths: true,
                    resistanceRatio: 0.5,
                    threshold: 8,
                    touchRatio: 1,
                    followFinger: true,
                    touchStartPreventDefault: false,
                    cssMode: false,
                    preloadImages: false,
                    lazy: { loadPrevNext: true, loadPrevNextAmount: 2 },
                    watchSlidesProgress: false,
                    updateOnWindowResize: false,
                });
            } catch (error) {
                console.error(error);
            } finally {
                isProcessingInitGamesLanding = false;
            }
        };

        // ------------------------------
        // Section 5 — Crypto slider (only when logged out)
        // ------------------------------
        const initCryptoSlider = async (isUserLoggedIn) => {
            if (isProcessingInitCryptoSlider) return;
            isProcessingInitCryptoSlider = true;

            const $ = get$();
            if (!$) { isProcessingInitCryptoSlider = false; return; }

            try {
                if ($("#custom-section-5").length) $("#custom-section-5").remove();
                if (isUserLoggedIn) return;

                const language = window.localStorage.language || "tr";
                const contentMap = {
                    tr: {
                        cryptoTitle1: "Kripto ve Türk Lirası İşlemlerinizi Kolaylaştırın",
                        cryptoText1: "13 lider kripto para ve Türk Lirası ile dijital ödemelerin geleceğini keşfedin.",
                        cryptoText2: "Eşsiz güvenlik, hızlı işlemler ve alternatif ödeme yöntemlerinin esnekliği ile güvenli bir çevrim içi cüzdan desteğinden faydalanın.",
                    },
                    en: {
                        cryptoTitle1: "Simplify Your Crypto and Turkish Lira Transactions",
                        cryptoText1: "Discover the future of digital payments with 13 leading cryptocurrencies and the Turkish Lira.",
                        cryptoText2: "Benefit from secure online wallet support with unparalleled security, fast transactions, and the flexibility of alternative payment methods.",
                    },
                    ru: {
                        cryptoTitle1: "Упростите операции с криптовалютой и турецкой лирой",
                        cryptoText1: "Откройте для себя будущее цифровых платежей с 13 ведущими криптовалютами и турецкой лирой.",
                        cryptoText2: "Воспользуйтесь поддержкой безопасного онлайн-кошелька с непревзойденной безопасностью, быстрыми транзакциями и гибкостью альтернативных методов оплаты.",
                    },
                    fr: {
                        cryptoTitle1: "Simplifiez Vos Transactions En Crypto et En Livre Turque",
                        cryptoText1: "Découvrez l'avenir des paiements numériques avec 13 principales cryptomonnaies et la Livre Turque.",
                        cryptoText2: "Profitez d'un support de portefeuille en ligne sécurisé avec une sécurité inégalée, des transactions rapides et la flexibilité des méthodes de paiement alternatives.",
                    },
                    ch: {
                        cryptoTitle1: "简化您的加密货币和土耳其里拉交易",
                        cryptoText1: "通过 13 种领先的加密货币和土耳其里拉探索数字支付的未来。",
                        cryptoText2: "利用无与伦比的安全性、快速交易以及灵活的替代支付方式，享受安全的在线钱包支持。",
                    },
                    it: {
                        cryptoTitle1: "Semplifica Le Tue Transazioni In Cripto E Lira Turca",
                        cryptoText1: "Scopri il futuro dei pagamenti digitali con 13 principali criptovalute e la Lira Turca.",
                        cryptoText2: "Approfitta del supporto sicuro del portafoglio online con sicurezza senza pari, transazioni rapide e flessibilità nei metodi di pagamento alternativi.",
                    },
                    ar: {
                        cryptoTitle1: "تبسيط معاملاتك بالعملات المشفرة والليرة التركية",
                        cryptoText1: "اكتشف مستقبل المدفوعات الرقمية مع 13 من العملات المشفرة الرائدة والليرة التركية.",
                        cryptoText2: "استفد من دعم المحفظة عبر الإنترنت الآمن مع أمان لا مثيل له، معاملات سريعة ومرونة في طرق الدفع البديلة.",
                    },
                };

                const sliderItems = [
                    "https://jackbomcom.github.io/assets/images/3vcz7twm29jy8qgb.webp",
                    "https://jackbomcom.github.io/assets/images/8q7x29pmauwhc65e.webp",
                    "https://jackbomcom.github.io/assets/images/c59qb7g36yxmtsrf.webp",
                    "https://jackbomcom.github.io/assets/images/hzemdpc65usfy4q9.webp",
                    "https://jackbomcom.github.io/assets/images/jwpxta3e9z58m42c.webp",
                    "https://jackbomcom.github.io/assets/images/mfphk8n5y3erc7tb.webp",
                    "https://jackbomcom.github.io/assets/images/nuxbpea24j837ymh.webp",
                    "https://jackbomcom.github.io/assets/images/s9e5cnm6rj842qyd.webp",
                    "https://jackbomcom.github.io/assets/images/uwp3bjn8a5x6qftv.webp",
                    "https://jackbomcom.github.io/assets/images/w63gf598hxv2kjar.webp",
                    "https://jackbomcom.github.io/assets/images/wbynvfmzq82ds93p.webp",
                    "https://jackbomcom.github.io/assets/images/weh2ng7u6sk5pybt.webp",
                    "https://jackbomcom.github.io/assets/images/yx62vs7k9fmjqpbe.webp",
                ];

                const sectionHtml = `
        <section id="custom-section-5" class="section custom-section crypto">
          <div class="container">
            <div class="swiper">
              <div class="swiper-wrapper">
                ${sliderItems.map((src) => `<div class="swiper-slide"><img src="${src}" alt="crypto"/></div>`).join("")}
              </div>
              <div class="swiper-pagination"></div>
            </div>
            <div class="crypto-text">
              <h3>${contentMap[language].cryptoTitle1}</h3>
              <p>${contentMap[language].cryptoText1}</p>
              <p>${contentMap[language].cryptoText2}</p>
            </div>
          </div>
        </section>`;

                const section = await waitForElement(".section.pt-24:not(.mini-slider)");
                section.after(sectionHtml);

                if (window.Swiper) {
                    new window.Swiper("#custom-section-5 .swiper", {
                        loop: true,
                        autoplay: { delay: 2500, disableOnInteraction: false },
                        slidesPerView: 3,
                        spaceBetween: 10,
                        breakpoints: {
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            1200: { slidesPerView: 5 },
                        },
                        pagination: { el: "#custom-section-5 .swiper-pagination", type: "bullets" },
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                isProcessingInitCryptoSlider = false;
            }
        };

        // ------------------------------
        // How-to popup (used by sidebar)
        // ------------------------------
        function openPopup(isMobile) {
            if (document.getElementById("custom-modal-howto")) return;

            const popupHtml = `
      <div id="custom-modal-howto" class="modal" style="display:block">
        <div class="modal__overlay"></div>
        <div class="modal__content">
          <button type="button" class="modal__close" aria-label="close">✕</button>
          <div class="howto-buttons">
            <button type="button" id="abanka" class="howto-button selected">Anında Banka</button>
            <button type="button" id="ahavale" class="howto-button">Anında Havale</button>
            <button type="button" id="aparola" class="howto-button">Anında Parola</button>
            <button type="button" id="apopy" class="howto-button">Anında Popy</button>
            <button type="button" id="mefete" class="howto-button">Anında Mefete</button>
            <button type="button" id="papara" class="howto-button">Anında Papara</button>
            <button type="button" id="payco" class="howto-button">Payco</button>
            <button type="button" id="payfix" class="howto-button">Hızlı Havale</button>
            <button type="button" id="scash" class="howto-button">S-Cash</button>
          </div>
          <div class="howto-video"></div>
        </div>
      </div>`;

            document.body.insertAdjacentHTML("beforeend", popupHtml);

            const urlMap = {
                abanka: "MnbSnz_SW4g",
                ahavale: "rde3lMBASfk",
                aparola: "42g9e3qdjjk",
                apopy: "BKOzdNEOUCo",
                mefete: "OiSuS5Nlxq8",
                papara: "eQtpLccFtbg",
                payco: "Sp-lIZ_XrJc",
                payfix: "ih7wE0Vczmk",
                scash: "NDWYCi50C6Q",
            };

            const initVideo = () => {
                const selected = document.querySelector(".howto-button.selected");
                const code = selected ? selected.id : "abanka";
                const html = `
        <div class="ratio" style="position:relative;padding-bottom:56.25%">
          <iframe src="https://www.youtube.com/embed/${code}" allowfullscreen style="position:absolute;inset:0;border:0;width:100%;height:100%"></iframe>
        </div>`;
                const holder = document.querySelector(".howto-video");
                if (holder) holder.innerHTML = html;
            };

            document.addEventListener("click", (e) => {
                const btn = e.target.closest(".howto-button");
                if (btn) {
                    document.querySelectorAll(".howto-button").forEach((b) => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    initVideo();
                }
                if (e.target.closest("#custom-modal-howto .modal__close") || e.target.classList.contains("modal__overlay")) {
                    const modal = document.getElementById("custom-modal-howto");
                    if (modal) modal.remove();
                }
            }, { passive: true });

            initVideo();
        }

        // ------------------------------
        // Route handling (SPA friendly)
        // ------------------------------
        handleRouteChange = () => {
            const isMobile = window.matchMedia && window.matchMedia("(max-width: 1023px)").matches;
            const isHomePage = /^\/(tr|en|ru|fr|ch|it|ar)\/?$/.test(window.location.pathname) || window.location.pathname === "/";
            const isUserLoggedIn = !!(document.querySelector("header #dropdownUser") || document.querySelector(".header__wallet"));

            customizeSidebar(isMobile, isHomePage, isUserLoggedIn);
            initMainSlider(isMobile);
            initVipStatus(isUserLoggedIn);
            initFullBanner(isMobile, isUserLoggedIn);
            initGamesLanding(isUserLoggedIn);
            initCryptoSlider(isUserLoggedIn);
        };

        // Kick once DOM is ready and jQuery likely present
        const boot = () => handleRouteChange();

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", boot);
        } else {
            boot();
        }

        // Also listen to SPA-ish changes
        window.addEventListener("popstate", handleRouteChange);
        window.addEventListener("hashchange", handleRouteChange);
    })();
