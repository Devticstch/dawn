// Product page "panel" style: previous/next buttons over the main image (desktop).
// They drive Dawn's own thumbnail buttons, so MediaGallery keeps the active image and thumbnails in sync.
// Every image change (these buttons or a thumbnail) cross-fades (section-product-panel.css): the outgoing image stays
// on top (.is-leaving) over the new one until the new photo is decoded, then fades out (.is-fading), so the new image
// is never shown half-loaded. The other gallery photos load once the page is idle, so they are ready before a click.
if (!customElements.get('product-gallery-nav')) {
  customElements.define(
    'product-gallery-nav',
    class ProductGalleryNav extends HTMLElement {
      connectedCallback() {
        this.gallery = this.closest('media-gallery');
        this.addEventListener('click', this.onClick);
        // Capture: runs before the thumbnail's own handler switches the image
        this.gallery.addEventListener('click', this.onThumbnailClick, true);

        const preload = () =>
          this.gallery.querySelectorAll('.product__media-list img[loading="lazy"]').forEach((img) => {
            img.loading = 'eager';
          });
        if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 3000 });
        else setTimeout(preload, 2000);
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
      };

      onThumbnailClick = (event) => {
        const thumbnail = event.target.closest('.thumbnail-list__item');
        if (!thumbnail || thumbnail.querySelector('[aria-current]')) return;

        // A click during a fade ends it at once
        this.gallery.querySelectorAll('.product__media-item.is-leaving').forEach(this.endFade);
        const leaving = this.gallery.querySelector('.product__media-list .product__media-item.is-active');
        if (!leaving) return;
        // Pinned exactly where it is now, which is where the new image appears
        leaving.style.setProperty('--pp-leave-x', `${leaving.offsetLeft}px`);
        leaving.style.setProperty('--pp-leave-y', `${leaving.offsetTop}px`);
        leaving.style.setProperty('--pp-leave-width', `${leaving.offsetWidth}px`);
        leaving.classList.add('is-leaving');

        // Fades once the new photo is ready to show (at most 1.2s on a slow connection, the old one staying meanwhile)
        const image = this.gallery.querySelector(`[data-media-id="${thumbnail.dataset.target}"] img`);
        const decoded = image ? image.decode().catch(() => {}) : Promise.resolve();
        Promise.race([decoded, new Promise((resolve) => setTimeout(resolve, 1200))]).then(() => {
          if (!leaving.classList.contains('is-leaving')) return;
          leaving.classList.add('is-fading');
          setTimeout(() => this.endFade(leaving), 450);
        });
      };

      endFade = (item) => {
        item.classList.remove('is-leaving', 'is-fading');
        ['--pp-leave-x', '--pp-leave-y', '--pp-leave-width'].forEach((name) => item.style.removeProperty(name));
      };
    }
  );
}
