(() => {
  const {
    escapeHtml,
    imageUrl,
    initReveal,
    linkAttrs,
    loadData,
    ready,
    refreshIcons,
    responsiveImage,
  } = window.WSU;

  const DRIVE_API_URL = "https://www.googleapis.com/drive/v3/files";
  const DRIVE_FILE_FIELDS = [
    "nextPageToken",
    "files(id,name,mimeType,webContentLink,webViewLink,imageMediaMetadata(width,height,time),createdTime,modifiedTime)",
  ].join(",");

  function driveImageUrl(fileId) {
    return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
  }

  function driveDownloadUrl(file) {
    return file.webContentLink || `https://drive.google.com/uc?export=download&id=${encodeURIComponent(file.id)}`;
  }

  function enabledDriveFolders(config) {
    if (!config?.apiKey) return [];

    return (config.folders || []).filter((folder) => folder.enabled && folder.folderId);
  }

  function galleryFileQuery(folderId) {
    return `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;
  }

  function folderTitle(folder) {
    return folder.title || folder.name || folder.year || "Galerie";
  }

  function normalizeCoverImage(folder, title) {
    if (!folder.coverImage) return null;

    if (typeof folder.coverImage === "string") {
      return {
        src: folder.coverImage,
        alt: `Copertă ${title}`,
      };
    }

    if (folder.coverImage.src || folder.coverImage.base) {
      return {
        ...folder.coverImage,
        alt: folder.coverImage.alt || `Copertă ${title}`,
      };
    }

    return null;
  }

  function driveFileToGalleryItem(file, folder) {
    const title = folderTitle(folder);
    const caption = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();

    return {
      source: "drive",
      folderId: folder.folderId,
      folderTitle: title,
      image: {
        src: driveImageUrl(file.id),
        alt: caption || title,
      },
      downloadUrl: driveDownloadUrl(file),
      viewUrl: file.webViewLink,
    };
  }

  async function fetchDriveFolder(folder, apiKey) {
    const files = [];
    let pageToken = "";

    do {
      const params = new URLSearchParams({
        fields: DRIVE_FILE_FIELDS,
        includeItemsFromAllDrives: "true",
        key: apiKey,
        orderBy: "name_natural",
        pageSize: "1000",
        q: galleryFileQuery(folder.folderId),
        spaces: "drive",
        supportsAllDrives: "true",
      });

      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const response = await fetch(`${DRIVE_API_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Nu am putut încărca folderul ${folderTitle(folder)}.`);
      }

      const data = await response.json();
      files.push(...(data.files || []));
      pageToken = data.nextPageToken || "";
    } while (pageToken);

    return {
      id: folder.folderId,
      coverImage: normalizeCoverImage(folder, folderTitle(folder)),
      source: "drive",
      title: folderTitle(folder),
      items: files.map((file) => driveFileToGalleryItem(file, folder)),
    };
  }

  async function loadDriveAlbums() {
    const config = await loadData("gallery-drive");
    const folders = enabledDriveFolders(config);

    if (!folders.length) {
      return {
        albums: null,
        fallbackToLocal: config?.fallbackToLocal !== false,
      };
    }

    const albums = await Promise.all(
      folders.map((folder) => fetchDriveFolder(folder, config.apiKey))
    );

    return {
      albums,
      fallbackToLocal: config?.fallbackToLocal !== false,
    };
  }

  async function loadLocalAlbums() {
    const gallery = await loadData("gallery");
    const items = gallery.map((item) => ({
      ...item,
      source: "local",
      image: {
        ...item.image,
      },
      downloadUrl: imageUrl(item.image, "large"),
    }));

    return [
      {
        coverImage: items[0]?.image,
        id: "local-gallery",
        source: "local",
        title: "Galerie WSU",
        items,
      },
    ];
  }

  function photoCount(albums) {
    return albums.reduce((total, album) => total + album.items.length, 0);
  }

  function folderCountLabel(count) {
    return count === 1 ? "1 folder" : `${count} foldere`;
  }

  function photoCountLabel(count) {
    return count === 1 ? "1 fotografie" : `${count} fotografii`;
  }

  async function loadGalleryAlbums() {
    let fallbackToLocal = true;

    try {
      const driveGallery = await loadDriveAlbums();
      fallbackToLocal = driveGallery.fallbackToLocal;

      if (driveGallery.albums?.length) {
        const totalPhotos = photoCount(driveGallery.albums);

        return {
          albums: driveGallery.albums,
          source: "drive",
          status: `${photoCountLabel(totalPhotos)} în ${folderCountLabel(driveGallery.albums.length)} încărcate din Google Drive.`,
        };
      }
    } catch (error) {
      console.error(error);
    }

    if (!fallbackToLocal) {
      return {
        albums: [],
        source: "empty",
        status: "Nu există foldere disponibile în Google Drive.",
      };
    }

    const localAlbums = await loadLocalAlbums();
    return {
      albums: localAlbums,
      source: "local",
      status: "Galeria afișează fotografiile locale până configurezi folderele Google Drive.",
    };
  }

  function renderDownloadLink(item, caption) {
    if (!item.downloadUrl) return "";

    return `
      <a class="gallery-download" href="${escapeHtml(item.downloadUrl)}"${linkAttrs(item.downloadUrl)} download aria-label="Descarcă ${escapeHtml(caption)}" title="Descarcă fotografia">
        <i data-lucide="download"></i>
      </a>
    `;
  }

  function renderGalleryItem(item, index) {
    const rawCaption = item.image.alt || "";
    const caption = escapeHtml(rawCaption);
    const largeImage = escapeHtml(imageUrl(item.image, "large"));
    const downloadUrl = escapeHtml(item.downloadUrl || largeImage);

    return `
      <article class="gallery-card reveal-card" data-large="${largeImage}" data-download="${downloadUrl}" data-caption="${caption}">
        <button class="gallery-item" type="button" aria-label="Deschide imaginea ${index + 1}: ${caption}">
          ${responsiveImage(item.image, {
            fetchPriority: index === 0 ? "high" : "",
            loading: index < 6 ? "eager" : "lazy",
            sizes: "(max-width: 860px) 50vw, 33vw",
          })}
        </button>
        ${renderDownloadLink(item, rawCaption)}
      </article>
    `;
  }

  function renderFolderCover(album, index) {
    const cover = album.coverImage || album.items[0]?.image;
    if (!cover) {
      return '<span class="gallery-folder-placeholder"><i data-lucide="folder"></i></span>';
    }

    return responsiveImage(cover, {
      fetchPriority: index === 0 ? "high" : "",
      loading: index < 3 ? "eager" : "lazy",
      sizes: "(max-width: 860px) 50vw, 33vw",
    });
  }

  function renderFolderCard(album, index) {
    const title = escapeHtml(album.title);
    const count = album.items.length;

    return `
      <button class="gallery-folder-card reveal-card" type="button" data-album-id="${escapeHtml(album.id)}" aria-label="Deschide folderul ${title}">
        <span class="gallery-folder-cover">
          ${renderFolderCover(album, index)}
        </span>
        <span class="gallery-folder-overlay">
          <span class="gallery-folder-title"><i data-lucide="folder"></i>${title}</span>
          <span class="gallery-folder-count">${escapeHtml(photoCountLabel(count))}</span>
        </span>
      </button>
    `;
  }

  function visibleGalleryItems() {
    return Array.from(document.querySelectorAll("[data-gallery] .gallery-card"));
  }

  function createLightboxState() {
    return {
      activeGalleryIndex: 0,
      galleryItems: visibleGalleryItems(),
      lastFocusedElement: null,
      lightbox: document.querySelector("[data-lightbox]"),
      lightboxCaption: document.querySelector("[data-lightbox-caption]"),
      lightboxClose: document.querySelector("[data-lightbox-close]"),
      lightboxDownload: document.querySelector("[data-lightbox-download]"),
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
    if (state.lightboxDownload) {
      state.lightboxDownload.href = "#";
    }
    document.body.classList.remove("lightbox-open");
    lastFocusedElement?.focus();
  }

  function showGalleryImage(state, index) {
    const { lightbox, lightboxImage, lightboxCaption, lightboxDownload, galleryItems } = state;
    if (!lightbox || !lightboxImage || galleryItems.length === 0 || index < 0) return;

    if (lightbox.hidden) {
      state.lastFocusedElement = document.activeElement;
    }

    state.activeGalleryIndex = normalizeGalleryIndex(index, galleryItems.length);

    const item = galleryItems[state.activeGalleryIndex];
    const caption = item.dataset.caption || "";
    const fallbackImage = item.querySelector("img")?.src || "";
    const downloadUrl = item.dataset.download || item.dataset.large || fallbackImage;

    lightboxImage.src = item.dataset.large || fallbackImage;
    lightboxImage.alt = caption;
    if (lightboxDownload) {
      lightboxDownload.href = downloadUrl;
      lightboxDownload.setAttribute("aria-label", caption ? `Descarcă ${caption}` : "Descarcă fotografia");
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = `${state.activeGalleryIndex + 1} / ${galleryItems.length} - ${caption}`;
    }

    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    state.lightboxClose?.focus();
  }

  function bindGalleryItems(state) {
    state.galleryItems = visibleGalleryItems();
    state.galleryItems.forEach((item, index) => {
      item.querySelector(".gallery-item")?.addEventListener("click", () => showGalleryImage(state, index));
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
    if (!state.lightbox || !state.lightboxImage) return null;

    bindLightboxBackdrop(state);
    bindLightboxButtons(state);
    bindLightboxKeyboard(state);

    return state;
  }

  function updateStatus(message) {
    const status = document.querySelector("[data-gallery-status]");
    if (status) {
      status.textContent = message;
    }
  }

  function refreshDynamicContent() {
    refreshIcons();
    initReveal();
  }

  function renderFolderView(gallery, state) {
    const host = document.querySelector("[data-gallery]");
    const toolbar = document.querySelector("[data-gallery-toolbar]");
    const backButton = document.querySelector("[data-gallery-back]");
    if (!host) return;

    host.classList.add("is-folder-view");
    host.innerHTML = gallery.albums.map(renderFolderCard).join("");

    if (toolbar) toolbar.hidden = false;
    if (backButton) backButton.hidden = true;
    updateStatus(`${gallery.status} Alege un folder pentru a vedea fotografiile.`);

    host.querySelectorAll("[data-album-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const album = gallery.albums.find((item) => item.id === button.dataset.albumId);
        if (album) {
          renderPhotoView(album, state);
        }
      });
    });

    refreshDynamicContent();
  }

  function renderPhotoView(album, state) {
    const host = document.querySelector("[data-gallery]");
    const backButton = document.querySelector("[data-gallery-back]");
    if (!host) return;

    host.classList.remove("is-folder-view");
    host.innerHTML = album.items.length
      ? album.items.map(renderGalleryItem).join("")
      : '<p class="gallery-loading">Folderul nu conține fotografii momentan.</p>';

    if (backButton) backButton.hidden = false;
    updateStatus(`${album.title} · ${photoCountLabel(album.items.length)}`);

    if (state) {
      bindGalleryItems(state);
    }
    refreshDynamicContent();
  }

  ready(async () => {
    const host = document.querySelector("[data-gallery]");
    if (!host) return;

    host.innerHTML = '<p class="gallery-loading">Se încarcă folderele foto...</p>';

    const gallery = await loadGalleryAlbums();
    if (!gallery.albums.length) {
      host.innerHTML = '<p class="gallery-loading">Nu există foldere disponibile momentan.</p>';
      updateStatus(gallery.status);
      return;
    }

    const state = initGalleryLightbox();
    const backButton = document.querySelector("[data-gallery-back]");
    backButton?.addEventListener("click", () => renderFolderView(gallery, state));

    renderFolderView(gallery, state);
  });
})();
