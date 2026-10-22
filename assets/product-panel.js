// Product page "panel" style: previous/next buttons over the main image (desktop).
// They drive Dawn's own thumbnail buttons, so MediaGallery keeps the active image and thumbnails in sync.
if (!customElements.get('product-gallery-nav')) {
  customElements.define(
    'product-gallery-nav',
    class ProductGalleryNav extends HTMLElement {
      connectedCallback() {
        this.gallery = this.closest('media-gallery');
        this.addEventListener('click', this.onClick);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
      }

      onClick = (event) => {
        const button = event.target.closest('[data-gallery]');
        if (!button) return;

        // Thumbnails hidden by "hide other variants' media" are skipped
        const items = [...this.gallery.querySelectorAll('.thumbnail-list__item')].filter((item) => item.offsetParent);
        if (items.length < 2) return;
        const current = items.findIndex((item) => item.querySelector('[aria-current]'));
        const step = button.dataset.gallery === 'next' ? 1 : -1;
        const target = items[(current + step + items.length) % items.length];
        target.querySelector('button').click();
      };
    }
  );
}
