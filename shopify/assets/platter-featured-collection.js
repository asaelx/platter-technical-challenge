/**
 * Adds mobile expansion while preserving the user's choice across layout changes.
 * @param {HTMLElement} collection - Collection containing the products and toggle.
 * @param {AbortSignal} signal - Removes this instance's listeners on section unload.
 * @returns {Function | undefined} Restores the unenhanced markup when removed.
 */
function initializeCollectionExpansion(collection, signal) {
  const viewport = collection.querySelector(".platter-collection-scroll");
  const button = collection.querySelector(".platter-collection-toggle");
  const extraProducts = [...collection.querySelectorAll(".platter-product-item")].slice(4);

  if (!viewport || !button || extraProducts.length === 0) {
    return;
  }

  // Keep this breakpoint aligned with Tailwind's md layout in shopify/src/platter-featured-collection.css.
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

    // Measure the current height before cancelling so rapid toggles start where
    // the previous animation left off. Resizing also cancels stale dimensions.
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
      // Only the latest animation may restore visibility and interaction state.
      if (animation === currentAnimation) {
        animation = null;
        viewport.removeAttribute("data-animating");
        setProductVisibility(mobileExpanded);
      }
    }).catch(() => {
      // Cancellation is expected when re-rendering or unloading the section.
    });
  }

  button.addEventListener("click", () => {
    if (desktop.matches) {
      return;
    }

    button.focus({ preventScroll: true });
    mobileExpanded = !mobileExpanded;
    render(true);
  }, { signal });

  desktop.addEventListener("change", () => render(), { signal });
  reducedMotion.addEventListener("change", () => render(), { signal });
  window.addEventListener("resize", () => {
    if (animation) {
      render();
    }
  }, { signal });

  render();

  return () => {
    if (animation) {
      animation.cancel();
      animation = null;
    }

    viewport.removeAttribute("data-animating");
    setProductVisibility(true);
    button.hidden = true;
    button.textContent = "Show More";
    button.setAttribute("aria-expanded", "true");
  };
}

/**
 * Enhances native collection scrolling with a synchronized desktop scrollbar.
 * @param {HTMLElement} collection - Collection containing the viewport and scrollbar.
 * @param {AbortSignal} signal - Removes this instance's listeners on section unload.
 * @returns {Function | undefined} Releases observers, pointer capture, and pending updates.
 */
function initializeCollectionScrollbar(collection, signal) {
  const viewport = collection.querySelector(".platter-collection-scroll");
  const products = collection.querySelector(".platter-product-list");
  const track = collection.querySelector(".platter-collection-scrollbar");
  const thumb = collection.querySelector(".platter-collection-scrollbar-thumb");

  if (!viewport || !products || !track || !thumb) {
    return;
  }

  // Keep this breakpoint aligned with Tailwind's md layout in shopify/src/platter-featured-collection.css.
  const desktop = window.matchMedia("(min-width: 48rem)");
  // Content scroll distance and thumb travel use different pixel ranges.
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
        const toggle = collection.querySelector(".platter-collection-toggle");
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
    // The thumb represents the visible fraction; progress maps content scroll
    // onto the remaining track space rather than the full track width.
    const thumbWidth = trackWidth * viewport.clientWidth / viewport.scrollWidth;
    maxTravel = trackWidth - thumbWidth;
    const progress = Math.max(0, Math.min(1, viewport.scrollLeft / maxScroll));
    const percent = Math.round(progress * 100);

    if (drag && drag.trackWidth !== trackWidth) {
      stopDragging();
    }

    thumb.style.setProperty("--platter-thumb-width", `${thumbWidth}px`);
    thumb.style.setProperty("--platter-thumb-offset", `${progress * maxTravel}px`);
    thumb.setAttribute("aria-valuenow", String(percent));
    thumb.setAttribute("aria-valuetext", `${percent}% scrolled`);
  }

  // Coalesce scroll and ResizeObserver notifications into one update per frame.
  function scheduleUpdate() {
    if (signal.aborted) {
      return;
    }

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

    if (track.hidden) {
      return;
    }

    if (event.target !== thumb) {
      const bounds = track.getBoundingClientRect();
      scrollToThumbOffset(event.clientX - bounds.left - thumb.getBoundingClientRect().width / 2);
    }

    // Preserve the grab point so dragging does not snap the thumb to its center.
    drag = {
      pointerId: event.pointerId,
      offset: event.clientX - thumb.getBoundingClientRect().left,
      trackWidth: track.clientWidth,
    };
    track.setAttribute("data-dragging", "");
    thumb.focus({ preventScroll: true });
    // Continue receiving movement and release events outside the track.
    track.setPointerCapture(event.pointerId);
  }, { signal });

  track.addEventListener("pointermove", (event) => {
    if (drag && event.pointerId === drag.pointerId) {
      scrollToThumbOffset(event.clientX - track.getBoundingClientRect().left - drag.offset);
    }
  }, { signal });

  for (const eventName of ["pointerup", "pointercancel", "lostpointercapture"]) {
    track.addEventListener(eventName, stopDragging, { signal });
  }

  thumb.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const product = products.querySelector(".platter-product-item");
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
  }, { signal });

  // Responsive CSS can hide the focused thumb before the media-query handler
  // runs. Remember its focus so synchronize can move focus to a visible control.
  thumb.addEventListener("focus", () => {
    thumbHadFocus = true;
  }, { signal });
  thumb.addEventListener("blur", () => {
    if (desktop.matches) {
      thumbHadFocus = false;
    }
  }, { signal });

  viewport.addEventListener("scroll", scheduleUpdate, { passive: true, signal });
  desktop.addEventListener("change", synchronize, { signal });
  const observer = new ResizeObserver(scheduleUpdate);
  observer.observe(viewport);
  observer.observe(products);
  observer.observe(track);
  synchronize();

  return () => {
    observer.disconnect();
    stopDragging();
    window.cancelAnimationFrame(updateFrame);
    track.hidden = true;
    viewport.removeAttribute("data-custom-scrollbar");
    thumb.style.removeProperty("--platter-thumb-width");
    thumb.style.removeProperty("--platter-thumb-offset");
    thumb.setAttribute("aria-valuenow", "0");
    thumb.removeAttribute("aria-valuetext");
  };
}

// The module is shared across section instances; repeated editor load events must
// not attach a second set of handlers to an already initialized collection.
const collectionInstances = new WeakMap();

/**
 * Visits collections in either an editor section wrapper or the whole document.
 * @param {Document | Element} root - Subtree added to or removed from the page.
 * @param {Function} callback - Receives each collection root.
 */
function forEachCollection(root, callback) {
  if (root instanceof Element && root.matches("[data-platter-collection]")) {
    callback(root);
  }

  root.querySelectorAll("[data-platter-collection]").forEach(callback);
}

function initializeCollection(collection) {
  if (collectionInstances.has(collection)) {
    return;
  }

  const controller = new AbortController();
  const cleanups = [
    initializeCollectionExpansion(collection, controller.signal),
    initializeCollectionScrollbar(collection, controller.signal),
  ].filter(Boolean);

  collectionInstances.set(collection, () => {
    // Remove listeners before restoring markup so cleanup cannot trigger updates.
    controller.abort();
    cleanups.forEach((cleanup) => cleanup());
    collectionInstances.delete(collection);
  });
}

forEachCollection(document, initializeCollection);

document.addEventListener("shopify:section:load", (event) => {
  forEachCollection(event.target, initializeCollection);
});

document.addEventListener("shopify:section:unload", (event) => {
  forEachCollection(event.target, (collection) => {
    collectionInstances.get(collection)?.();
  });
});
