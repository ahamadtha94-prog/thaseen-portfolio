# A.T. Thaseen Ibrahim — V8 Kinetic Atelier

**Static, responsive creative portfolio for GitHub Pages.** No framework, build step or API keys are required.

## What changed from V7

- Multi-layer mouse parallax in the home hero: fog, light beam, circular glints, architectural grid, large typography and portrait move at different depths.
- Scroll-linked cinematic transitions in the hero and four-image portfolio scene. All four scene photos have independent mouse-depth movement.
- A new kinetic typography interlude with three words travelling at separate speeds as you scroll.
- More dimensional portfolio category hovers: background image and overlay typography respond separately to the pointer.
- Extra perspective motion in featured story images, illuminated outlines, and subtle glint effects.
- A small **Motion On/Off** control in the header, with the preference saved locally in the browser. Reduced-motion OS preferences are always honored.
- Retains existing two borderless portraits and project imagery, black-red theme, 4 curated story chapters and lightbox viewer.

## Publish to GitHub Pages

1. Extract the ZIP.
2. Open your repository: https://github.com/ahamadtha94-prog/thaseen-portfolio
3. Upload **the contents of this folder**, not an outer containing folder, to the repository root. Replace existing `index.html`, `.css`, `.js`, and upload/replace the `assets` directory.
4. Commit changes. The repository is already configured for GitHub Pages from the `main` branch and repository root in previous instructions; verify in Settings → Pages if needed.
5. Your URL: https://ahamadtha94-prog.github.io/thaseen-portfolio/

For best results, use **Add file → Upload files** to replace each existing file with the same name, or sync the folder using GitHub Desktop. Do not upload the ZIP itself as the website.

## Files

- `index.html` — layout, semantic sections and page metadata.
- `styles.css` — site foundation, responsive components and lightbox.
- `motion-v7.css` — established motion styling.
- `motion-v8.css` — cinematic multi-plane effects, typographic transition and motion control.
- `script.js` — menu, progress indicator, gallery and navigation.
- `motion-v7.js` — card and section scroll interactions.
- `motion-v8.js` — parallax controller, pointer depth and on/off control.
- `assets/` — curated image files.

## Performance and accessibility

- Uses native CSS and `requestAnimationFrame` rather than a heavy animation framework. Scroll and mouse motion are bounded.
- Keyboard navigation, skip-to-content link and image viewer controls preserved.
- Fine-pointer effects do not run on touch devices; scroll layers are reduced on smaller screens.
- System `prefers-reduced-motion` disables decorative motion; the user may also toggle it off manually.
- Original project imagery is shown without manufactured detail changes.
- Remote Google Fonts are optional; the site works with local fallback fonts when offline.

**Note:** Static portfolio concept images and illustrative visuals are not representations of completed built projects unless explicitly stated.
