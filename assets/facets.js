class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 800);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const updateEvent = FacetFiltersForm.startUpdateEvent(searchParams);
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner',
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    const { path, query } = FacetFiltersForm.tagUrl(searchParams);
    sections.forEach((section) => {
      const url = `${path}?section_id=${section.section}&${query}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event, updateEvent)
        : FacetFiltersForm.renderSectionFromFetch(url, event, updateEvent);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static startUpdateEvent(searchParams) {
    const { SearchUpdateEvent, CollectionUpdateEvent } = window.StandardEvents || {};
    if (!SearchUpdateEvent && !CollectionUpdateEvent) return;

    const facetsForm = document.querySelector('facet-filters-form');
    const facetsContainer = document.querySelector('.facets-container');
    const collectionId = facetsContainer?.dataset.collectionId || null;
    const collectionHandle = facetsContainer?.dataset.collectionHandle || '';
    const currentCount = parseInt(document.getElementById('ProductCount')?.dataset.productCount) || 0;
    const urlSearchParams = new URLSearchParams(searchParams);
    const isSearchPage = facetsContainer?.dataset.template === 'search';
    const isCollectionPage = facetsContainer?.dataset.template === 'collection';
    const dispatchTarget = facetsForm || document;

    let deferred;

    if (isSearchPage) {
      deferred = SearchUpdateEvent.createPromise();
      dispatchTarget.dispatchEvent(
        new SearchUpdateEvent({
          search: {
            query: urlSearchParams.get('q') || '',
            productFilters: SearchUpdateEvent.parseProductFilters(urlSearchParams),
            sortKey: SearchUpdateEvent.getSortKey(urlSearchParams),
          },
          promise: deferred.promise,
        }),
      );
    } else if (isCollectionPage) {
      // collectionId is null for auto-generated collections (/collections/all,
      // /collections/vendors/<x>, etc.) — the SSE schema accepts that.
      deferred = CollectionUpdateEvent.createPromise();
      dispatchTarget.dispatchEvent(
        new CollectionUpdateEvent({
          collection: { id: collectionId, handle: collectionHandle, productsCount: currentCount },
          productFilters: CollectionUpdateEvent.parseProductFilters(urlSearchParams),
          sortKey: CollectionUpdateEvent.getSortKey(urlSearchParams),
          promise: deferred.promise,
        }),
      );
    }

    if (!deferred) return;

    return {
      resolve: (filteredCount) => {
        deferred.resolve({ [isSearchPage ? 'totalCount' : 'productsCount']: filteredCount });
      },
      reject: deferred.reject,
    };
  }

  static renderSectionFromFetch(url, event, updateEvent) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderSection(html, event, updateEvent);
      })
      .catch((error) => {
        console.error(error);
        updateEvent?.reject(error);
      });
  }

  static renderSectionFromCache(filterDataUrl, event, updateEvent) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderSection(html, event, updateEvent);
  }

  static renderSection(html, event, updateEvent) {
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html, updateEvent);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
  }

  static renderProductCount(html, updateEvent) {
    const parsedHtml = new DOMParser().parseFromString(html, 'text/html');
    const sourceCount = parsedHtml.getElementById('ProductCount');
    const count = sourceCount.innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.dataset.productCount = sourceCount.dataset.productCount || '';
    container.dataset.totalCount = sourceCount.dataset.totalCount || '';
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner',
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));

    updateEvent?.resolve(parseInt(sourceCount.dataset.productCount) || 0);
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter',
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter',
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newFacetDetailsElement = document.getElementById(closestJSFilterID);

        const isTextInput = event.target.getAttribute('type') === 'text';

        if (!isTextInput) {
          // Try to return focus to the same checkbox the user just toggled,
          // re-selecting it from the freshly rendered HTML by its id.
          const originatingInputId = event.target.id;
          const matchingInput = originatingInputId
            ? newFacetDetailsElement.querySelector(`#${CSS.escape(originatingInputId)}`)
            : null;

          if (matchingInput) {
            matchingInput.focus();
          } else {
            // Fallback to summary/close button if the checkbox can't be found
            const fallbackSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
              ? `.mobile-facets__close-button`
              : `.facets__summary`;
            const fallbackElement = newFacetDetailsElement.querySelector(fallbackSelector);
            if (fallbackElement) fallbackElement.focus();
          }
        }
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    const { path, query } = FacetFiltersForm.tagUrl(searchParams);
    history.pushState({ searchParams }, '', `${path}${query && '?'.concat(query)}`);
  }

  // Tag filter (snippets/facets-tags): Shopify filters a collection by tag through the URL path,
  // /collections/<handle>/<tag>+<tag>, so the form's filter.tag values go into the path and the other filters stay in
  // the query. Without the tag filter on the page (search results) the URL is left as it was.
  static tagBase() {
    return document.querySelector('[data-tag-filter-base]')?.dataset.tagFilterBase;
  }

  static tagUrl(searchParams) {
    const base = FacetFiltersForm.tagBase();
    if (!base) return { path: window.location.pathname, query: searchParams };
    const params = new URLSearchParams(searchParams);
    const tags = params.getAll('filter.tag');
    params.delete('filter.tag');
    return { path: tags.length ? `${base}/${tags.join('+')}` : base, query: params.toString() };
  }

  // The reverse: a URL's query plus its path tags as filter.tag values
  static paramsFromUrl(href) {
    const url = new URL(href, window.location.origin);
    const params = new URLSearchParams(url.search);
    const base = FacetFiltersForm.tagBase();
    if (base && url.pathname.startsWith(`${base}/`)) {
      url.pathname
        .slice(base.length + 1)
        .split('+')
        .filter(Boolean)
        .forEach((tag) => params.append('filter.tag', decodeURIComponent(tag)));
    }
    return params.toString();
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const link = event.currentTarget;
    const current = new URLSearchParams(FacetFiltersForm.searchParamsPrev);
    const currentTags = current.getAll('filter.tag');
    let params;
    if (link.dataset.tagRemove !== undefined || link.dataset.tagClear !== undefined) {
      // A tag pill or the Tags filter's own clear link: the current filters without that tag (or without all tags)
      params = current;
      params.delete('filter.tag');
      if (link.dataset.tagRemove !== undefined) {
        currentTags.filter((tag) => tag !== link.dataset.tagRemove).forEach((tag) => params.append('filter.tag', tag));
      }
    } else {
      // Shopify's own remove links; they keep the selected tags unless they carry tags of their own or clear everything
      params = new URLSearchParams(FacetFiltersForm.paramsFromUrl(link.href));
      if (!params.has('filter.tag') && !link.classList.contains('active-facets__button-remove')) {
        currentTags.forEach((tag) => params.append('filter.tag', tag));
      }
    }
    FacetFiltersForm.renderPage(params.toString());
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = FacetFiltersForm.paramsFromUrl(window.location.href);
FacetFiltersForm.searchParamsPrev = FacetFiltersForm.searchParamsInitial;
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input').forEach((element) => {
      element.addEventListener('change', this.onRangeChange.bind(this));
      element.addEventListener('keydown', this.onKeyDown.bind(this));
    });
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  onKeyDown(event) {
    if (event.metaKey) return;

    const pattern = /[0-9]|\.|,|'| |Tab|Backspace|Enter|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Delete|Escape/;
    if (!event.key.match(pattern)) event.preventDefault();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('data-max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('data-min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('data-min', 0);
    if (maxInput.value === '') minInput.setAttribute('data-max', maxInput.getAttribute('data-max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('data-min'));
    const max = Number(input.getAttribute('data-max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
