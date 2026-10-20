# Platter technical challenge

I'm Asael Chavez, and this project is my submission for the technical challenge as part of my application to Platter.

The challenge is to recreate the supplied Figma featured collection across desktop and mobile, including product cards, secondary images on hover, mobile expansion, and a horizontal collection scrollbar.

## My approach

I'm using semantic HTML, Tailwind CSS, and Vanilla JavaScript, with an emphasis on matching the design, keeping the code readable, and making the interactions accessible by keyboard. The implementation will also respect reduced-motion preferences.

The project is delivered as a static page with generated CSS included. Reviewers can open `index.html` directly in a browser; no installation or build step is required.

## Review

**Live preview:** the review link will be added here.

## Fonts

The page uses locally hosted fonts matching the Figma design:

- [Source Serif Pro 3.001](https://github.com/adobe-fonts/source-serif/releases/tag/3.001R): Bold and Black for headings.
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue): Regular for product titles and badges.
- [Poppins](https://fonts.google.com/specimen/Poppins): Regular, Medium, and SemiBold for supporting text and controls.

The WOFF2 files and original SIL Open Font License texts are included in [`assets/fonts`](assets/fonts). Bebas Neue and Poppins use the Latin webfont subsets provided by Google Fonts. No external font requests are needed to view the page.
