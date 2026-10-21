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

document.querySelectorAll(".collection").forEach(initializeCollectionExpansion);
