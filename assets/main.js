function initializeCollectionExpansion(collection) {
  const viewport = collection.querySelector(".collection-scroll");
  const button = collection.querySelector(".collection-toggle");
  const extraProducts = [...collection.querySelectorAll(".product-item")].slice(4);

  if (!viewport || !button || extraProducts.length === 0) {
    return;
  }

  const desktop = window.matchMedia("(min-width: 48rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let mobileExpanded = false;
  let animation = null;

  function setProductVisibility(visible, interactive = visible) {
    for (const product of extraProducts) {
      product.hidden = !visible;
      product.inert = !interactive;

      if (interactive) {
        product.removeAttribute("aria-hidden");
      } else {
        product.setAttribute("aria-hidden", "true");
      }
    }
  }

  function render(animate = false) {
    const startHeight = viewport.getBoundingClientRect().height;

    if (animation) {
      animation.cancel();
      animation = null;
    }

    viewport.removeAttribute("data-animating");
    button.hidden = desktop.matches;
    button.textContent = mobileExpanded ? "Show Less" : "Show More";
    button.setAttribute("aria-expanded", String(desktop.matches || mobileExpanded));

    if (desktop.matches) {
      setProductVisibility(true);
      return;
    }

    const focusWillBeHidden = !mobileExpanded && extraProducts.some(
      (product) => product.contains(document.activeElement),
    );

    if (focusWillBeHidden) {
      button.focus({ preventScroll: true });
    }

    setProductVisibility(mobileExpanded);
    const targetHeight = viewport.getBoundingClientRect().height;

    if (focusWillBeHidden) {
      button.scrollIntoView({ block: "nearest" });
    }

    if (!animate || reducedMotion.matches || startHeight === targetHeight) {
      return;
    }

    // Keep cards rendered during the height animation without exposing clipped links.
    setProductVisibility(true, false);
    viewport.setAttribute("data-animating", "");

    const currentAnimation = viewport.animate(
      [{ height: `${startHeight}px` }, { height: `${targetHeight}px` }],
      { duration: 300, easing: "ease-in-out" },
    );
    animation = currentAnimation;

    currentAnimation.finished.then(() => {
      if (animation === currentAnimation) {
        animation = null;
        viewport.removeAttribute("data-animating");
        setProductVisibility(mobileExpanded);
      }
    }).catch(() => {});
  }

  button.addEventListener("click", () => {
    if (desktop.matches) {
      return;
    }

    button.focus({ preventScroll: true });
    mobileExpanded = !mobileExpanded;
    render(true);
  });

  desktop.addEventListener("change", () => render());
  reducedMotion.addEventListener("change", () => render());
  window.addEventListener("resize", () => {
    if (animation) {
      render();
    }
  });

  render();
}

function initializeCollectionScrollbar(collection) {
  const viewport = collection.querySelector(".collection-scroll");
  const products = collection.querySelector(".product-list");
  const track = collection.querySelector(".collection-scrollbar");
  const thumb = collection.querySelector(".collection-scrollbar-thumb");

  if (!viewport || !products || !track || !thumb) {
    return;
  }

  const desktop = window.matchMedia("(min-width: 48rem)");
  let maxScroll = 0;
  let maxTravel = 0;
  let drag = null;
  let updateFrame = 0;
  let thumbHadFocus = false;

  function stopDragging(event) {
    if (!drag || (event && event.pointerId !== drag.pointerId)) {
      return;
    }

    const { pointerId } = drag;
    drag = null;
    track.removeAttribute("data-dragging");

    if (track.hasPointerCapture(pointerId)) {
      track.releasePointerCapture(pointerId);
    }
  }

  function synchronize() {
    maxScroll = viewport.scrollWidth - viewport.clientWidth;
    const visible = desktop.matches && maxScroll > 1;

    if (!visible) {
      stopDragging();

      if (document.activeElement === thumb || thumbHadFocus) {
        const toggle = collection.querySelector(".collection-toggle");
        const focusTarget = !desktop.matches && toggle && !toggle.hidden ? toggle : viewport;
        focusTarget.focus();
        thumbHadFocus = false;
      }

      track.hidden = true;
      viewport.removeAttribute("data-custom-scrollbar");
      return;
    }

    track.hidden = false;
    viewport.setAttribute("data-custom-scrollbar", "");

    const trackWidth = track.clientWidth;
    const thumbWidth = trackWidth * viewport.clientWidth / viewport.scrollWidth;
    maxTravel = trackWidth - thumbWidth;
    const progress = Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll));
    const percent = Math.round(progress * 100);

    if (drag && drag.trackWidth !== trackWidth) {
      stopDragging();
    }

    thumb.style.setProperty("--thumb-width", `${thumbWidth}px`);
    thumb.style.setProperty("--thumb-offset", `${progress * maxTravel}px`);
    thumb.setAttribute("aria-valuenow", String(percent));
    thumb.setAttribute("aria-valuetext", `${percent}% scrolled`);
  }

  function scheduleUpdate() {
    if (!updateFrame) {
      updateFrame = window.requestAnimationFrame(() => {
        updateFrame = 0;
        synchronize();
      });
    }
  }

  function scrollToThumbOffset(offset) {
    if (maxTravel > 0) {
      const position = Math.max(0, Math.min(maxTravel, offset));
      viewport.scrollLeft = position / maxTravel * maxScroll;
      synchronize();
    }
  }

  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !event.isPrimary || track.hidden) {
      return;
    }

    event.preventDefault();
    synchronize();

    if (event.target !== thumb) {
      const bounds = track.getBoundingClientRect();
      scrollToThumbOffset(event.clientX - bounds.left - thumb.getBoundingClientRect().width / 2);
    }

    drag = {
      pointerId: event.pointerId,
      offset: event.clientX - thumb.getBoundingClientRect().left,
      trackWidth: track.clientWidth,
    };
    track.setAttribute("data-dragging", "");
    thumb.focus({ preventScroll: true });
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (drag && event.pointerId === drag.pointerId) {
      scrollToThumbOffset(event.clientX - track.getBoundingClientRect().left - drag.offset);
    }
  });

  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    track.addEventListener(eventName, stopDragging);
  }

  thumb.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const product = products.querySelector(".product-item");
    const gap = Number.parseFloat(window.getComputedStyle(products).columnGap) || 0;
    const cardStep = product ? product.getBoundingClientRect().width + gap : viewport.clientWidth;
    const positions = {
      ArrowLeft: viewport.scrollLeft - cardStep,
      ArrowUp: viewport.scrollLeft - cardStep,
      ArrowRight: viewport.scrollLeft + cardStep,
      ArrowDown: viewport.scrollLeft + cardStep,
      PageUp: viewport.scrollLeft - viewport.clientWidth,
      PageDown: viewport.scrollLeft + viewport.clientWidth,
      Home: 0,
      End: maxScroll,
    };

    if (Object.hasOwn(positions, event.key)) {
      event.preventDefault();
      viewport.scrollLeft = positions[event.key];
      synchronize();
    }
  });

  thumb.addEventListener("focus", () => {
    thumbHadFocus = true;
  });
  thumb.addEventListener("blur", () => {
    if (desktop.matches) {
      thumbHadFocus = false;
    }
  });

  viewport.addEventListener("scroll", scheduleUpdate, { passive: true });
  desktop.addEventListener("change", synchronize);
  const observer = new ResizeObserver(scheduleUpdate);
  observer.observe(viewport);
  observer.observe(products);
  observer.observe(track);
  synchronize();
}

document.querySelectorAll(".collection").forEach((collection) => {
  initializeCollectionExpansion(collection);
  initializeCollectionScrollbar(collection);
});
