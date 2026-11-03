// Product page "panel" style: previous/next buttons over the main image (desktop).
// They drive Dawn's own thumbnail buttons, so MediaGallery keeps the active image and thumbnails in sync.
// Every image change (these buttons or a thumbnail) is animated (section-product-panel.css): the outgoing image is
// kept on top as .is-leaving while it fades out, and data-media-direction tells which side the new one comes from.
if (!customElements.get('product-gallery-nav')) {
  customElements.define(
    'product-gallery-nav',
    class ProductGalleryNav extends HTMLElement {
      connectedCallback() {
        this.gallery = this.closest('media-gallery');
        this.addEventListener('click', this.onClick);
        // Capture: runs before the thumbnail's own handler switches the image
        this.gallery.addEventListener('click', this.onThumbnailClick, true);
      }

      disconnectedCallback() {
        this.removeEventListener('click', this.onClick);
        this.gallery.removeEventListener('click', this.onThumbnailClick, true);
      }

      // Thumbnails hidden by "hide other variants' media" are skipped
      visibleThumbnails() {
        return [...this.gallery.querySelectorAll('.thumbnail-list__item')].filter((item) => item.offsetParent);
      }

      onClick = (event) => {
        const button = event.target.closest('[data-gallery]');
        if (!button) return;

        const items = this.visibleThumbnails();
        if (items.length < 2) return;
        const current = items.findIndex((item) => item.querySelector('[aria-current]'));
        const step = button.dataset.gallery === 'next' ? 1 : -1;
        const target = items[(current + step + items.length) % items.length];
        target.querySelector('button').click();
        // Wrapping round from the last image to the first still moves in the button's direction
        this.gallery.dataset.mediaDirection = step > 0 ? 'next' : 'prev';
      };

      onThumbnailClick = (event) => {
        const thumbnail = event.target.closest('.thumbnail-list__item');
        if (!thumbnail) return;
        const items = this.visibleThumbnails();
        const current = items.findIndex((item) => item.querySelector('[aria-current]'));
        const next = items.indexOf(thumbnail);
        if (current < 0 || next < 0 || next === current) return;

        this.gallery.dataset.mediaDirection = next > current ? 'next' : 'prev';
        this.gallery.querySelectorAll('.product__media-item.is-leaving').forEach((item) => item.classList.remove('is-leaving'));
        const leaving = this.gallery.querySelector('.product__media-list .product__media-item.is-active');
        if (!leaving) return;
        leaving.classList.add('is-leaving');
        leaving.addEventListener('animationend', () => leaving.classList.remove('is-leaving'), { once: true });
        // Fallback when no animation runs (reduced motion, small screens)
        setTimeout(() => leaving.classList.remove('is-leaving'), 600);
      };
    }
  );
}
