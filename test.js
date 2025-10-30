(() => {
    // -------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------
    const waitForElement = (selector, length = 0) =>
        new Promise((resolve) => {
            const check = () => {
                const $ = window.jQuery;
                if ($ && $(selector).length > length) return resolve($(selector));
                setTimeout(check, 100);
            };
            check();
        });

    const waitForSwiper = (selector, language) =>
        new Promise((resolve) => {
            const check = () => {
                const $ = window.jQuery;
                if (!$) return setTimeout(check, 100);
                const el = $(selector)[0];
                if (el && el.swiper && el.swiper.slides && el.swiper.slides.length) {
                    const slides = el.swiper.slides;
                    const okLang =
                        !language ||
                        (((slides[0] && $(slides[0]).find("a").attr("href")) || "").includes(`/${language}`));
                    if (slides.length > 2 && okLang) return resolve(slides);
                }
                setTimeout(check, 100);
            };
            check();
        });

    // -------------------------------------------------------------
    // 🔧 Hız sabitleri
    // -------------------------------------------------------------
    const SWIPER_SPEED_MS = 700;   // slide geçiş süresi (ms)
    const AUTOPLAY_DELAY_MS = 3000; // otomatik geçiş aralığı (ms)

    // -------------------------------------------------------------
    // Id: 1 (Main slider)
    // -------------------------------------------------------------
    let isProcessingInitMainSlider = false;
    const initMainSlider = async (isMobile) => {
        if (isProcessingInitMainSlider) return;
        isProcessingInitMainSlider = true;

        try {
            const $ = window.jQuery;
            if (!_) throw new Error("jQuery gerekli (window.jQuery).");
        } catch (err) {
            console.error(err);
            isProcessingInitMainSlider = false;
            return;
        }

        try {
            const $ = window.jQuery;

            // Önce varsa eski custom section'ı kaldır
            if ($("#custom-section-1").length) {
                $("#custom-section-1").remove();
            }

            const language = (window.localStorage && window.localStorage.language) || "tr";
            const mainContent = await waitForElement("#main__content");

            // 1) Orijinal #main-slider .mySwiper hız/autoplay Güncelle
            try {
                const origEl = $("#main-slider .mySwiper")[0];
                if (origEl && origEl.swiper) {
                    const sw = origEl.swiper;
                    // hız
                    sw.params.speed = SWIPER_SPEED_MS;
                    // autoplay varsa güncelle
                    if (sw.params && sw.params.autoplay) {
                        sw.params.autoplay.delay = AUTOPLAY_DELAY_MS;
                        if (sw.autoplay && typeof sw.autoplay.start === "function") {
                            sw.autoplay.start();
                        }
                    }
                    sw.update();
                }
            } catch (e) {
                console.warn("mySwiper hız ayarı yapılamadı:", e);
            }

            // 2) Slider içeriklerini hazırla (cache'le)
            if (!window.sliderItems) window.sliderItems = {};

            if (!window.sliderItems[language] || !window.sliderItems[language].length) {
                await waitForSwiper("#main-slider .mySwiper", language);
                const baseSlides = $("#main-slider .mySwiper")[0].swiper.slides;

                // href düzeltmeleri
                baseSlides.forEach((el) => {
                    try {
                        el.innerHTML = el.innerHTML.replace(/href="\/[a-z]{2}https/g, 'href="https');
                    } catch (_) {}
                });

                const sorted = Array.from(baseSlides).sort((a, b) => {
                    const ia = parseInt((a && a.dataset && a.dataset.swiperSlideIndex) || "0", 10);
                    const ib = parseInt((b && b.dataset && b.dataset.swiperSlideIndex) || "0", 10);
                    return ib - ia;
                });

                window.sliderItems[language] = sorted;
            }

            const selected = window.sliderItems[language] || [];
            const slidesHTML = selected
                .map((item) => '<div class="swiper-slide">' + (item?.innerHTML || "") + "</div>")
                .join("");

            // 3) Custom slider section'ını ekle
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
                '</section>',
            ].join("");

            mainContent.prepend(sectionHtml);

            // 4) Yeni Swiper oluştur (hız + autoplay entegre)
            if (typeof Swiper !== "undefined") {
                new Swiper("#custom-section-1 .swiper", {
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
                        el: "#custom-section-1 .swiper-pagination",
                        type: !isMobile ? "bullets" : "progressbar",
                    },
                    navigation: {
                        prevEl: "#custom-section-1 .swiper-button-prev",
                        nextEl: "#custom-section-1 .swiper-button-next",
                    },
                });
            }

            // 5) Orijinal main-slider'ı gizle
            const mainSliderEl = document.querySelector("#main-slider");
            if (mainSliderEl) mainSliderEl.style.display = "none";
        } catch (error) {
            console.error("initMainSlider hata:", error);
        } finally {
            isProcessingInitMainSlider = false;
        }
    };

    // -------------------------------------------------------------
    // İlk yükleme
    // -------------------------------------------------------------
    const boot = async () => {
        const isMobile = (window.innerWidth || 0) < 768;
        await initMainSlider(isMobile);
    };

    // DOM hazırsa çalıştır
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
