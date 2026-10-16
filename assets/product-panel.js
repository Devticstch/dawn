// Product page "panel" style: previous/next and zoom buttons over the main image (desktop).
// They drive Dawn's own controls, so MediaGallery keeps the active image, thumbnails and lightbox in sync.
if (!customElements.get('product-gallery-nav')) {
  customElements.define(
    'product-gallery-nav',
    class ProductGalleryNav extends HTMLElement {
      connectedCallback() {
        this.gallery = this.closest('media-gallery');
        this.addEventListener('click', this.onClick);
        this.addEventListener('focusin', this.syncZoomLabel);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.removeEventListener('focusin', this.syncZoomLabel);
      }

      activeToggle() {
        return this.gallery.querySelector('.product__media-item.is-active .product__media-toggle');
      }

      // The zoom button announces the same "Open media N in modal" label as the active image
      syncZoomLabel = () => {
        const label = this.activeToggle()?.textContent.trim();
        const zoom = this.querySelector('[data-gallery="zoom"]');
        if (zoom && label) zoom.setAttribute('aria-label', label);
      };

      onClick = (event) => {
        const button = event.target.closest('[data-gallery]');
        if (!button) return;

        if (button.dataset.gallery === 'zoom') {
          this.activeToggle()?.click();
          return;
        }

        // Thumbnails hidden by "hide other variants' media" are skipped
        const items = [...this.gallery.querySelectorAll('.thumbnail-list__item')].filter((item) => item.offsetParent);
        if (items.length < 2) return;
        const current = items.findIndex((item) => item.querySelector('[aria-current]'));
        const step = button.dataset.gallery === 'next' ? 1 : -1;
        const target = items[(current + step + items.length) % items.length];
        target.querySelector('button').click();
        this.syncZoomLabel();
      };
    }
  );
}
