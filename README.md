# Platter technical challenge

A static featured collection built with semantic HTML, Tailwind CSS, and Vanilla JavaScript.

## Current status

The foundation contains the page shell and generated CSS. Product content, fonts, responsive collection styling, and interactions will follow in later stages. The Shopify bonus is deferred.

## Preview

Open `index.html` directly in a browser. No dependencies or build step are required to view the checked-in page.

For a local HTTP preview, run this command from the project root and visit <http://localhost:8000>:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The page uses relative asset paths suitable for a GitHub Pages project site. Publishing is not configured yet.

## Files

- `index.html`: semantic page markup.
- `src/styles.css`: Tailwind input and explicit application source paths.
- `assets/styles.css`: generated CSS; commit this file whenever its source changes.
- `assets/main.js`: Vanilla JavaScript entry point for future interactions.

## Generate CSS during development

Use the standalone [Tailwind CSS v4.3.3 CLI](https://github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.3). No npm installation or project packages are needed.

For macOS on Apple Silicon, download the executable outside this repository:

```sh
mkdir -p /private/tmp/platter-tools
curl -fL https://github.com/tailwindlabs/tailwindcss/releases/download/v4.3.3/tailwindcss-macos-arm64 \
  -o /private/tmp/platter-tools/tailwindcss-v4.3.3
chmod +x /private/tmp/platter-tools/tailwindcss-v4.3.3
```

For other platforms, use the matching standalone executable from the same release. The temporary directory may be cleared by the operating system; download the executable again if needed.

From the project root, generate the CSS:

```sh
/private/tmp/platter-tools/tailwindcss-v4.3.3 \
  -i ./src/styles.css -o ./assets/styles.css --minify
```

Append `--watch` to rebuild while editing. Keep complete utility class names in the HTML or JavaScript so Tailwind can detect them. Automatic scanning is disabled; only the explicit application sources in `src/styles.css` are scanned.

The CLI is a development tool. The delivered page loads the generated CSS directly and does not use a runtime Tailwind CDN.
