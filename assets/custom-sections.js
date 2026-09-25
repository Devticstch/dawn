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
