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

// Magnetic call-to-action buttons, kept subtle: within 120px of a button's centre the button leans toward the pointer
// by 40 * d / (d + 65) * (1 - (d / 120)^2) px, d being the pointer's distance (40px -> 13.5, 60px -> 14.4, 100px -> 7.5),
// so it never travels more than ~15px and fades out smoothly at the edge of the field instead of snapping back.
// It uses the CSS translate property, so buttons that are positioned with transform keep it. Mouse only.
(() => {
  const SELECTOR = [
    'a.category-panel__button',
    'a.feature-showcase__button',
    'a.hero-carousel__cta',
    'a.ic__button',
    'a.header-nav__promo-button',
  ].join(', ');
  const RADIUS = 120;
  const TAU = 180; // ms, ease toward the target

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
        const pull = (40 / (distance + 65)) * (1 - (distance / RADIUS) ** 2);
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

// Section and page headings reveal letter by letter like the reviews heading (reference: per-character rise). Each
// heading is split into word and letter spans once it exists; it animates when it scrolls into view. Screen readers
// get the plain title (aria-label). The hero and featured-product titles keep their own animations.
(() => {
  const SELECTOR = [
    'main h1:not(.hero-carousel__heading)',
    '.best-sellers__heading',
    '.category-panel__heading',
    '.feature-showcase__heading',
    '.pb__heading',
    '.pa__eyebrow',
    '.pa__heading',
    '.ccat__heading',
    '.about-story__heading',
    '.about-dna__heading',
    '.about-faq__heading',
    '.about-newsletter__heading',
  ].join(', ');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      })
    // Any part on screen: a heading low on a short page must still reveal
  );

  const split = (heading) => {
    if (heading.classList.contains('cs-split') || !heading.textContent.trim()) return;
    heading.setAttribute('aria-label', heading.textContent.replace(/\s+/g, ' ').trim());
    let index = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
          return;
        }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
        const fragment = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (!part.trim()) {
            fragment.append(document.createTextNode(' '));
            return;
          }
          const word = document.createElement('span');
          word.className = 'cs-split__word';
          word.setAttribute('aria-hidden', 'true');
          [...part].forEach((letter) => {
            const char = document.createElement('span');
            char.className = 'cs-split__char';
            char.style.setProperty('--i', index++);
            char.textContent = letter;
            word.append(char);
          });
          fragment.append(word);
        });
        child.replaceWith(fragment);
      });
    };
    walk(heading);
    heading.classList.add('cs-split');
    observer.observe(heading);
  };

  const scan = (root) => {
    if (root.matches?.(SELECTOR)) split(root);
    root.querySelectorAll?.(SELECTOR).forEach(split);
  };
  scan(document);
  // Sections re-rendered later (theme editor, recommendations) get the same treatment
  new MutationObserver((mutations) =>
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => node.nodeType === Node.ELEMENT_NODE && scan(node)))
  ).observe(document.body, { childList: true, subtree: true });
})();

// About page revealed image (reference: Impact "revealed-image"). While the stage is pinned, the first 80% of the
// pinned scroll moves --reveal from 0 to 1 (eased in: the window grows to full screen as the image zooms out) and the
// first 25% fades the heading in (--reveal-text); the last 20% holds the full image. Reduced motion keeps the CSS
// defaults (fully revealed).
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const active = new Set();
  let frame = 0;

  const apply = (section) => {
    const rect = section.getBoundingClientRect();
    const span = Math.max((rect.height - window.innerHeight) * 0.8, 1);
    const progress = Math.min(Math.max(-rect.top / span, 0), 1);
    // ponytail: progress² stands in for the reference's CSS ease-in curve
    section.style.setProperty('--reveal', (progress * progress).toFixed(4));
    section.style.setProperty('--reveal-text', Math.min(progress / 0.25, 1).toFixed(4));
  };

  const update = () => {
    frame = 0;
    active.forEach(apply);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) active.add(entry.target);
      else active.delete(entry.target);
      apply(entry.target);
    })
  );

  const init = (root) =>
    root.querySelectorAll('.about-reveal').forEach((section) => {
      apply(section);
      observer.observe(section);
    });

  init(document);
  document.addEventListener('shopify:section:load', (event) => init(event.target));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
})();

// Image banner background (reference: Futurer featured product, DESIGN-SYSTEM.md 7.1). The image is fixed to the
// viewport (CSS); while the banner crosses the screen it also drifts from 200px down to 200px up, linear in the
// scroll, and eases toward that point (200ms time constant), so it glides on briefly after the scroll stops, in both
// directions. The drift is held where the viewport-sized image still fills the banner's visible part, now and two
// frames on at the current scroll speed (the browser scrolls the page ahead of this script by a frame, plus one
// dropped frame), so lagging behind a fast scroll never uncovers it. Reduced motion keeps the still, fixed image.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const RANGE = 200;
  const SMOOTHING = 200;
  const states = new WeakMap();
  let frame = 0;
  let last = 0;

  const update = (now) => {
    const step = 1 - Math.exp(-(last ? now - last : 1000 / 60) / SMOOTHING);
    const viewport = window.innerHeight;
    let moving = false;
    document.querySelectorAll('.image-button__media').forEach((media) => {
      const rect = media.getBoundingClientRect();
      const previous = states.get(media);
      const ahead = previous && last ? 2 * (previous.top - rect.top) : 0;
      const progress = Math.min(Math.max((viewport - rect.top) / (viewport + rect.height), 0), 1);
      const min = Math.max(Math.min(rect.bottom, viewport), Math.min(rect.bottom - ahead, viewport)) - viewport;
      const max = Math.min(Math.max(rect.top, 0), Math.max(rect.top - ahead, 0));
      const clamp = (value) => Math.min(Math.max(value, min), max);
      const target = clamp(RANGE - 2 * RANGE * progress);
      const visible = rect.bottom > 0 && rect.top < viewport;
      let drift = visible && previous ? clamp(previous.drift + (target - previous.drift) * step) : target;
      if (Math.abs(target - drift) < 0.1) drift = target;
      else moving = true;
      states.set(media, { drift, top: rect.top });
      media.style.setProperty('--drift', `${drift.toFixed(2)}px`);
    });
    last = moving ? now : 0;
    frame = moving ? requestAnimationFrame(update) : 0;
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  schedule();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('shopify:section:load', schedule);
})();

// About page FAQ and the product page "Key Features" accordion: animates each <details> answer open and closed
// (height and fade) instead of the native jump.
// A click mid-animation reverses from the current height. .is-open drives the icon and colours straight away; the
// native open state follows (closing waits for the animation). Reduced motion keeps the native toggle.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const DURATION = 400;
  const EASING = 'cubic-bezier(0.31, 0.41, 0.38, 0.96)';
  const SUMMARY = '.about-faq__question, .product__features-summary';
  const ITEM = '.about-faq__item, .product__features';

  const toggle = (item) => {
    const answer = item.querySelector('.about-faq__answer, .product__features-content');
    const opening = !item.classList.contains('is-open');
    const from = item.open ? answer.getBoundingClientRect().height : 0;
    item._faqAnimation?.cancel();
    item.classList.toggle('is-open', opening);
    item.open = true;
    const to = opening ? answer.scrollHeight : 0;
    const animation = answer.animate(
      { height: [`${from}px`, `${to}px`], opacity: opening ? [0, 1] : [1, 0] },
      { duration: DURATION, easing: EASING }
    );
    item._faqAnimation = animation;
    animation.onfinish = () => {
      item._faqAnimation = null;
      if (!opening) item.open = false;
    };
  };

  document.addEventListener('click', (event) => {
    const summary = event.target.closest(SUMMARY);
    if (!summary) return;
    event.preventDefault();
    toggle(summary.parentElement);
  });

  // Opened some other way (find in page, keyboard in some browsers): keep the icon state in sync
  document.addEventListener(
    'toggle',
    (event) => {
      const item = event.target;
      if (item.matches?.(ITEM) && !item._faqAnimation) item.classList.toggle('is-open', item.open);
    },
    true
  );
})();

// Product quick view (reference: xo-futurer). A product card's eye link ([data-quick-view]) fetches the quick-view
// section for that product (Section Rendering API) and shows it in one shared modal: scale-in open, scale-out close,
// focus trapped, Escape / overlay / close button to close. Thumbnails and option pills switch the image, price,
// variant and button state. Adding to cart (Dawn's product-form) closes the modal before the cart drawer opens.
// Any fetch failure, or a modified click (new tab), follows the link to the product page instead.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let modal = null;
  let panel = null;
  let body = null;
  let opener = null;
  let request = null;
  let closeTimer = 0;

  const build = (closeLabel) => {
    modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.hidden = true;
    modal.innerHTML = `
      <span class="quick-view-modal__overlay" data-quick-view-close></span>
      <div class="quick-view-modal__panel" role="dialog" aria-modal="true" tabindex="-1">
        <button type="button" class="quick-view-modal__close" data-quick-view-close>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="m3.5 3.5 9 9m0-9-9 9"/></svg>
        </button>
        <div class="quick-view-modal__body"></div>
      </div>`;
    panel = modal.querySelector('.quick-view-modal__panel');
    body = modal.querySelector('.quick-view-modal__body');
    modal.querySelector('.quick-view-modal__close').setAttribute('aria-label', closeLabel || 'Close');
    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-quick-view-close]')) close();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
    document.body.appendChild(modal);
  };

  const setMedia = (view, mediaId) => {
    if (!mediaId) return;
    const slide = view.querySelector(`.quick-view__slide[data-media-id="${mediaId}"]`);
    if (!slide) return;
    view.querySelectorAll('.quick-view__slide, .quick-view__thumb').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.mediaId === String(mediaId));
    });
  };

  const setup = (view) => {
    const variants = JSON.parse(view.querySelector('[data-quick-view-variants]').textContent);
    const idInput = view.querySelector('input[name="id"]');
    const button = view.querySelector('.quick-view__add');
    const price = view.querySelector('[data-quick-view-price]');
    const details = view.querySelector('.quick-view__details');

    view.querySelectorAll('.quick-view__thumb').forEach((thumb) =>
      thumb.addEventListener('click', () => setMedia(view, thumb.dataset.mediaId))
    );

    view.addEventListener('change', (event) => {
      const radio = event.target.closest('input[data-option-index]');
      if (!radio) return;
      radio.closest('.quick-view__option').querySelector('[data-quick-view-option-value]').textContent = radio.value;
      const selected = [...view.querySelectorAll('input[data-option-index]:checked')].map((input) => input.value);
      const variant = variants.find((v) => v.options.every((value, i) => value === selected[i]));
      const label = button.querySelector('span');

      if (!variant) {
        button.disabled = true;
        label.textContent = button.dataset.labelUnavailable;
        return;
      }
      idInput.value = variant.id;
      button.disabled = !variant.available;
      label.textContent = variant.available ? button.dataset.labelAdd : button.dataset.labelSoldOut;

      const amount = document.createElement('span');
      amount.className = 'quick-view__amount';
      amount.textContent = variant.price;
      price.replaceChildren(amount);
      if (variant.compare) {
        const compare = document.createElement('s');
        compare.className = 'quick-view__compare';
        compare.textContent = variant.compare;
        price.append(compare);
      }

      const url = new URL(details.href, window.location.origin);
      url.searchParams.set('variant', variant.id);
      details.href = url.href;
      setMedia(view, variant.media);
    });
  };

  const finishClose = () => {
    clearTimeout(closeTimer);
    if (!modal) return;
    modal.hidden = true;
    modal.classList.remove('is-open', 'is-closing');
    body.innerHTML = '';
  };

  const close = ({ restoreFocus = true } = {}) => {
    if (!modal || modal.hidden || modal.classList.contains('is-closing')) return;
    modal.classList.remove('is-open');
    modal.classList.add('is-closing');
    document.body.classList.remove('overflow-hidden');
    removeTrapFocus(restoreFocus ? opener : null);
    closeTimer = setTimeout(finishClose, reduceMotion.matches ? 0 : 320);
  };

  const show = () => {
    clearTimeout(closeTimer);
    modal.classList.remove('is-open', 'is-closing');
    modal.hidden = false;
    const title = body.querySelector('.quick-view__title');
    if (title) panel.setAttribute('aria-labelledby', title.id);
    panel.scrollTop = 0;
    document.body.classList.add('overflow-hidden');
    void modal.offsetWidth; // start the transition from the closed state
    modal.classList.add('is-open');
    trapFocus(panel, modal.querySelector('.quick-view-modal__close'));
  };

  const open = async (link) => {
    if (link.classList.contains('loading')) return;
    request?.abort();
    request = new AbortController();
    opener = link;
    const spinner = link.querySelector('.loading__spinner');
    link.classList.add('loading');
    link.setAttribute('aria-busy', 'true');
    spinner?.classList.remove('hidden');
    try {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('section_id', 'quick-view');
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error(`Quick view ${response.status}`);
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const view = html.querySelector('.quick-view');
      if (!view) throw new Error('Quick view markup missing');
      if (!modal) build(link.dataset.closeLabel);
      finishClose();
      HTMLUpdateUtility.setInnerHTML(body, view.outerHTML);
      setup(body.querySelector('.quick-view'));
      window.Shopify?.PaymentButton?.init();
      show();
    } catch (error) {
      if (error.name !== 'AbortError') window.location.href = link.href;
    } finally {
      link.classList.remove('loading');
      link.removeAttribute('aria-busy');
      spinner?.classList.add('hidden');
    }
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-quick-view]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(link);
  });

  if (typeof subscribe === 'function') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (modal && !modal.hidden && event?.source === 'product-form') close({ restoreFocus: false });
    });
  }
})();
