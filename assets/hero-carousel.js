if (!customElements.get('hero-carousel')) {
  customElements.define(
    'hero-carousel',
    class HeroCarousel extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.hero-carousel__track');
        this.slides = Array.from(this.querySelectorAll('.hero-carousel__slide'));
        this.dots = Array.from(this.querySelectorAll('.hero-carousel__dot'));
        this.index = 0;
        if (this.slides.length < 2) return;

        this.speed = parseInt(this.dataset.speed, 10) || 5000;
        this.autoplay =
          this.dataset.autoplay === 'true' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.dots.forEach((dot) => dot.addEventListener('click', () => this.goTo(parseInt(dot.dataset.index, 10))));

        this.addEventListener('mouseenter', () => this.stop());
        this.addEventListener('mouseleave', () => this.play());
        this.addEventListener('focusin', () => this.stop());
        this.addEventListener('focusout', () => this.play());
        document.addEventListener('visibilitychange', () => (document.hidden ? this.stop() : this.play()));

        this.initSwipe();
        this.update();
        this.play();

        if (Shopify.designMode) {
          this.addEventListener('shopify:block:select', (event) => {
            this.stop();
            this.goTo(this.slides.indexOf(event.target));
          });
          this.addEventListener('shopify:block:deselect', () => this.play());
        }
      }

      disconnectedCallback() {
        this.stop();
      }

      goTo(index) {
        const count = this.slides.length;
        this.index = ((index % count) + count) % count;
        this.update();
      }

      update() {
        this.track.style.transform = `translateX(-${this.index * 100}%)`;
        this.slides.forEach((slide, i) => {
          const active = i === this.index;
          slide.toggleAttribute('inert', !active);
          slide.setAttribute('aria-hidden', String(!active));
          const video = slide.querySelector('video');
          if (video) active ? video.play().catch(() => {}) : video.pause();
        });
        this.dots.forEach((dot, i) => {
          const active = i === this.index;
          dot.classList.toggle('is-active', active);
          active ? dot.setAttribute('aria-current', 'true') : dot.removeAttribute('aria-current');
        });
      }

      play() {
        if (!this.autoplay) return;
        this.stop();
        this.timer = setInterval(() => this.goTo(this.index + 1), this.speed);
      }

      stop() {
        clearInterval(this.timer);
      }

      initSwipe() {
        let startX = 0;
        let deltaX = 0;
        let dragging = false;

        this.track.addEventListener('pointerdown', (event) => {
          if (event.pointerType === 'mouse') return;
          dragging = true;
          startX = event.clientX;
          deltaX = 0;
          this.stop();
          this.track.classList.add('is-dragging');
        });

        this.track.addEventListener('pointermove', (event) => {
          if (!dragging) return;
          deltaX = event.clientX - startX;
          this.track.style.transform = `translateX(calc(-${this.index * 100}% + ${deltaX}px))`;
        });

        const end = () => {
          if (!dragging) return;
          dragging = false;
          this.track.classList.remove('is-dragging');
          if (Math.abs(deltaX) > 50) {
            this.goTo(this.index + (deltaX < 0 ? 1 : -1));
          } else {
            this.update();
          }
          this.play();
        };

        this.track.addEventListener('pointerup', end);
        this.track.addEventListener('pointercancel', end);

        // A swipe shouldn't also follow the slide's link
        this.track.addEventListener(
          'click',
          (event) => {
            if (Math.abs(deltaX) > 10) event.preventDefault();
            deltaX = 0;
          },
          true
        );
      }
    }
  );
}
