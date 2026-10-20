if (!customElements.get('cs-scroller')) {
  customElements.define(
    'cs-scroller',
    class CsScroller extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('.cs-scroller__track');
        if (!this.track) return;

        const sectionRoot = this.closest('.shopify-section') || document;
        this.prevButtons = sectionRoot.querySelectorAll(`[data-scroller-prev="${this.id}"]`);
        this.nextButtons = sectionRoot.querySelectorAll(`[data-scroller-next="${this.id}"]`);

        this.prevButtons.forEach((button) => button.addEventListener('click', () => this.scrollByPage(-1)));
        this.nextButtons.forEach((button) => button.addEventListener('click', () => this.scrollByPage(1)));

        this.onScroll = this.updateButtons.bind(this);
        this.track.addEventListener('scroll', this.onScroll, { passive: true });
        this.resizeObserver = new ResizeObserver(this.onScroll);
        this.resizeObserver.observe(this.track);
        this.updateButtons();

        if (window.Shopify && Shopify.designMode) {
          this.addEventListener('shopify:block:select', (event) => {
            this.track.scrollTo({ left: event.target.offsetLeft - this.track.offsetLeft, behavior: 'smooth' });
          });
        }
      }

      disconnectedCallback() {
        this.track?.removeEventListener('scroll', this.onScroll);
        this.resizeObserver?.disconnect();
      }

      scrollByPage(direction) {
        const item = this.track.firstElementChild;
        const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
        const step = item ? item.getBoundingClientRect().width + gap : this.track.clientWidth;
        const perPage = Math.max(1, Math.floor((this.track.clientWidth + gap) / step));
        this.track.scrollBy({ left: direction * step * perPage, behavior: 'smooth' });
      }

      updateButtons() {
        const max = this.track.scrollWidth - this.track.clientWidth - 2;
        const atStart = this.track.scrollLeft <= 2;
        const atEnd = this.track.scrollLeft >= max;
        this.prevButtons.forEach((button) => (button.disabled = atStart));
        this.nextButtons.forEach((button) => (button.disabled = atEnd || max <= 0));
        this.classList.toggle('is-scrollable', max > 0);
      }
    }
  );
}

// Mega drawer close link: toggle the drawer through its own summary so Dawn's
// HeaderDrawer runs its normal close routine (focus, scroll lock, animation).
document.addEventListener('click', (event) => {
  const closeLink = event.target.closest('.mega-drawer__close');
  if (!closeLink) return;
  event.preventDefault();
  closeLink.closest('.menu-drawer-container')?.querySelector(':scope > summary')?.click();
});

// Product page sticky add-to-cart bar: shows once the main buy button scrolls out of
// view, and mirrors the main button's label/disabled state and the current price.
if (!customElements.get('product-sticky-bar')) {
  customElements.define(
    'product-sticky-bar',
    class ProductStickyBar extends HTMLElement {
      connectedCallback() {
        this.button = this.querySelector('.product-sticky-bar__button');
        this.priceEl = this.querySelector('.product-sticky-bar__price');
        this.sectionId = this.dataset.sectionId;
        this.hidden = false;

        const form = document.getElementById(this.dataset.formId);
        if (!form) return;

        this.observer = new IntersectionObserver(([entry]) => {
          const pastButton = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          this.classList.toggle('is-visible', pastButton);
        });
        this.observer.observe(form);

        // Dawn re-renders the price and buy buttons on variant change; watch the whole
        // product info column and re-sync from whatever elements are current.
        this.sync = this.sync.bind(this);
        const info = document.getElementById(`ProductInfo-${this.sectionId}`);
        if (info) {
          this.mutationObserver = new MutationObserver(this.sync);
          this.mutationObserver.observe(info, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
        }
        this.sync();
      }

      disconnectedCallback() {
        this.observer?.disconnect();
        this.mutationObserver?.disconnect();
      }

      sync() {
        const mainButton = document.getElementById(`ProductSubmitButton-${this.sectionId}`);
        if (mainButton) {
          this.button.disabled = mainButton.disabled;
          const label = mainButton.querySelector('span')?.textContent.trim();
          if (label) this.button.textContent = label;
        }
        const price = document.querySelector(`#price-${this.sectionId} .price-item--last, #price-${this.sectionId} .price-item--regular`);
        if (price && price.textContent.trim()) this.priceEl.textContent = price.textContent.trim();
      }
    }
  );
}

// Collection grid size toggle: stores the choice per browser and applies it via
// data-grid-view on the .collection-bold wrapper (which survives filter re-renders).
if (!customElements.get('grid-view-toggle')) {
  customElements.define(
    'grid-view-toggle',
    class GridViewToggle extends HTMLElement {
      connectedCallback() {
        this.wrapper = this.closest('.collection-bold');
        if (!this.wrapper) return;
        let saved = null;
        try {
          saved = localStorage.getItem('collection-grid-view');
        } catch (e) {}
        if (saved) this.wrapper.dataset.gridView = saved;
        this.update();
        this.querySelectorAll('button[data-view]').forEach((button) =>
          button.addEventListener('click', () => {
            this.wrapper.dataset.gridView = button.dataset.view;
            try {
              localStorage.setItem('collection-grid-view', button.dataset.view);
            } catch (e) {}
            this.update();
          })
        );
      }

      update() {
        this.querySelectorAll('button[data-view]').forEach((button) =>
          button.setAttribute('aria-pressed', String(button.dataset.view === this.wrapper.dataset.gridView))
        );
      }
    }
  );
}

// "View more" toggle for clamped collection descriptions
document.addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-clamp-toggle]');
  if (!toggle) return;
  const target = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!target) return;
  const expanded = target.classList.toggle('is-expanded');
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.textContent = expanded ? toggle.dataset.lessLabel : toggle.dataset.moreLabel;
});

// Smooth wheel scrolling like the reference (measured 2026-10-16): the page glides to the wheel target,
// closing 10% of the distance per 60fps frame, so one notch settles in about 0.9s.
// Touch, keyboard, scrollbar, zoom, horizontal wheel, scrollable panels and locked pages stay native.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  let target = window.scrollY;
  let current = target;
  let lastSet = target;
  let lastTime = 0;
  let frame = null;

  const isLocked = () => [root, document.body].some((element) => getComputedStyle(element).overflowY === 'hidden');

  // A scrollable element under the pointer that can still move this way keeps the wheel
  const canScrollInside = (element, deltaY) => {
    for (; element && element !== document.body && element !== root; element = element.parentElement) {
      const { overflowY } = getComputedStyle(element);
      if ((overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        if (deltaY < 0 ? element.scrollTop > 0 : element.scrollTop + element.clientHeight < element.scrollHeight - 1) return true;
      }
    }
    return false;
  };

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    lastTime = 0;
  };

  const step = (time) => {
    const elapsed = lastTime ? Math.min(time - lastTime, 100) : 1000 / 60;
    lastTime = time;
    current += (target - current) * (1 - Math.pow(0.9, elapsed / (1000 / 60)));
    if (Math.abs(target - current) < 0.5) current = target;
    lastSet = current;
    window.scrollTo({ top: current, behavior: 'instant' });
    if (current === target) stop();
    else frame = requestAnimationFrame(step);
  };

  window.addEventListener(
    'wheel',
    (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (isLocked() || canScrollInside(event.target, event.deltaY)) return;

      event.preventDefault();
      if (!frame) current = target = window.scrollY;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const max = root.scrollHeight - window.innerHeight;
      target = Math.max(0, Math.min(max, target + event.deltaY * unit));
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: false }
  );

  // Keyboard, scrollbar, anchor links or scripts moved the page: follow them instead of pulling it back
  window.addEventListener(
    'scroll',
    () => {
      if (frame && Math.abs(window.scrollY - lastSet) > 2) {
        stop();
        current = target = window.scrollY;
      }
    },
    { passive: true }
  );
})();

// Magnetic call-to-action buttons (reference: xo-magnetic, radius 150px, 0.5s). Within 150px of a button's centre the
// button moves toward the pointer by 116.6 * d / (d + 77.5) px, d being the pointer's distance (a fit to the
// reference's measurements: 40px -> 40, 100px -> 66, 145px -> 76), and eases back once the pointer leaves the radius.
// It uses the CSS translate property, so buttons that are positioned with transform keep it. Mouse only.
(() => {
  const SELECTOR = [
    'a.category-panel__button',
    'a.feature-showcase__button',
    'a.hero-carousel__cta',
    'a.ic__button',
    'a.header-nav__promo-button',
  ].join(', ');
  const RADIUS = 150;
  const TAU = 150; // ms, the reference's ease toward the target

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const offsets = new WeakMap();
  let pointerX = -1e5;
  let pointerY = -1e5;
  let frame = 0;
  let last = 0;

  const tick = (time) => {
    const ease = 1 - Math.exp(-Math.min(time - (last || time), 100) / TAU);
    last = time;
    let moving = false;
    document.querySelectorAll(SELECTOR).forEach((button) => {
      const offset = offsets.get(button) || { x: 0, y: 0 };
      offsets.set(button, offset);
      const box = button.getBoundingClientRect();
      // Centre at rest: the measured box minus the offset already applied
      const dx = pointerX - (box.left + box.width / 2 - offset.x);
      const dy = pointerY - (box.top + box.height / 2 - offset.y);
      const distance = Math.hypot(dx, dy);
      let targetX = 0;
      let targetY = 0;
      if (box.width && distance > 0 && distance < RADIUS) {
        const pull = 116.6 / (distance + 77.5);
        targetX = dx * pull;
        targetY = dy * pull;
      }
      offset.x += (targetX - offset.x) * ease;
      offset.y += (targetY - offset.y) * ease;
      if (Math.abs(targetX - offset.x) + Math.abs(targetY - offset.y) > 0.1) moving = true;
      else {
        offset.x = targetX;
        offset.y = targetY;
      }
      button.style.translate = offset.x || offset.y ? `${offset.x.toFixed(2)}px ${offset.y.toFixed(2)}px` : '';
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
    if (!frame) last = 0;
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    },
    { passive: true }
  );
  // Buttons scroll under a still pointer; and leaving the window lets them settle
  window.addEventListener('scroll', schedule, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    pointerX = pointerY = -1e5;
    schedule();
  });
})();
