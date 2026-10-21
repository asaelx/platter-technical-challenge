# Platter technical challenge

I'm Asael Chavez, and this project is my submission for the technical challenge as part of my application to Platter.

The challenge is to recreate the supplied Figma featured collection across desktop and mobile, including product cards, secondary images on hover, mobile expansion, and a horizontal collection scrollbar.

## My approach

I'm using semantic HTML, Tailwind CSS, and Vanilla JavaScript, with an emphasis on matching the design, keeping the code readable, and making the interactions accessible by keyboard. The implementation respects reduced-motion preferences.

The project is delivered as a static page with generated CSS included. Reviewers can open `index.html` directly in a browser; no installation or build step is required.

## Review

**Live preview:** [View the challenge](https://asaelx.github.io/platter-technical-challenge/).

## Challenge checklist

- [x] Recreate the supplied design, with the approved product content and image substitutions.
- [x] Include at least ten product cards.
- [x] Initially show only the first four products on mobile.
- [x] Provide a mobile-only Show More button that smoothly reveals the remaining six products.
- [x] Swap to a secondary product image on hover-capable devices.
- [x] Use free Unsplash stock images as placeholders.
- [x] Build with HTML, Tailwind CSS, and JavaScript.
- [x] Use well-structured, semantic HTML.
- [x] Use plain Vanilla JavaScript for functionality.
- [x] Make the layout responsive across desktop and mobile.
- [x] Increase the scrollbar thumb to 6px on hover or touch.
- [x] Create a Git repository with meaningful commits showing the development process.
- [x] Provide the [completed GitHub repository](https://github.com/asaelx/platter-technical-challenge).
- [x] Provide a [pure HTML live preview](https://asaelx.github.io/platter-technical-challenge/).
- [x] Require no installation or local build step to review the final result.
- [ ] Optional bonus: migrate to a Shopify section using Liquid and a schema input, with a development store or mockup. Deferred to prioritize the HTML submission.
- [ ] Conditional bonus delivery: provide a dev/demo store preview if the Shopify bonus is completed. Not applicable to this submission.

## Product images

The collection contains ten products with consistent titles, prices, ratings, and review counts across desktop and mobile. BEST SELLER badges appear on every card; SAVE 15% badges appear on cards 2 and 4. Product and collection links use `#` placeholders.

Each product has two Unsplash placeholder photos, delivered as locally hosted WebP images in 355px and 710px sizes. Related photos may show different models of the same product type. [Photo credits and source links](assets/images/SOURCES.md) are included.

Hovering over a product image shows its secondary photo on hover-capable devices. Moving the pointer away restores the primary photo. Touch-only devices retain the primary image; no tap interaction is needed to change images.

## Mobile collection

Below 768px at the default browser font size, the collection initially shows four products. Show More reveals the remaining six; Show Less collapses them. The transition lasts 300ms with smooth easing and is immediate when reduced motion is preferred.

The page remembers the mobile expanded or collapsed state when resizing between layouts during the current visit. Desktop always makes all ten products available. Reloading resets the mobile collection to four products.

Collapsed products are excluded from keyboard navigation and screen readers. Focus stays on the toggle when activated; if a resize would hide a focused product, focus moves to the toggle. With JavaScript disabled, all products remain available and the toggle is hidden.

## Desktop scrolling

Drag the scrollbar thumb or click the track to move through the collection. Track clicks center the thumb at the selected position. The thumb reflects the visible proportion of the collection and grows from 4px to 6px on hover or while dragging, including touch dragging. Trackpad and touch scrolling also work directly on the products.

When the scrollbar is focused, arrow keys move one card, Page Up and Page Down move one visible collection width, and Home and End reach either end. Movement is immediate, and the scrollbar exposes its position to assistive technology. The control is hidden on mobile and when all products fit without scrolling. Without JavaScript, native scrolling remains available.

## Fonts

The page uses locally hosted fonts matching the Figma design:

- [Source Serif Pro 3.001](https://github.com/adobe-fonts/source-serif/releases/tag/3.001R): Bold and Black for headings.
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue): Regular for product titles and badges.
- [Poppins](https://fonts.google.com/specimen/Poppins): Regular, Medium, and SemiBold for supporting text and controls.

The WOFF2 files and original SIL Open Font License texts are included in [`assets/fonts`](assets/fonts). Bebas Neue and Poppins use the Latin webfont subsets provided by Google Fonts. No external font requests are needed to view the page.

## Verification

Checked in Chrome at 320, 375, 640, 767, 768, 769, 1024, 1280, 1536, and 1920px widths, with additional intermediate resize checks. The review covered layout overflow, product content, hover images, mobile expansion, keyboard and touch-emulated scrolling, focus handling, and reduced motion.

The page and its local assets loaded successfully both by opening the HTML file directly and through a GitHub Pages-style URL path, with no external runtime requests. Regenerating the CSS produced an exact match with the included stylesheet.
