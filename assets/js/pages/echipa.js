(() => {
  const {
    escapeHtml,
    linkAttrs,
    loadData,
    ready,
    renderSocialIcon,
    responsiveImage,
  } = window.WSU;

  function socialIconLinks(member) {
    if (!Array.isArray(member.socials)) return [];

    return member.socials.filter((item) => hasValue(item.href) && hasValue(item.icon));
  }

  function renderSocialLink(item, memberName) {
    const label = item.label || item.icon || "Social";

    return `
      <a href="${escapeHtml(item.href)}"${linkAttrs(item.href)} aria-label="${escapeHtml(`${label} - ${memberName}`)}">
        ${renderSocialIcon(item, "mini-socials-icon")}
      </a>
    `;
  }

  function renderMiniSocials(member) {
    const links = socialIconLinks(member);
    if (!links.length) return "";

    return `
      <div class="mini-socials">
        ${links.map((item) => renderSocialLink(item, member.name)).join("")}
      </div>
    `;
  }

  function imageWithEmptyAlt(image) {
    return {
      ...image,
      alt: "",
    };
  }

  function directPortraitImage(image, className) {
    return `
      <img class="${escapeHtml(className)}" loading="eager" decoding="async" src="${escapeHtml(image.src)}" alt="">
    `;
  }

  function renderPortraitImage(image, className) {
    if (!image) return "";

    if (image.base) {
      return responsiveImage(imageWithEmptyAlt(image), {
        className,
        loading: "eager",
        sizes: "(max-width: 420px) 156px, (max-width: 560px) 184px, 300px",
      });
    }

    if (image.src) {
      return directPortraitImage(image, className);
    }

    return "";
  }

  function hasValue(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function hasDefaultPortrait(image) {
    return Boolean(image && (hasValue(image.base) || hasValue(image.src)));
  }

  function resolvePortraitImage(image, placeholderImage) {
    if (!image) return placeholderImage;
    if (!placeholderImage) return image;

    const resolvedImage = { ...image };

    if (!hasDefaultPortrait(resolvedImage)) {
      delete resolvedImage.base;
      resolvedImage.src = placeholderImage.src;
    }

    if (!resolvedImage.hoverImage && !hasValue(resolvedImage.hoverSrc)) {
      resolvedImage.hoverSrc = placeholderImage.hoverSrc;
    }

    return resolvedImage;
  }

  function hoverImageForPortrait(image) {
    if (!image) return null;
    if (image.hoverImage) return image.hoverImage;
    if (image.hoverSrc) return { src: image.hoverSrc };
    return null;
  }

  function renderTeamPortrait(image) {
    const hoverImage = hoverImageForPortrait(image);

    return `
      <div class="team-member-portrait" aria-hidden="true">
        ${renderPortraitImage(image, "team-member-image team-member-image-default")}
        ${renderPortraitImage(hoverImage, "team-member-image team-member-image-hover")}
      </div>
    `;
  }

  function renderTeamMember(member, placeholderImage) {
    const portrait = resolvePortraitImage(member.image, placeholderImage);
    const cardClass = hoverImageForPortrait(portrait) ? "team-member-card team-member-card-has-hover" : "team-member-card";

    return `
      <article class="team-member reveal-card">
        <div class="${cardClass}">
          ${renderTeamPortrait(portrait)}
          <h3>${escapeHtml(member.name)}</h3>
          <p>${escapeHtml(member.role)}</p>
          ${renderMiniSocials(member)}
        </div>
      </article>
    `;
  }

  function renderCoordinator(role, placeholderImage) {
    const member = typeof role === "string" ? { name: "În curând", role } : role;
    return renderTeamMember(member, placeholderImage);
  }

  ready(async () => {
    const teamHost = document.querySelector("[data-team-management]");
    const coordinatorHost = document.querySelector("[data-team-coordinators]");
    if (!teamHost && !coordinatorHost) return;

    const team = await loadData("team");
    const placeholderImage = team.placeholderImage || null;

    if (teamHost) {
      teamHost.innerHTML = team.management.map((member) => renderTeamMember(member, placeholderImage)).join("");
    }

    if (coordinatorHost) {
      coordinatorHost.innerHTML = team.coordinators.map((role) => renderCoordinator(role, placeholderImage)).join("");
    }
  });
})();
