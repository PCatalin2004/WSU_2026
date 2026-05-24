(() => {
  const {
    escapeHtml,
    imageUrl,
    loadData,
    ready,
    responsiveImage,
  } = window.WSU;

  function renderGalleryItem(item, index) {
    const caption = escapeHtml(item.image.alt);

    return `
      <button class="gallery-item reveal-card" type="button" data-large="${imageUrl(item.image, "large")}" data-caption="${caption}" aria-label="Deschide imaginea ${index + 1}: ${caption}">
        ${responsiveImage(item.image, { sizes: "(max-width: 860px) 50vw, 33vw", srcSize: "thumb" })}
      </button>
    `;
  }

  function createLightboxState() {
    return {
      activeGalleryIndex: 0,
      galleryItems: Array.from(document.querySelectorAll("[data-gallery] .gallery-item")),
      lastFocusedElement: null,
      lightbox: document.querySelector("[data-lightbox]"),
      lightboxCaption: document.querySelector("[data-lightbox-caption]"),
      lightboxClose: document.querySelector("[data-lightbox-close]"),
      lightboxImage: document.querySelector("[data-lightbox-image]"),
      lightboxNext: document.querySelector("[data-lightbox-next]"),
      lightboxPrev: document.querySelector("[data-lightbox-prev]"),
    };
  }

  function normalizeGalleryIndex(index, totalItems) {
    return (index + totalItems) % totalItems;
  }

  function closeLightbox(state) {
    const { lightbox, lightboxImage, lightboxCaption, lastFocusedElement } = state;
    if (!lightbox || !lightboxImage) return;

    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }
    document.body.classList.remove("lightbox-open");
    lastFocusedElement?.focus();
  }

  function showGalleryImage(state, index) {
    const { lightbox, lightboxImage, lightboxCaption, galleryItems } = state;
    if (!lightbox || !lightboxImage || galleryItems.length === 0) return;

    if (lightbox.hidden) {
      state.lastFocusedElement = document.activeElement;
    }

    state.activeGalleryIndex = normalizeGalleryIndex(index, galleryItems.length);

    const item = galleryItems[state.activeGalleryIndex];
    const caption = item.dataset.caption || "";
    const fallbackImage = item.querySelector("img")?.src || "";

    lightboxImage.src = item.dataset.large || fallbackImage;
    lightboxImage.alt = caption;
    if (lightboxCaption) {
      lightboxCaption.textContent = `${state.activeGalleryIndex + 1} / ${galleryItems.length} - ${caption}`;
    }

    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    state.lightboxClose?.focus();
  }

  function bindGalleryItems(state) {
    state.galleryItems.forEach((item, index) => {
      item.addEventListener("click", () => showGalleryImage(state, index));
    });
  }

  function bindLightboxButtons(state) {
    state.lightboxClose?.addEventListener("click", () => closeLightbox(state));
    state.lightboxPrev?.addEventListener("click", () => showGalleryImage(state, state.activeGalleryIndex - 1));
    state.lightboxNext?.addEventListener("click", () => showGalleryImage(state, state.activeGalleryIndex + 1));
  }

  function bindLightboxKeyboard(state) {
    document.addEventListener("keydown", (event) => {
      if (state.lightbox.hidden) return;

      if (event.key === "Escape") {
        closeLightbox(state);
      }

      if (event.key === "ArrowLeft") {
        showGalleryImage(state, state.activeGalleryIndex - 1);
      }

      if (event.key === "ArrowRight") {
        showGalleryImage(state, state.activeGalleryIndex + 1);
      }
    });
  }

  function bindLightboxBackdrop(state) {
    state.lightbox.addEventListener("click", (event) => {
      if (event.target === state.lightbox) {
        closeLightbox(state);
      }
    });
  }

  function initGalleryLightbox() {
    const state = createLightboxState();
    if (!state.lightbox || !state.lightboxImage) return;

    bindGalleryItems(state);
    bindLightboxBackdrop(state);
    bindLightboxButtons(state);
    bindLightboxKeyboard(state);
  }

  ready(async () => {
    const host = document.querySelector("[data-gallery]");
    if (!host) return;

    const gallery = await loadData("gallery");
    host.innerHTML = gallery.map(renderGalleryItem).join("");
    initGalleryLightbox();
  });
})();
