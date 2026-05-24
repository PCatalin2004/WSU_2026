const closeLightbox = (state) => {
  const { lightbox, lightboxImage, lightboxCaption, lastFocusedElement } = state;
  if (!lightbox || !lightboxImage) return;
  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  if (lightboxCaption) lightboxCaption.textContent = "";
  document.body.classList.remove("lightbox-open");
  lastFocusedElement?.focus();
};

const showGalleryImage = (state, index) => {
  const { lightbox, lightboxImage, lightboxCaption, galleryItems } = state;
  if (!lightbox || !lightboxImage || !galleryItems.length) return;

  state.activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[state.activeGalleryIndex];
  const caption = item.dataset.caption || "";

  state.lastFocusedElement = document.activeElement;
  lightboxImage.src = item.dataset.large || item.querySelector("img")?.src || "";
  lightboxImage.alt = caption;
  if (lightboxCaption) {
    lightboxCaption.textContent = `${state.activeGalleryIndex + 1} / ${galleryItems.length} - ${caption}`;
  }

  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  state.lightboxClose?.focus();
};

window.WSU.ready(async () => {
  const host = document.querySelector("[data-gallery]");
  if (!host) return;

  const gallery = await window.WSU.loadData("gallery");
  host.innerHTML = gallery
    .map(
      (item, index) => `
        <button class="gallery-item reveal-card" type="button" data-large="${window.WSU.imageUrl(item.image, "large")}" data-caption="${window.WSU.escapeHtml(item.image.alt)}" aria-label="Deschide imaginea ${index + 1}: ${window.WSU.escapeHtml(item.image.alt)}">
          ${window.WSU.responsiveImage(item.image, { sizes: "(max-width: 860px) 50vw, 33vw", srcSize: "thumb" })}
        </button>
      `,
    )
    .join("");

  const state = {
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

  if (!state.lightbox || !state.lightboxImage) return;

  state.galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => showGalleryImage(state, index));
  });

  state.lightbox.addEventListener("click", (event) => {
    if (event.target === state.lightbox) closeLightbox(state);
  });

  state.lightboxClose?.addEventListener("click", () => closeLightbox(state));
  state.lightboxPrev?.addEventListener("click", () => showGalleryImage(state, state.activeGalleryIndex - 1));
  state.lightboxNext?.addEventListener("click", () => showGalleryImage(state, state.activeGalleryIndex + 1));

  document.addEventListener("keydown", (event) => {
    if (state.lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox(state);
    if (event.key === "ArrowLeft") showGalleryImage(state, state.activeGalleryIndex - 1);
    if (event.key === "ArrowRight") showGalleryImage(state, state.activeGalleryIndex + 1);
  });
});
