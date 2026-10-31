import {
  EDITORIAL_MEDIA,
  FEATURED_COLLECTIONS,
  PRODUCTS,
  SAMPLE_REVIEWS,
  POLICY_MODALS
} from './data/products.js';

const STORAGE_KEYS = {
  BAG: 'velora_demo_bag_v1',
  WISHLIST: 'velora_demo_wishlist_v1'
};

const FREE_SHIPPING_THRESHOLD = 250;
const STANDARD_SHIPPING_FEE = 15;

// Application State
const state = {
  view: 'storefront', // 'storefront' | 'pdp'
  activeProductId: null,
  pdpSelection: {
    color: '',
    size: '',
    quantity: 1,
    mediaMode: 'full', // 'full' | 'detail'
    sizeError: false
  },
  cardSelections: {}, // { [productId]: { color, size, sizeError } }
  filters: {
    category: 'all',
    collection: 'all',
    price: 'all',
    size: 'all',
    color: 'all',
    availability: 'all',
    sort: 'featured'
  },
  bag: [],
  wishlist: [],
  checkoutStep: 'bag', // 'bag' | 'checkout' | 'preview-complete'
  activeOverlay: null // 'bag' | 'wishlist' | 'mobile-nav' | 'search' | 'info' | null
};

// Initialize per-card default color selections
for (const product of PRODUCTS) {
  state.cardSelections[product.id] = {
    color: product.defaultColor,
    size: '',
    sizeError: false
  };
}

// ---------- Persistence Helpers ----------

function loadPersistedState() {
  try {
    const rawBag = window.localStorage.getItem(STORAGE_KEYS.BAG);
    if (rawBag) {
      const parsed = JSON.parse(rawBag);
      if (Array.isArray(parsed)) {
        state.bag = parsed.filter(
          (item) =>
            item &&
            typeof item.productId === 'string' &&
            PRODUCTS.some((p) => p.id === item.productId) &&
            typeof item.quantity === 'number' &&
            item.quantity > 0
        );
      }
    }
  } catch {
    state.bag = [];
  }

  try {
    const rawWishlist = window.localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (rawWishlist) {
      const parsed = JSON.parse(rawWishlist);
      if (Array.isArray(parsed)) {
        state.wishlist = parsed.filter(
          (id) => typeof id === 'string' && PRODUCTS.some((p) => p.id === id)
        );
      }
    }
  } catch {
    state.wishlist = [];
  }
}

function saveBag() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.BAG, JSON.stringify(state.bag));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

function saveWishlist() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(state.wishlist));
  } catch {
    // Ignore storage quota errors
  }
}

// ---------- Formatting & Resilient Image Helper ----------

function formatCurrency(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderResilientImage({ src, alt, imgClass = 'w-full h-full object-cover', label = 'VELORA' }) {
  return `
    <div class="relative w-full h-full overflow-hidden bg-[#E7E1D6]">
      <img
        src="${escapeHtml(src)}"
        alt="${escapeHtml(alt)}"
        referrerpolicy="no-referrer"
        loading="lazy"
        class="${imgClass}"
        data-resilient-img
      />
      <div class="hidden absolute inset-0 flex-col items-center justify-center p-6 text-center bg-[#E7E1D6] text-[#57524B]" data-img-fallback>
        <span class="font-editorial text-xl tracking-[0.18em] text-[#141312] mb-1">VELORA</span>
        <span class="text-xs">${escapeHtml(label)}</span>
      </div>
    </div>
  `;
}

function bindImageFallbacks(root = document) {
  const imgs = root.querySelectorAll('img[data-resilient-img]');
  imgs.forEach((img) => {
    if (img.dataset.boundFallback === 'true') return;
    img.dataset.boundFallback = 'true';
    img.addEventListener('error', () => {
      img.classList.add('hidden');
      const fallback = img.parentElement?.querySelector('[data-img-fallback]');
      if (fallback) {
        fallback.classList.remove('hidden');
        fallback.classList.add('flex');
      }
    });
  });
}

// ---------- Toast Notification ----------

let toastTimer = null;
function showToast(message) {
  const banner = document.getElementById('toast-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.setAttribute('data-open', 'true');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    banner.setAttribute('data-open', 'false');
  }, 3200);
}

// ---------- Header Scroll Governance ----------

function syncHeaderAppearance() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const shouldBeSolid = state.view === 'pdp' || window.scrollY > 44;
  header.setAttribute('data-solid', shouldBeSolid ? 'true' : 'false');
}

// ---------- Editorial Static Media Slots ----------

function mountEditorialMedia() {
  const heroSlot = document.getElementById('hero-media-slot');
  if (heroSlot) {
    heroSlot.innerHTML = renderResilientImage({
      src: EDITORIAL_MEDIA.hero.src,
      alt: EDITORIAL_MEDIA.hero.alt,
      imgClass: 'w-full h-full object-cover object-center',
      label: 'Autumn / Winter Campaign'
    });
  }

  const storySlot = document.getElementById('story-media-slot');
  if (storySlot) {
    storySlot.innerHTML = renderResilientImage({
      src: EDITORIAL_MEDIA.story.src,
      alt: EDITORIAL_MEDIA.story.alt,
      imgClass: 'w-full h-full object-cover object-center',
      label: 'Designed for Everyday Living'
    });
  }

  const campaignSlot = document.getElementById('campaign-media-slot');
  if (campaignSlot) {
    campaignSlot.innerHTML = renderResilientImage({
      src: EDITORIAL_MEDIA.campaign.src,
      alt: EDITORIAL_MEDIA.campaign.alt,
      imgClass: 'w-full h-full object-cover object-center',
      label: 'A New Perspective on Everyday Style'
    });
  }

  bindImageFallbacks(document);
}

// ---------- Featured Collections (Editorial Asymmetric + Full-Bleed) ----------

function renderCollections() {
  const container = document.getElementById('collections-container');
  if (!container) return;

  const [essentials, tailoring, weekend] = FEATURED_COLLECTIONS;

  container.innerHTML = `
    <!-- Row 1: Asymmetric Editorial Split (7 cols wide 4:3 + 5 cols vertical 3:4 portrait) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
      <!-- Everyday Essentials -->
      <article class="lg:col-span-7 relative group editorial-media overflow-hidden bg-[#2C2B29] min-h-[420px] sm:min-h-[520px] lg:min-h-[600px] flex items-end">
        <div class="absolute inset-0">
          ${renderResilientImage({
            src: essentials.image,
            alt: essentials.alt,
            imgClass: 'w-full h-full object-cover object-top',
            label: essentials.title
          })}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-[#141312]/80 via-[#141312]/28 to-transparent pointer-events-none"></div>
        <div class="relative z-10 p-7 sm:p-10 lg:p-12 text-[#F8F6F1] max-w-lg">
          <p class="text-xs tracking-[0.14em] text-[#E7E1D6] mb-2">${escapeHtml(essentials.kicker)}</p>
          <h3 class="font-editorial text-3xl sm:text-4xl font-normal mb-3">${escapeHtml(essentials.title)}</h3>
          <p class="text-sm text-[#F2EFE8]/90 leading-relaxed mb-6">${escapeHtml(essentials.subtitle)}</p>
          <button
            type="button"
            data-collection-jump="${escapeHtml(essentials.id)}"
            class="inline-flex items-center justify-center h-11 px-6 bg-[#F8F6F1] text-[#141312] text-xs font-medium tracking-[0.04em] hover:bg-[#E7E1D6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ${escapeHtml(essentials.cta)}
          </button>
        </div>
      </article>

      <!-- Modern Tailoring -->
      <article class="lg:col-span-5 relative group editorial-media overflow-hidden bg-[#2C2B29] min-h-[460px] sm:min-h-[540px] lg:min-h-[600px] flex items-end">
        <div class="absolute inset-0">
          ${renderResilientImage({
            src: tailoring.image,
            alt: tailoring.alt,
            imgClass: 'w-full h-full object-cover object-top',
            label: tailoring.title
          })}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-[#141312]/82 via-[#141312]/30 to-transparent pointer-events-none"></div>
        <div class="relative z-10 p-7 sm:p-10 text-[#F8F6F1]">
          <p class="text-xs tracking-[0.14em] text-[#E7E1D6] mb-2">${escapeHtml(tailoring.kicker)}</p>
          <h3 class="font-editorial text-3xl sm:text-4xl font-normal mb-3">${escapeHtml(tailoring.title)}</h3>
          <p class="text-sm text-[#F2EFE8]/90 leading-relaxed mb-6">${escapeHtml(tailoring.subtitle)}</p>
          <button
            type="button"
            data-collection-jump="${escapeHtml(tailoring.id)}"
            class="inline-flex items-center justify-center h-11 px-6 bg-[#F8F6F1] text-[#141312] text-xs font-medium tracking-[0.04em] hover:bg-[#E7E1D6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            ${escapeHtml(tailoring.cta)}
          </button>
        </div>
      </article>
    </div>

    <!-- Row 2: Full-Width Cinematic Editorial Feature -->
    <article class="relative group editorial-media overflow-hidden bg-[#2C2B29] min-h-[400px] sm:min-h-[480px] lg:min-h-[540px] flex items-end">
      <div class="absolute inset-0">
        ${renderResilientImage({
          src: weekend.image,
          alt: weekend.alt,
          imgClass: 'w-full h-full object-cover object-center',
          label: weekend.title
        })}
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#141312]/82 via-[#141312]/40 to-transparent pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#141312]/70 via-transparent to-transparent pointer-events-none"></div>
      <div class="relative z-10 p-7 sm:p-10 lg:p-14 text-[#F8F6F1] max-w-xl">
        <p class="text-xs tracking-[0.14em] text-[#E7E1D6] mb-2">${escapeHtml(weekend.kicker)}</p>
        <h3 class="font-editorial text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] font-normal mb-3">${escapeHtml(weekend.title)}</h3>
        <p class="text-sm sm:text-[15px] text-[#F2EFE8]/90 leading-relaxed mb-7">${escapeHtml(weekend.subtitle)}</p>
        <button
          type="button"
          data-collection-jump="${escapeHtml(weekend.id)}"
          class="inline-flex items-center justify-center h-11 px-6 bg-[#F8F6F1] text-[#141312] text-xs font-medium tracking-[0.04em] hover:bg-[#E7E1D6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          ${escapeHtml(weekend.cta)}
        </button>
      </div>
    </article>
  `;

  bindImageFallbacks(container);
}

// ---------- Filtering & Sorting Engine ----------

function getFilteredProducts() {
  const { category, collection, price, size, color, availability, sort } = state.filters;

  const filtered = PRODUCTS.filter((product) => {
    if (category !== 'all' && product.category !== category) return false;
    if (collection !== 'all' && product.collection !== collection) return false;

    if (price === 'under-150' && product.price >= 150) return false;
    if (price === '150-225' && (product.price < 150 || product.price > 225)) return false;
    if (price === 'over-225' && product.price <= 225) return false;

    if (size !== 'all' && !product.sizes.includes(size)) return false;
    if (color !== 'all' && !product.colors.includes(color)) return false;
    if (availability !== 'all' && product.availability !== availability) return false;

    return true;
  });

  const sorted = [...filtered];
  if (sort === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    sorted.sort((a, b) => {
      if (a.isNewArrival !== b.isNewArrival) return a.isNewArrival ? -1 : 1;
      return a.arrivalRank - b.arrivalRank;
    });
  }

  return sorted;
}

function hasActiveFilters() {
  const f = state.filters;
  return (
    f.category !== 'all' ||
    f.collection !== 'all' ||
    f.price !== 'all' ||
    f.size !== 'all' ||
    f.color !== 'all' ||
    f.availability !== 'all' ||
    f.sort !== 'featured'
  );
}

function syncFilterControlsUI() {
  // Category tabs
  document.querySelectorAll('.cat-tab').forEach((btn) => {
    const isSelected = btn.getAttribute('data-category') === state.filters.category;
    btn.className = isSelected
      ? 'cat-tab h-9 px-4 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 bg-[#141312] text-[#F8F6F1]'
      : 'cat-tab h-9 px-4 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 text-[#57524B] hover:text-[#141312]';
  });

  const selects = [
    ['filter-collection', state.filters.collection],
    ['filter-price', state.filters.price],
    ['filter-size', state.filters.size],
    ['filter-color', state.filters.color],
    ['filter-availability', state.filters.availability],
    ['filter-sort', state.filters.sort]
  ];
  for (const [id, val] of selects) {
    const el = document.getElementById(id);
    if (el && el.value !== val) el.value = val;
  }

  // Dynamic Catalog Heading & Kicker when Collection is selected
  const kicker = document.getElementById('catalog-kicker');
  const heading = document.getElementById('catalog-heading');
  if (kicker && heading) {
    if (state.filters.collection !== 'all') {
      kicker.textContent = 'Featured Collection';
      heading.textContent = state.filters.collection;
    } else if (state.filters.sort === 'newest') {
      kicker.textContent = 'Seasonal Dispatch';
      heading.textContent = 'New Arrivals';
    } else if (state.filters.category !== 'all') {
      kicker.textContent = 'Category Selection';
      heading.textContent = state.filters.category;
    } else {
      kicker.textContent = 'Complete Wardrobe';
      heading.textContent = 'Considered Apparel';
    }
  }

  const clearBtn = document.getElementById('clear-filters-top');
  const clearDivider = document.getElementById('clear-filters-divider');
  const active = hasActiveFilters();
  if (clearBtn && clearDivider) {
    clearBtn.classList.toggle('hidden', !active);
    clearDivider.classList.toggle('hidden', !active);
  }
}

function resetAllFilters() {
  state.filters = {
    category: 'all',
    collection: 'all',
    price: 'all',
    size: 'all',
    color: 'all',
    availability: 'all',
    sort: 'featured'
  };
  syncFilterControlsUI();
  renderCatalog();
}

// ---------- Render Product Catalog Cards ----------

function renderCatalog() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('catalog-empty-state');
  const countEl = document.getElementById('catalog-result-count');
  if (!grid || !emptyState || !countEl) return;

  const products = getFilteredProducts();
  countEl.textContent = `Showing ${products.length} of ${PRODUCTS.length} pieces`;

  if (products.length === 0) {
    grid.innerHTML = '';
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  grid.classList.remove('hidden');

  grid.innerHTML = products
    .map((product) => {
      const sel = state.cardSelections[product.id];
      const isSaved = state.wishlist.includes(product.id);
      const statusNote = product.isNewArrival
        ? 'New Arrival'
        : product.availability === 'made-to-order'
        ? 'Made to Order'
        : product.collection;

      return `
        <article class="product-card flex flex-col group" data-product-card="${escapeHtml(product.id)}">
          <!-- 3:4 Portrait Lookbook Image -->
          <div class="relative aspect-[3/4] w-full bg-[#E7E1D6] overflow-hidden mb-4 editorial-media">
            <button
              type="button"
              data-open-pdp="${escapeHtml(product.id)}"
              aria-label="View details for ${escapeHtml(product.name)}"
              class="block w-full h-full text-left cursor-pointer"
            >
              ${renderResilientImage({
                src: product.image,
                alt: product.imageAlt,
                imgClass: 'w-full h-full object-cover object-top',
                label: product.name
              })}
            </button>

            <!-- Wishlist Toggle Button -->
            <button
              type="button"
              data-toggle-wishlist="${escapeHtml(product.id)}"
              aria-pressed="${isSaved ? 'true' : 'false'}"
              aria-label="${isSaved ? 'Remove' : 'Save'} ${escapeHtml(product.name)} ${isSaved ? 'from' : 'to'} wishlist"
              class="absolute top-3.5 right-3.5 w-10 h-10 flex items-center justify-center bg-[#F8F6F1]/90 hover:bg-[#F8F6F1] text-[#141312] transition-colors cursor-pointer"
            >
              <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25s-7.5-4.35-7.5-10.125a4.5 4.5 0 0 1 7.5-3.35 4.5 4.5 0 0 1 7.5 3.35c0 5.775-7.5 10.125-7.5 10.125Z" />
              </svg>
            </button>
          </div>

          <!-- Clean Unboxed Metadata -->
          <div class="flex items-center gap-2 text-[11px] tracking-[0.04em] text-[#6B645B] mb-1.5">
            <span>${escapeHtml(product.category)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(statusNote)}</span>
          </div>

          <!-- Title & Price -->
          <div class="flex items-baseline justify-between gap-4 mb-1.5">
            <h3 class="font-sans text-[15px] font-semibold text-[#141312] leading-snug">
              <button
                type="button"
                data-open-pdp="${escapeHtml(product.id)}"
                class="text-left hover:underline underline-offset-4 cursor-pointer"
              >
                ${escapeHtml(product.name)}
              </button>
            </h3>
            <span class="text-[15px] text-[#141312] tabular-price shrink-0">${formatCurrency(product.price)}</span>
          </div>

          <p class="text-xs text-[#57524B] leading-relaxed mb-4 line-clamp-2">
            ${escapeHtml(product.shortDescription)}
          </p>

          <!-- Interactive Color & Size Controls -->
          <div class="mt-auto pt-3 border-t border-[#141312]/8 space-y-3">
            <!-- Color Swatches -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2" role="group" aria-label="Select color for ${escapeHtml(product.name)}">
                ${product.colors
                  .map((c) => {
                    const active = sel.color === c;
                    return `
                      <button
                        type="button"
                        data-card-color="${escapeHtml(product.id)}"
                        data-color-val="${escapeHtml(c)}"
                        title="${escapeHtml(c)}"
                        aria-label="${escapeHtml(c)}"
                        aria-pressed="${active ? 'true' : 'false'}"
                        class="w-6 h-6 flex items-center justify-center border ${
                          active ? 'border-[#141312]' : 'border-transparent hover:border-[#141312]/40'
                        } cursor-pointer transition-colors"
                      >
                        <span class="swatch-fill w-4 h-4 border border-[#141312]/20" data-color="${escapeHtml(c)}"></span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
              <span class="text-[11px] text-[#6B645B] truncate">${escapeHtml(sel.color)}</span>
            </div>

            <!-- Size Selector Row -->
            <div>
              <div
                class="flex items-center gap-1.5 flex-wrap ${sel.sizeError ? 'size-error-shake' : ''}"
                role="group"
                aria-label="Select size for ${escapeHtml(product.name)}"
              >
                ${product.sizes
                  .map((s) => {
                    const active = sel.size === s;
                    return `
                      <button
                        type="button"
                        data-card-size="${escapeHtml(product.id)}"
                        data-size-val="${escapeHtml(s)}"
                        aria-pressed="${active ? 'true' : 'false'}"
                        class="h-8 min-w-[36px] px-2 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          active
                            ? 'bg-[#141312] text-[#F8F6F1] border-[#141312]'
                            : sel.sizeError
                            ? 'border-[#8C3B2B] text-[#141312] hover:border-[#141312]'
                            : 'border-[#141312]/18 text-[#3F3C38] hover:border-[#141312]'
                        }"
                      >
                        ${escapeHtml(s)}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
              ${
                sel.sizeError
                  ? `<p class="text-[11px] text-[#8C3B2B] mt-1.5" role="alert">Please select a size to add to your bag.</p>`
                  : ''
              }
            </div>

            <!-- Add to Bag & Details Actions -->
            <div class="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                data-card-add="${escapeHtml(product.id)}"
                class="flex-1 h-10 px-4 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Add to Bag
              </button>
              <button
                type="button"
                data-open-pdp="${escapeHtml(product.id)}"
                class="h-10 px-3.5 border border-[#141312]/18 text-xs font-medium text-[#141312] hover:border-[#141312] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Details
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  bindImageFallbacks(grid);
}

// ---------- Render Sample Customer Reviews ----------

function renderReviews() {
  const grid = document.getElementById('reviews-grid');
  if (!grid) return;

  grid.innerHTML = SAMPLE_REVIEWS.map((rev) => {
    const matchedProduct = PRODUCTS.find((p) => p.name === rev.piece);
    return `
      <blockquote class="flex flex-col justify-between p-7 sm:p-8 bg-[#F2EFE8] border border-[#141312]/8">
        <p class="font-editorial text-xl sm:text-[22px] leading-[1.45] text-[#141312] mb-8">
          &ldquo;${escapeHtml(rev.quote)}&rdquo;
        </p>
        <footer class="pt-5 border-t border-[#141312]/10 space-y-1">
          <p class="text-sm font-medium text-[#141312]">${escapeHtml(rev.author)}</p>
          <p class="text-xs text-[#6B645B]">${escapeHtml(rev.context)}</p>
          ${
            matchedProduct
              ? `<button
                  type="button"
                  data-open-pdp="${escapeHtml(matchedProduct.id)}"
                  class="inline-block pt-1.5 text-xs text-[#141312] underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
                >
                  View ${escapeHtml(rev.piece)}
                </button>`
              : ''
          }
        </footer>
      </blockquote>
    `;
  }).join('');
}

// ---------- Dedicated Product Detail View (PDP) ----------

function openProductDetail(productId, pushHash = true) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  state.view = 'pdp';
  state.activeProductId = product.id;

  const existingCardSel = state.cardSelections[product.id];
  state.pdpSelection = {
    color: existingCardSel?.color || product.defaultColor,
    size: existingCardSel?.size || '',
    quantity: 1,
    mediaMode: 'full',
    sizeError: false
  };

  closeAllOverlays();

  const storefrontEl = document.getElementById('storefront-view');
  const pdpEl = document.getElementById('pdp-view');
  if (storefrontEl && pdpEl) {
    storefrontEl.classList.add('hidden');
    pdpEl.classList.remove('hidden');
  }

  if (pushHash) {
    window.history.pushState({ productId: product.id }, '', `#product/${product.id}`);
  }

  renderProductDetail();
  syncHeaderAppearance();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProductDetail(scrollToTargetId = null) {
  state.view = 'storefront';
  state.activeProductId = null;

  const storefrontEl = document.getElementById('storefront-view');
  const pdpEl = document.getElementById('pdp-view');
  if (storefrontEl && pdpEl) {
    pdpEl.classList.add('hidden');
    storefrontEl.classList.remove('hidden');
  }

  if (window.location.hash.startsWith('#product/')) {
    window.history.pushState({}, '', window.location.pathname);
  }

  renderCatalog();
  syncHeaderAppearance();

  if (scrollToTargetId) {
    const target = document.getElementById(scrollToTargetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

function renderProductDetail() {
  const product = PRODUCTS.find((p) => p.id === state.activeProductId);
  if (!product) return;

  const catCrumb = document.getElementById('pdp-breadcrumb-category');
  const nameCrumb = document.getElementById('pdp-breadcrumb-name');
  if (catCrumb) catCrumb.textContent = product.category;
  if (nameCrumb) nameCrumb.textContent = product.name;

  const content = document.getElementById('pdp-content');
  const relatedGrid = document.getElementById('pdp-related-grid');
  if (!content || !relatedGrid) return;

  const sel = state.pdpSelection;
  const isSaved = state.wishlist.includes(product.id);
  const availabilityLabel =
    product.availability === 'in-stock'
      ? 'In Stock · Ships in 1–2 business days'
      : 'Made to Order · Ships in 4–5 business days';

  content.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
      <!-- Left Sticky Gallery Column -->
      <div class="lg:col-span-7 space-y-4">
        <div class="aspect-[3/4] w-full bg-[#E7E1D6] overflow-hidden ${
          sel.mediaMode === 'detail' ? 'pdp-media-detail' : ''
        }">
          ${renderResilientImage({
            src: product.image,
            alt: product.imageAlt,
            imgClass: 'w-full h-full object-cover object-top transition-transform duration-500',
            label: product.name
          })}
        </div>

        <!-- Perspective Framing Switcher -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            data-pdp-media="full"
            class="h-10 px-4 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              sel.mediaMode === 'full'
                ? 'bg-[#141312] text-[#F8F6F1] border-[#141312]'
                : 'border-[#141312]/18 text-[#57524B] hover:border-[#141312]'
            }"
          >
            Full Lookbook View
          </button>
          <button
            type="button"
            data-pdp-media="detail"
            class="h-10 px-4 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              sel.mediaMode === 'detail'
                ? 'bg-[#141312] text-[#F8F6F1] border-[#141312]'
                : 'border-[#141312]/18 text-[#57524B] hover:border-[#141312]'
            }"
          >
            Fabric &amp; Drape Study
          </button>
        </div>
      </div>

      <!-- Right Contiguous Purchase Module -->
      <div class="lg:col-span-5 lg:sticky lg:top-28 space-y-7">
        <div>
          <div class="flex items-center gap-2 text-xs text-[#6B645B] mb-2">
            <span>${escapeHtml(product.collection)}</span>
            <span aria-hidden="true">·</span>
            <span>${escapeHtml(availabilityLabel)}</span>
          </div>
          <h1 class="font-editorial text-4xl sm:text-[44px] leading-[1.08] font-normal text-[#141312] mb-3">
            ${escapeHtml(product.name)}
          </h1>
          <p class="text-xl text-[#141312] tabular-price font-medium">
            ${formatCurrency(product.price)}
          </p>
        </div>

        <p class="text-[15px] text-[#3F3C38] leading-[1.7]">
          ${escapeHtml(product.description)}
        </p>

        <!-- Color Selector -->
        <div class="space-y-2.5 pt-2 border-t border-[#141312]/10">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[#6B645B]">Color</span>
            <span class="font-medium text-[#141312]">${escapeHtml(sel.color)}</span>
          </div>
          <div class="flex items-center gap-2.5" role="group" aria-label="Select color">
            ${product.colors
              .map((c) => {
                const active = sel.color === c;
                return `
                  <button
                    type="button"
                    data-pdp-color="${escapeHtml(c)}"
                    aria-pressed="${active ? 'true' : 'false'}"
                    aria-label="${escapeHtml(c)}"
                    class="h-10 px-3 inline-flex items-center gap-2 border text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'border-[#141312] bg-[#F2EFE8] text-[#141312] font-medium'
                        : 'border-[#141312]/18 text-[#57524B] hover:border-[#141312]'
                    }"
                  >
                    <span class="swatch-fill w-3.5 h-3.5 border border-[#141312]/25" data-color="${escapeHtml(c)}"></span>
                    <span>${escapeHtml(c)}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- Size Selector -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[#6B645B]">Size</span>
            <button
              type="button"
              data-policy="sizeGuide"
              class="text-[#141312] underline underline-offset-4 hover:opacity-70 transition-opacity cursor-pointer"
            >
              Size &amp; Fit Guide
            </button>
          </div>
          <div
            class="grid grid-cols-5 gap-2 ${sel.sizeError ? 'size-error-shake' : ''}"
            role="group"
            aria-label="Select clothing size"
          >
            ${product.sizes
              .map((s) => {
                const active = sel.size === s;
                return `
                  <button
                    type="button"
                    data-pdp-size="${escapeHtml(s)}"
                    aria-pressed="${active ? 'true' : 'false'}"
                    class="h-11 text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#141312] text-[#F8F6F1] border-[#141312]'
                        : sel.sizeError
                        ? 'border-[#8C3B2B] text-[#141312]'
                        : 'border-[#141312]/18 text-[#141312] hover:border-[#141312]'
                    }"
                  >
                    ${escapeHtml(s)}
                  </button>
                `;
              })
              .join('')}
          </div>
          ${
            sel.sizeError
              ? `<p class="text-xs text-[#8C3B2B]" role="alert">Please select a clothing size before adding to your bag.</p>`
              : ''
          }
        </div>

        <!-- Quantity + Add to Bag + Wishlist -->
        <div class="space-y-3 pt-1">
          <div class="flex items-center gap-3">
            <!-- Quantity Stepper -->
            <div class="inline-flex items-center border border-[#141312]/20 h-12 shrink-0" aria-label="Quantity selector">
              <button
                type="button"
                id="pdp-qty-dec"
                aria-label="Decrease quantity"
                class="w-10 h-full inline-flex items-center justify-center text-sm hover:bg-[#EAE4D9] transition-colors cursor-pointer"
              >
                −
              </button>
              <span class="w-10 text-center text-sm font-medium tabular-price">${sel.quantity}</span>
              <button
                type="button"
                id="pdp-qty-inc"
                aria-label="Increase quantity"
                class="w-10 h-full inline-flex items-center justify-center text-sm hover:bg-[#EAE4D9] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>

            <!-- Primary Add to Bag CTA -->
            <button
              type="button"
              id="pdp-add-btn"
              class="flex-1 h-12 px-6 bg-[#141312] text-[#F8F6F1] text-[13px] font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Add to Bag — ${formatCurrency(product.price * sel.quantity)}
            </button>
          </div>

          <button
            type="button"
            data-toggle-wishlist="${escapeHtml(product.id)}"
            aria-pressed="${isSaved ? 'true' : 'false'}"
            class="w-full h-11 px-5 border border-[#141312]/20 hover:border-[#141312] inline-flex items-center justify-center gap-2 text-xs font-medium text-[#141312] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25s-7.5-4.35-7.5-10.125a4.5 4.5 0 0 1 7.5-3.35 4.5 4.5 0 0 1 7.5 3.35c0 5.775-7.5 10.125-7.5 10.125Z" />
            </svg>
            <span>${isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
          </button>
        </div>

        <!-- Product Details & Care Instructions -->
        <div class="pt-6 border-t border-[#141312]/10 space-y-6">
          <div>
            <h2 class="font-sans text-xs font-semibold tracking-[0.08em] text-[#141312] mb-3">
              Garment Details
            </h2>
            <ul class="space-y-2 text-sm text-[#3F3C38]">
              ${product.details.map((d) => `<li class="flex items-start gap-2.5"><span aria-hidden="true" class="text-[#8D8377]">—</span><span>${escapeHtml(d)}</span></li>`).join('')}
            </ul>
          </div>

          <div class="pt-5 border-t border-[#141312]/10">
            <h2 class="font-sans text-xs font-semibold tracking-[0.08em] text-[#141312] mb-3">
              Care &amp; Longevity
            </h2>
            <ul class="space-y-2 text-sm text-[#3F3C38]">
              ${product.care.map((c) => `<li class="flex items-start gap-2.5"><span aria-hidden="true" class="text-[#8D8377]">—</span><span>${escapeHtml(c)}</span></li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  // Related Products (prioritize same collection, then complementary categories)
  const related = PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aScore = (a.collection === product.collection ? 2 : 0) + (a.category !== product.category ? 1 : 0);
      const bScore = (b.collection === product.collection ? 2 : 0) + (b.category !== product.category ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, 4);

  relatedGrid.innerHTML = related
    .map(
      (item) => `
      <article class="group flex flex-col">
        <button
          type="button"
          data-open-pdp="${escapeHtml(item.id)}"
          class="aspect-[3/4] w-full bg-[#E7E1D6] overflow-hidden mb-3 editorial-media text-left cursor-pointer"
        >
          ${renderResilientImage({
            src: item.image,
            alt: item.imageAlt,
            imgClass: 'w-full h-full object-cover object-top',
            label: item.name
          })}
        </button>
        <p class="text-[11px] text-[#6B645B] mb-1">${escapeHtml(item.category)} · ${escapeHtml(item.collection)}</p>
        <div class="flex items-baseline justify-between gap-3">
          <h3 class="font-sans text-sm font-medium text-[#141312]">
            <button type="button" data-open-pdp="${escapeHtml(item.id)}" class="hover:underline underline-offset-4 text-left cursor-pointer">
              ${escapeHtml(item.name)}
            </button>
          </h3>
          <span class="text-sm text-[#141312] tabular-price">${formatCurrency(item.price)}</span>
        </div>
      </article>
    `
    )
    .join('');

  bindImageFallbacks(content);
  bindImageFallbacks(relatedGrid);
}

// ---------- Shopping Bag & Wishlist Operations ----------

function addItemToBag({ productId, color, size, quantity = 1 }) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const existing = state.bag.find(
    (item) => item.productId === productId && item.color === color && item.size === size
  );

  if (existing) {
    existing.quantity = Math.min(20, existing.quantity + quantity);
  } else {
    state.bag.push({
      key: `${productId}__${color}__${size}`,
      productId,
      color,
      size,
      quantity
    });
  }

  state.checkoutStep = 'bag';
  saveBag();
  renderBagUI();
  openOverlay('bag');
}

function updateBagItemQuantity(key, delta) {
  const idx = state.bag.findIndex((item) => item.key === key);
  if (idx === -1) return;
  const nextQty = state.bag[idx].quantity + delta;
  if (nextQty <= 0) {
    state.bag.splice(idx, 1);
  } else {
    state.bag[idx].quantity = Math.min(20, nextQty);
  }
  saveBag();
  renderBagUI();
}

function removeBagItem(key) {
  state.bag = state.bag.filter((item) => item.key !== key);
  saveBag();
  renderBagUI();
}

function toggleWishlist(productId) {
  const idx = state.wishlist.indexOf(productId);
  const product = PRODUCTS.find((p) => p.id === productId);
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    if (product) showToast(`Removed ${product.name} from wishlist.`);
  } else {
    state.wishlist.push(productId);
    if (product) showToast(`Saved ${product.name} to wishlist.`);
  }
  saveWishlist();
  renderWishlistUI();
  if (state.view === 'pdp') {
    renderProductDetail();
  } else {
    renderCatalog();
  }
}

function getBagTotals() {
  let itemCount = 0;
  let subtotal = 0;
  for (const item of state.bag) {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (product) {
      itemCount += item.quantity;
      subtotal += product.price * item.quantity;
    }
  }
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shipping;
  return { itemCount, subtotal, shipping, total };
}

function renderBagUI() {
  const { itemCount, subtotal, shipping, total } = getBagTotals();

  const headerCount = document.getElementById('bag-count');
  const drawerCount = document.getElementById('bag-drawer-count');
  if (headerCount) headerCount.textContent = `(${itemCount})`;
  if (drawerCount) drawerCount.textContent = `(${itemCount})`;

  const shippingBanner = document.getElementById('bag-shipping-banner');
  const shippingText = document.getElementById('bag-shipping-text');
  const shippingProgress = document.getElementById('bag-shipping-progress');

  if (shippingBanner && shippingText && shippingProgress) {
    shippingProgress.value = Math.min(FREE_SHIPPING_THRESHOLD, subtotal);
    if (subtotal === 0) {
      shippingText.textContent = `Complimentary standard shipping on orders over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`;
    } else if (subtotal < FREE_SHIPPING_THRESHOLD) {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      shippingText.textContent = `Add ${formatCurrency(remaining)} more for complimentary standard shipping.`;
    } else {
      shippingText.textContent = 'Your bag qualifies for complimentary standard shipping.';
    }
  }

  const body = document.getElementById('bag-body');
  const footer = document.getElementById('bag-footer');
  if (!body || !footer) return;

  // Empty Bag State
  if (state.bag.length === 0 && state.checkoutStep !== 'preview-complete') {
    body.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center py-12">
        <p class="font-editorial text-3xl text-[#141312] mb-2">Your bag is empty.</p>
        <p class="text-sm text-[#57524B] max-w-xs leading-relaxed mb-7">
          Explore our Everyday Essentials, Modern Tailoring, and Weekend pieces to build your wardrobe.
        </p>
        <button
          type="button"
          id="bag-empty-shop-btn"
          class="h-11 px-6 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          Shop the Collection
        </button>
      </div>
    `;
    footer.classList.add('hidden');
    return;
  }

  // Simulated Demonstration Preview State
  if (state.checkoutStep === 'preview-complete') {
    body.innerHTML = `
      <div class="py-8 space-y-6">
        <div class="p-4 bg-[#EAE4D9] border border-[#141312]/15 text-xs text-[#141312] leading-relaxed">
          <p class="font-semibold mb-1">Demonstration Checkout Complete — No Order Placed</p>
          <p class="text-[#3F3C38]">
            This website is a fictional portfolio demonstration for VELORA. No payment was processed, no personal data was transmitted, and no physical garments will be shipped.
          </p>
        </div>

        <div class="space-y-2">
          <p class="text-xs tracking-[0.12em] text-[#6B645B]">Sample Preview Reference</p>
          <h3 class="font-editorial text-3xl text-[#141312]">Thank you for exploring VELORA.</h3>
          <p class="text-sm text-[#57524B] leading-relaxed">
            Your demonstration cart remains available so you can continue testing filters, product details, or clearing the bag whenever you wish.
          </p>
        </div>

        <div class="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            id="demo-return-bag-btn"
            class="h-11 px-5 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer"
          >
            Return to Bag Items
          </button>
          <button
            type="button"
            id="demo-clear-bag-btn"
            class="h-11 px-5 border border-[#141312]/20 text-xs font-medium text-[#141312] hover:border-[#141312] transition-colors cursor-pointer"
          >
            Reset Demonstration Bag
          </button>
        </div>
      </div>
    `;
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');

  // Demonstration Checkout Step inside Drawer
  if (state.checkoutStep === 'checkout') {
    body.innerHTML = `
      <div class="space-y-6">
        <div class="p-4 bg-[#EAE4D9] border border-[#141312]/15 text-xs text-[#141312] leading-relaxed">
          <p class="font-semibold mb-1">Portfolio Demonstration Checkout</p>
          <p class="text-[#3F3C38]">
            Payment processing is intentionally disabled. Submitting this preview demonstrates the client checkout flow without charging any card or placing a real order.
          </p>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-editorial text-2xl text-[#141312]">Order Summary (${itemCount})</h3>
            <button
              type="button"
              id="checkout-back-to-bag"
              class="text-xs underline underline-offset-4 text-[#141312] cursor-pointer"
            >
              Edit Bag
            </button>
          </div>

          <ul class="divide-y divide-[#141312]/10 border-y border-[#141312]/10">
            ${state.bag
              .map((item) => {
                const product = PRODUCTS.find((p) => p.id === item.productId);
                if (!product) return '';
                return `
                  <li class="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p class="font-medium text-[#141312]">${escapeHtml(product.name)} × ${item.quantity}</p>
                      <p class="text-[#6B645B]">${escapeHtml(item.color)} · Size ${escapeHtml(item.size)}</p>
                    </div>
                    <span class="tabular-price text-[#141312] font-medium">${formatCurrency(
                      product.price * item.quantity
                    )}</span>
                  </li>
                `;
              })
              .join('')}
          </ul>

          <div class="space-y-3 pt-1">
            <div>
              <label for="demo-checkout-name" class="block text-[11px] text-[#6B645B] mb-1">Sample Recipient Name (Optional)</label>
              <input
                type="text"
                id="demo-checkout-name"
                placeholder="Alex Lindholm"
                class="w-full h-10 px-3 bg-[#F2EFE8] border border-[#141312]/18 text-xs text-[#141312]"
              />
            </div>
            <div>
              <label for="demo-checkout-city" class="block text-[11px] text-[#6B645B] mb-1">Sample Destination (Optional)</label>
              <input
                type="text"
                id="demo-checkout-city"
                placeholder="Copenhagen / New York / London"
                class="w-full h-10 px-3 bg-[#F2EFE8] border border-[#141312]/18 text-xs text-[#141312]"
              />
            </div>
          </div>
        </div>
      </div>
    `;

    footer.innerHTML = `
      <div class="space-y-2 text-xs">
        <div class="flex justify-between text-[#57524B]">
          <span>Subtotal</span>
          <span class="tabular-price">${formatCurrency(subtotal)}</span>
        </div>
        <div class="flex justify-between text-[#57524B]">
          <span>Demonstration Shipping</span>
          <span class="tabular-price">${shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}</span>
        </div>
        <div class="flex justify-between text-sm font-semibold text-[#141312] pt-2 border-t border-[#141312]/10">
          <span>Estimated Total (Demo)</span>
          <span class="tabular-price">${formatCurrency(total)}</span>
        </div>
      </div>
      <button
        type="button"
        id="demo-complete-preview-btn"
        class="w-full h-12 px-6 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer"
      >
        Preview Demonstration Confirmation
      </button>
    `;
    return;
  }

  // Standard Itemized Shopping Bag View
  body.innerHTML = `
    <ul class="divide-y divide-[#141312]/10 -my-3">
      ${state.bag
        .map((item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          if (!product) return '';
          return `
            <li class="py-5 flex gap-4">
              <button
                type="button"
                data-open-pdp="${escapeHtml(product.id)}"
                class="w-20 aspect-[3/4] bg-[#E7E1D6] overflow-hidden shrink-0 cursor-pointer"
              >
                ${renderResilientImage({
                  src: product.image,
                  alt: product.name,
                  imgClass: 'w-full h-full object-cover object-top',
                  label: product.name
                })}
              </button>

              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      data-open-pdp="${escapeHtml(product.id)}"
                      class="text-sm font-medium text-[#141312] hover:underline underline-offset-4 text-left truncate cursor-pointer"
                    >
                      ${escapeHtml(product.name)}
                    </button>
                    <span class="text-sm font-medium text-[#141312] tabular-price shrink-0">
                      ${formatCurrency(product.price * item.quantity)}
                    </span>
                  </div>
                  <p class="text-xs text-[#6B645B] mt-0.5">
                    ${escapeHtml(item.color)} · Size ${escapeHtml(item.size)}
                  </p>
                </div>

                <div class="flex items-center justify-between pt-3">
                  <div class="inline-flex items-center border border-[#141312]/18 h-8">
                    <button
                      type="button"
                      data-bag-dec="${escapeHtml(item.key)}"
                      aria-label="Decrease quantity of ${escapeHtml(product.name)}"
                      class="w-7 h-full inline-flex items-center justify-center text-xs hover:bg-[#EAE4D9] cursor-pointer"
                    >
                      −
                    </button>
                    <span class="w-7 text-center text-xs tabular-price">${item.quantity}</span>
                    <button
                      type="button"
                      data-bag-inc="${escapeHtml(item.key)}"
                      aria-label="Increase quantity of ${escapeHtml(product.name)}"
                      class="w-7 h-full inline-flex items-center justify-center text-xs hover:bg-[#EAE4D9] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    data-bag-remove="${escapeHtml(item.key)}"
                    class="text-xs text-[#6B645B] hover:text-[#141312] underline underline-offset-4 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;

  footer.innerHTML = `
    <div class="space-y-1.5 text-xs">
      <div class="flex justify-between text-[#57524B]">
        <span>Subtotal</span>
        <span class="tabular-price font-medium text-[#141312]">${formatCurrency(subtotal)}</span>
      </div>
      <div class="flex justify-between text-[#57524B]">
        <span>Shipping</span>
        <span class="tabular-price">${shipping === 0 ? 'Complimentary' : formatCurrency(shipping)}</span>
      </div>
    </div>
    <button
      type="button"
      id="bag-proceed-checkout"
      class="w-full h-12 px-6 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer"
    >
      Proceed to Checkout (Demo) — ${formatCurrency(total)}
    </button>
    <p class="text-[11px] text-[#6B645B] text-center">
      Demonstration storefront — no real payment will be collected.
    </p>
  `;

  bindImageFallbacks(body);
}

// ---------- Render Wishlist Drawer ----------

function renderWishlistUI() {
  const count = state.wishlist.length;
  const headerCount = document.getElementById('wishlist-count');
  const drawerCount = document.getElementById('wishlist-drawer-count');
  if (headerCount) headerCount.textContent = `(${count})`;
  if (drawerCount) drawerCount.textContent = `(${count})`;

  const body = document.getElementById('wishlist-body');
  if (!body) return;

  if (count === 0) {
    body.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-center py-12">
        <p class="font-editorial text-3xl text-[#141312] mb-2">No saved pieces yet.</p>
        <p class="text-sm text-[#57524B] max-w-xs leading-relaxed mb-7">
          Save favorite garments while browsing the catalog to revisit and compare proportions.
        </p>
        <button
          type="button"
          id="wishlist-explore-btn"
          class="h-11 px-6 bg-[#141312] text-[#F8F6F1] text-xs font-medium tracking-[0.04em] hover:bg-[#2C2B29] transition-colors cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <ul class="divide-y divide-[#141312]/10 -my-3">
      ${state.wishlist
        .map((id) => {
          const product = PRODUCTS.find((p) => p.id === id);
          if (!product) return '';
          return `
            <li class="py-5 flex gap-4">
              <button
                type="button"
                data-open-pdp="${escapeHtml(product.id)}"
                class="w-20 aspect-[3/4] bg-[#E7E1D6] overflow-hidden shrink-0 cursor-pointer"
              >
                ${renderResilientImage({
                  src: product.image,
                  alt: product.name,
                  imgClass: 'w-full h-full object-cover object-top',
                  label: product.name
                })}
              </button>
              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      data-open-pdp="${escapeHtml(product.id)}"
                      class="text-sm font-medium text-[#141312] hover:underline underline-offset-4 text-left truncate cursor-pointer"
                    >
                      ${escapeHtml(product.name)}
                    </button>
                    <span class="text-sm font-medium tabular-price text-[#141312] shrink-0">${formatCurrency(
                      product.price
                    )}</span>
                  </div>
                  <p class="text-xs text-[#6B645B] mt-0.5">${escapeHtml(product.collection)}</p>
                </div>

                <div class="flex items-center justify-between pt-3">
                  <button
                    type="button"
                    data-open-pdp="${escapeHtml(product.id)}"
                    class="text-xs font-medium text-[#141312] underline underline-offset-4 cursor-pointer"
                  >
                    Select Size &amp; Add
                  </button>
                  <button
                    type="button"
                    data-toggle-wishlist="${escapeHtml(product.id)}"
                    class="text-xs text-[#6B645B] hover:text-[#141312] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          `;
        })
        .join('')}
    </ul>
  `;

  bindImageFallbacks(body);
}

// ---------- Search Overlay ----------

function renderSearchResults(query = '') {
  const resultsEl = document.getElementById('search-results');
  if (!resultsEl) return;

  const q = query.trim().toLowerCase();
  const matches = q
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.colors.some((c) => c.toLowerCase().includes(q))
      )
    : PRODUCTS.slice(0, 4);

  if (matches.length === 0) {
    resultsEl.innerHTML = `
      <p class="py-8 text-sm text-[#57524B]">
        No VELORA garments matched &ldquo;${escapeHtml(query)}&rdquo;. Try searching for Linen, Cotton, Merino, Overshirt, or Trousers.
      </p>
    `;
    return;
  }

  resultsEl.innerHTML = `
    <p class="text-xs text-[#6B645B] mb-4">${q ? `${matches.length} matching pieces` : 'Suggested Pieces'}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      ${matches
        .map(
          (item) => `
          <button
            type="button"
            data-open-pdp="${escapeHtml(item.id)}"
            class="group flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2.5 text-left p-2 hover:bg-[#F2EFE8] transition-colors cursor-pointer"
          >
            <div class="w-16 sm:w-full aspect-[3/4] bg-[#E7E1D6] overflow-hidden shrink-0">
              ${renderResilientImage({
                src: item.image,
                alt: item.name,
                imgClass: 'w-full h-full object-cover object-top',
                label: item.name
              })}
            </div>
            <div class="min-w-0 w-full">
              <p class="text-[11px] text-[#6B645B]">${escapeHtml(item.category)}</p>
              <p class="text-sm font-medium text-[#141312] truncate">${escapeHtml(item.name)}</p>
              <p class="text-xs text-[#141312] tabular-price mt-0.5">${formatCurrency(item.price)}</p>
            </div>
          </button>
        `
        )
        .join('')}
    </div>
  `;

  bindImageFallbacks(resultsEl);
}

// ---------- Account & Policy Info Modals ----------

function openPolicyModal(policyKey) {
  const data = POLICY_MODALS[policyKey];
  if (!data) return;

  const kickerEl = document.getElementById('info-modal-kicker');
  const titleEl = document.getElementById('info-modal-title');
  const bodyEl = document.getElementById('info-modal-body');
  if (!kickerEl || !titleEl || !bodyEl) return;

  kickerEl.textContent = data.kicker;
  titleEl.textContent = data.title;
  bodyEl.innerHTML = data.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('');

  openOverlay('info');
}

function openAccountModal() {
  const kickerEl = document.getElementById('info-modal-kicker');
  const titleEl = document.getElementById('info-modal-title');
  const bodyEl = document.getElementById('info-modal-body');
  if (!kickerEl || !titleEl || !bodyEl) return;

  const { itemCount, subtotal } = getBagTotals();

  kickerEl.textContent = 'Client Wardrobe Interface';
  titleEl.textContent = 'VELORA Account';
  bodyEl.innerHTML = `
    <p>
      This account view demonstrates how returning VELORA clients access saved pieces and active shopping bags. Because this website has no backend or database, session data is stored locally in your browser.
    </p>
    <div class="grid grid-cols-2 gap-4 py-3 border-y border-[#141312]/10">
      <div>
        <p class="text-xs text-[#6B645B]">Saved Wishlist</p>
        <p class="font-editorial text-2xl text-[#141312] tabular-price">${state.wishlist.length} pieces</p>
      </div>
      <div>
        <p class="text-xs text-[#6B645B]">Active Bag</p>
        <p class="font-editorial text-2xl text-[#141312] tabular-price">${itemCount} items (${formatCurrency(subtotal)})</p>
      </div>
    </div>
    <div class="flex flex-wrap gap-3 pt-2">
      <button
        type="button"
        id="account-open-wishlist"
        class="h-10 px-5 bg-[#141312] text-[#F8F6F1] text-xs font-medium cursor-pointer"
      >
        Open Saved Wishlist
      </button>
      <button
        type="button"
        id="account-open-bag"
        class="h-10 px-5 border border-[#141312]/20 text-xs font-medium text-[#141312] cursor-pointer"
      >
        Open Shopping Bag
      </button>
    </div>
  `;

  openOverlay('info');
}

// ---------- Overlay Management ----------

const OVERLAY_IDS = {
  bag: 'bag-drawer',
  wishlist: 'wishlist-drawer',
  'mobile-nav': 'mobile-nav-drawer',
  search: 'search-modal',
  info: 'info-modal'
};

function openOverlay(name) {
  closeAllOverlays(false);
  state.activeOverlay = name;

  const backdrop = document.getElementById('overlay-backdrop');
  const panelId = OVERLAY_IDS[name];
  const panel = panelId ? document.getElementById(panelId) : null;

  if (backdrop) backdrop.setAttribute('data-open', 'true');
  if (panel) panel.setAttribute('data-open', 'true');

  if (name === 'search') {
    const input = document.getElementById('search-input');
    renderSearchResults(input ? input.value : '');
    window.setTimeout(() => input?.focus(), 60);
  }
}

function closeAllOverlays(resetCheckout = true) {
  state.activeOverlay = null;
  if (resetCheckout && state.checkoutStep === 'preview-complete') {
    state.checkoutStep = 'bag';
  }
  const backdrop = document.getElementById('overlay-backdrop');
  if (backdrop) backdrop.setAttribute('data-open', 'false');

  Object.values(OVERLAY_IDS).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('data-open', 'false');
  });
}

// ---------- Navigation & Event Delegation ----------

function navigateToCatalogWith({ category = 'all', collection = 'all', sort = 'featured' } = {}) {
  state.filters.category = category;
  state.filters.collection = collection;
  state.filters.sort = sort;
  syncFilterControlsUI();
  renderCatalog();

  if (state.view === 'pdp') {
    closeProductDetail('catalog-section');
  } else {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function bindEvents() {
  window.addEventListener('scroll', syncHeaderAppearance, { passive: true });

  // Browser back/forward hash routing for PDP
  window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    if (hash.startsWith('#product/')) {
      const id = hash.replace('#product/', '');
      openProductDetail(id, false);
    } else if (state.view === 'pdp') {
      closeProductDetail();
    }
  });

  // Escape key closes overlays
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.activeOverlay) {
      closeAllOverlays();
    }
  });

  // Filter Select Inputs
  document.getElementById('filter-collection')?.addEventListener('change', (e) => {
    state.filters.collection = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  document.getElementById('filter-price')?.addEventListener('change', (e) => {
    state.filters.price = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  document.getElementById('filter-size')?.addEventListener('change', (e) => {
    state.filters.size = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  document.getElementById('filter-color')?.addEventListener('change', (e) => {
    state.filters.color = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  document.getElementById('filter-availability')?.addEventListener('change', (e) => {
    state.filters.availability = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  document.getElementById('filter-sort')?.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    syncFilterControlsUI();
    renderCatalog();
  });

  // Search Input
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });

  // Newsletter Demonstration Form
  document.getElementById('newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const feedback = document.getElementById('newsletter-feedback');
    if (!emailInput || !feedback) return;

    const val = emailInput.value.trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!validEmail) {
      feedback.textContent = 'Please enter a valid email address format to preview the signup confirmation.';
      feedback.className = 'text-xs text-[#8C3B2B] mt-4';
      emailInput.focus();
      return;
    }

    emailInput.value = '';
    feedback.textContent =
      'Thank you for exploring VELORA. Because this is a static portfolio demonstration with no backend, your email address was not stored or subscribed.';
    feedback.className = 'text-xs text-[#141312] font-medium mt-4';
  });

  // Global Click Delegation
  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    // Backdrop click
    if (target.id === 'overlay-backdrop' || target.id === 'info-modal') {
      closeAllOverlays();
      return;
    }

    // Close overlay buttons
    if (target.closest('[data-close-overlay]')) {
      closeAllOverlays();
      return;
    }

    // Header Utility Buttons
    if (target.closest('#bag-open-btn') || target.closest('#account-open-bag')) {
      state.checkoutStep = 'bag';
      renderBagUI();
      openOverlay('bag');
      return;
    }

    if (target.closest('#wishlist-open-btn') || target.closest('#account-open-wishlist')) {
      renderWishlistUI();
      openOverlay('wishlist');
      return;
    }

    if (target.closest('#search-open-btn')) {
      openOverlay('search');
      return;
    }

    if (target.closest('#account-open-btn') || target.closest('#mobile-account-btn')) {
      openAccountModal();
      return;
    }

    if (target.closest('#mobile-menu-open')) {
      openOverlay('mobile-nav');
      return;
    }

    // Brand Logo / Footer Home
    if (target.closest('#brand-logo') || target.closest('[data-footer-home]')) {
      e.preventDefault();
      closeAllOverlays();
      if (state.view === 'pdp') {
        closeProductDetail();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Desktop & Mobile Navigation Links
    const navTrigger = target.closest('[data-nav], [data-mobile-nav]');
    if (navTrigger) {
      e.preventDefault();
      const dest = navTrigger.getAttribute('data-nav') || navTrigger.getAttribute('data-mobile-nav');
      closeAllOverlays();
      if (dest === 'new-arrivals') {
        navigateToCatalogWith({ category: 'all', collection: 'all', sort: 'newest' });
      } else if (dest === 'clothing') {
        resetAllFilters();
        if (state.view === 'pdp') closeProductDetail('catalog-section');
        else document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (dest === 'collections') {
        if (state.view === 'pdp') closeProductDetail('collections-section');
        else document.getElementById('collections-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (dest === 'story') {
        if (state.view === 'pdp') closeProductDetail('story-section');
        else document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Featured Collection CTA Jump
    const colJump = target.closest('[data-collection-jump]');
    if (colJump) {
      const colName = colJump.getAttribute('data-collection-jump');
      if (colName) {
        navigateToCatalogWith({ category: 'all', collection: colName, sort: 'featured' });
      }
      return;
    }

    // Campaign Explore CTA
    if (target.closest('#campaign-explore-btn')) {
      e.preventDefault();
      resetAllFilters();
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Category Tabs
    const catTab = target.closest('.cat-tab');
    if (catTab) {
      const cat = catTab.getAttribute('data-category') || 'all';
      state.filters.category = cat;
      syncFilterControlsUI();
      renderCatalog();
      return;
    }

    // Clear Filters
    if (target.closest('#clear-filters-top') || target.closest('#empty-reset-btn')) {
      resetAllFilters();
      return;
    }

    // Card Color Swatch Selection
    const cardColorBtn = target.closest('[data-card-color]');
    if (cardColorBtn) {
      const pid = cardColorBtn.getAttribute('data-card-color');
      const colorVal = cardColorBtn.getAttribute('data-color-val');
      if (pid && colorVal && state.cardSelections[pid]) {
        state.cardSelections[pid].color = colorVal;
        renderCatalog();
      }
      return;
    }

    // Card Size Selection
    const cardSizeBtn = target.closest('[data-card-size]');
    if (cardSizeBtn) {
      const pid = cardSizeBtn.getAttribute('data-card-size');
      const sizeVal = cardSizeBtn.getAttribute('data-size-val');
      if (pid && sizeVal && state.cardSelections[pid]) {
        state.cardSelections[pid].size = sizeVal;
        state.cardSelections[pid].sizeError = false;
        renderCatalog();
      }
      return;
    }

    // Card Add to Bag (with Size Validation)
    const cardAddBtn = target.closest('[data-card-add]');
    if (cardAddBtn) {
      const pid = cardAddBtn.getAttribute('data-card-add');
      if (!pid || !state.cardSelections[pid]) return;
      const sel = state.cardSelections[pid];
      if (!sel.size) {
        sel.sizeError = true;
        renderCatalog();
        return;
      }
      sel.sizeError = false;
      addItemToBag({
        productId: pid,
        color: sel.color,
        size: sel.size,
        quantity: 1
      });
      return;
    }

    // Open Product Detail View
    const pdpTrigger = target.closest('[data-open-pdp]');
    if (pdpTrigger) {
      const pid = pdpTrigger.getAttribute('data-open-pdp');
      if (pid) openProductDetail(pid);
      return;
    }

    // PDP Back / View Full Catalog
    if (target.closest('#pdp-back-btn') || target.closest('#pdp-view-all-btn')) {
      closeProductDetail('catalog-section');
      return;
    }

    // PDP Media Mode Toggle
    const pdpMediaBtn = target.closest('[data-pdp-media]');
    if (pdpMediaBtn) {
      state.pdpSelection.mediaMode = pdpMediaBtn.getAttribute('data-pdp-media') || 'full';
      renderProductDetail();
      return;
    }

    // PDP Color Selection
    const pdpColorBtn = target.closest('[data-pdp-color]');
    if (pdpColorBtn) {
      const c = pdpColorBtn.getAttribute('data-pdp-color');
      if (c) {
        state.pdpSelection.color = c;
        if (state.activeProductId && state.cardSelections[state.activeProductId]) {
          state.cardSelections[state.activeProductId].color = c;
        }
        renderProductDetail();
      }
      return;
    }

    // PDP Size Selection
    const pdpSizeBtn = target.closest('[data-pdp-size]');
    if (pdpSizeBtn) {
      const s = pdpSizeBtn.getAttribute('data-pdp-size');
      if (s) {
        state.pdpSelection.size = s;
        state.pdpSelection.sizeError = false;
        if (state.activeProductId && state.cardSelections[state.activeProductId]) {
          state.cardSelections[state.activeProductId].size = s;
          state.cardSelections[state.activeProductId].sizeError = false;
        }
        renderProductDetail();
      }
      return;
    }

    // PDP Quantity Controls
    if (target.closest('#pdp-qty-dec')) {
      state.pdpSelection.quantity = Math.max(1, state.pdpSelection.quantity - 1);
      renderProductDetail();
      return;
    }

    if (target.closest('#pdp-qty-inc')) {
      state.pdpSelection.quantity = Math.min(10, state.pdpSelection.quantity + 1);
      renderProductDetail();
      return;
    }

    // PDP Add to Bag (with Size Validation)
    if (target.closest('#pdp-add-btn')) {
      if (!state.activeProductId) return;
      if (!state.pdpSelection.size) {
        state.pdpSelection.sizeError = true;
        renderProductDetail();
        return;
      }
      state.pdpSelection.sizeError = false;
      addItemToBag({
        productId: state.activeProductId,
        color: state.pdpSelection.color,
        size: state.pdpSelection.size,
        quantity: state.pdpSelection.quantity
      });
      return;
    }

    // Toggle Wishlist
    const wishBtn = target.closest('[data-toggle-wishlist]');
    if (wishBtn) {
      const pid = wishBtn.getAttribute('data-toggle-wishlist');
      if (pid) toggleWishlist(pid);
      return;
    }

    // Bag Drawer Item Controls
    const bagDec = target.closest('[data-bag-dec]');
    if (bagDec) {
      updateBagItemQuantity(bagDec.getAttribute('data-bag-dec'), -1);
      return;
    }

    const bagInc = target.closest('[data-bag-inc]');
    if (bagInc) {
      updateBagItemQuantity(bagInc.getAttribute('data-bag-inc'), 1);
      return;
    }

    const bagRemove = target.closest('[data-bag-remove]');
    if (bagRemove) {
      removeBagItem(bagRemove.getAttribute('data-bag-remove'));
      return;
    }

    if (target.closest('#bag-empty-shop-btn') || target.closest('#wishlist-explore-btn')) {
      closeAllOverlays();
      if (state.view === 'pdp') closeProductDetail('catalog-section');
      else document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (target.closest('#bag-proceed-checkout')) {
      state.checkoutStep = 'checkout';
      renderBagUI();
      return;
    }

    if (target.closest('#checkout-back-to-bag') || target.closest('#demo-return-bag-btn')) {
      state.checkoutStep = 'bag';
      renderBagUI();
      return;
    }

    if (target.closest('#demo-complete-preview-btn')) {
      state.checkoutStep = 'preview-complete';
      renderBagUI();
      return;
    }

    if (target.closest('#demo-clear-bag-btn')) {
      state.bag = [];
      state.checkoutStep = 'bag';
      saveBag();
      renderBagUI();
      showToast('Demonstration shopping bag cleared.');
      return;
    }

    // Footer Category / Collection / Story / Policy / Social Triggers
    const footerFilterNew = target.closest('[data-footer-filter="new"]');
    if (footerFilterNew) {
      e.preventDefault();
      navigateToCatalogWith({ category: 'all', collection: 'all', sort: 'newest' });
      return;
    }

    const footerCat = target.closest('[data-footer-cat]');
    if (footerCat) {
      e.preventDefault();
      const cat = footerCat.getAttribute('data-footer-cat') || 'all';
      navigateToCatalogWith({ category: cat, collection: 'all', sort: 'featured' });
      return;
    }

    const footerCol = target.closest('[data-footer-col]');
    if (footerCol) {
      e.preventDefault();
      const col = footerCol.getAttribute('data-footer-col') || 'all';
      navigateToCatalogWith({ category: 'all', collection: col, sort: 'featured' });
      return;
    }

    if (target.closest('[data-footer-story]')) {
      e.preventDefault();
      if (state.view === 'pdp') closeProductDetail('story-section');
      else document.getElementById('story-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const policyBtn = target.closest('[data-policy]');
    if (policyBtn) {
      const key = policyBtn.getAttribute('data-policy');
      if (key) openPolicyModal(key);
      return;
    }

    if (target.closest('#footer-newsletter-jump')) {
      if (state.view === 'pdp') closeProductDetail('newsletter-section');
      else document.getElementById('newsletter-section')?.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => document.getElementById('newsletter-email')?.focus(), 350);
      return;
    }

    const socialDemo = target.closest('[data-social-demo]');
    if (socialDemo) {
      const channel = socialDemo.getAttribute('data-social-demo');
      showToast(`${channel} link is a placeholder for this fictional VELORA demonstration.`);
    }
  });
}

// ---------- Bootstrap Application ----------

function init() {
  loadPersistedState();
  mountEditorialMedia();
  renderCollections();
  syncFilterControlsUI();
  renderCatalog();
  renderReviews();
  renderBagUI();
  renderWishlistUI();
  bindEvents();
  syncHeaderAppearance();

  // Deep-link support if loaded directly on #product/<slug>
  if (window.location.hash.startsWith('#product/')) {
    const slug = window.location.hash.replace('#product/', '');
    if (PRODUCTS.some((p) => p.id === slug)) {
      openProductDetail(slug, false);
    }
  }
}

init();
