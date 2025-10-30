(() => {
    // -------------------------------------------------------------
    // Minimal helpers (no jQuery dependency)
    // -------------------------------------------------------------
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const waitForElement = (selector, minCount = 0) =>
        new Promise((resolve) => {
            const check = () => {
                const nodes = qsa(selector);
                if (nodes.length > minCount) return resolve(nodes);
                setTimeout(check, 100);
            };
            check();
        });

    const waitForSwiper = (selector, language) =>
        new Promise((resolve) => {
            const check = () => {
                const el = qs(selector);
                if (el && el.swiper && el.swiper.slides && el.swiper.slides.length) {
                    const slides = el.swiper.slides;
                    const okLang =
                        !language ||
                        ((((slides[0] && slides[0].querySelector("a")) || {}).getAttribute?.("href") || "").includes(`/${language}`));
                    if (slides.length > 2 && okLang) return resolve(slides);
                }
                setTimeout(check, 100);
            };
            check();
        });

    // -------------------------------------------------------------
    // 🔧 Speed / autoplay config
    // -------------------------------------------------------------
    const SWIPER_SPEED_MS = 700;
    const AUTOPLAY_DELAY_MS = 3000;

    // -------------------------------------------------------------
    // Main slider (no jQuery, no $)
    // -------------------------------------------------------------
    let isProcessingInitMainSlider = false;
    const initMainSlider = async (isMobile) => {
        if (isProcessingInitMainSlider) return;
        isProcessingInitMainSlider = true;

        try {
            // remove previous custom section if exists
            const old = qs('#custom-section-1');
            if (old) old.remove();

            const language = (window.localStorage && window.localStorage.language) || 'tr';
            const [mainContent] = await waitForElement('#main__content');

            // 1) Update existing #main-slider .mySwiper if initialized
            try {
                const origEl = qs('#main-slider .mySwiper');
                if (origEl && origEl.swiper) {
                    const sw = origEl.swiper;
                    sw.params.speed = SWIPER_SPEED_MS;
                    if (sw.params && sw.params.autoplay) {
                        sw.params.autoplay.delay = AUTOPLAY_DELAY_MS;
                        if (sw.autoplay && typeof sw.autoplay.start === 'function') {
                            sw.autoplay.start();
                        }
                    }
                    sw.update();
                }
            } catch (e) {
                console.warn('mySwiper hız ayarı yapılamadı:', e);
            }

            // 2) Prepare slides cache
            if (!window.sliderItems) window.sliderItems = {};

            if (!window.sliderItems[language] || !window.sliderItems[language].length) {
                await waitForSwiper('#main-slider .mySwiper', language);
                const baseSlides = qs('#main-slider .mySwiper').swiper.slides;

                baseSlides.forEach((el) => {
                    try {
                        el.innerHTML = el.innerHTML.replace(/href="\/[a-z]{2}https/g, 'href="https');
                    } catch (_) {}
                });

                const sorted = Array.from(baseSlides).sort((a, b) => {
                    const ia = parseInt((a && a.dataset && a.dataset.swiperSlideIndex) || '0', 10);
                    const ib = parseInt((b && b.dataset && b.dataset.swiperSlideIndex) || '0', 10);
                    return ib - ia;
                });

                window.sliderItems[language] = sorted;
            }

            const selected = window.sliderItems[language] || [];
            const slidesHTML = selected
                .map((item) => '<div class="swiper-slide">' + (item?.innerHTML || '') + '</div>')
                .join('');

            const sectionHtml = [
                '<section id="custom-section-1" class="section custom-section mini-slider">',
                '  <div class="container">',
                '    <div class="swiper">',
                '      <div class="swiper-wrapper">',
                slidesHTML,
                '      </div>',
                '      <div class="swiper-button-prev"></div>',
                '      <div class="swiper-button-next"></div>',
                '      <div class="swiper-pagination"></div>',
                '    </div>',
                '  </div>',
                '</section>'
            ].join('');

            mainContent.insertAdjacentHTML('afterbegin', sectionHtml);

            // 3) Init new Swiper instance
            if (typeof Swiper !== 'undefined') {
                new Swiper('#custom-section-1 .swiper', {
                    loop: true,
                    speed: SWIPER_SPEED_MS,
                    autoplay: {
                        delay: AUTOPLAY_DELAY_MS,
                        disableOnInteraction: false,
                    },
                    slidesPerView: !isMobile ? 2 : 1.2,
                    spaceBetween: !isMobile ? 20 : 15,
                    centeredSlides: !!isMobile,
                    pagination: {
                        el: '#custom-section-1 .swiper-pagination',
                        type: !isMobile ? 'bullets' : 'progressbar',
                    },
                    navigation: {
                        prevEl: '#custom-section-1 .swiper-button-prev',
                        nextEl: '#custom-section-1 .swiper-button-next',
                    },
                });
            }

            // 4) Hide original main slider
            const mainSliderEl = qs('#main-slider');
            if (mainSliderEl) mainSliderEl.style.display = 'none';
        } catch (error) {
            console.error('initMainSlider hata:', error);
        } finally {
            isProcessingInitMainSlider = false;
        }
    };

    // -------------------------------------------------------------
    // Boot
    // -------------------------------------------------------------
    const boot = async () => {
        const isMobile = (window.innerWidth || 0) < 768;
        await initMainSlider(isMobile);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
