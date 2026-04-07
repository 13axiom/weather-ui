/**
 * race-widget-loader.ts
 *
 * Loads the race-widget Web Component bundle in the browser.
 *
 * Strategy:
 *   In development — we import from the race-widget source directly.
 *   In production  — the built dist/race-widget.js is copied to
 *                    weather-ui/public/race-widget.js and loaded via script tag.
 *
 * This file is only ever imported on the client side (inside a useEffect),
 * so it is safe to use browser APIs here.
 *
 * HOW TO SET UP:
 *   Development:  npm run build  inside race-widget/, then copy
 *                 dist/race-widget.js  →  weather-ui/public/race-widget.js
 *
 *   The copy step is automated via the postbuild script in package.json
 *   (see race-widget/package.json for the script).
 */

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Avoid loading twice
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Load widget from public folder
// Make sure race-widget/dist/race-widget.js is copied to weather-ui/public/
export async function loadRaceWidget(): Promise<void> {
  await loadScript('/race-widget.js');
}

// Auto-load when this module is imported
loadRaceWidget().catch(err => {
  console.warn('[race-widget] Could not load widget bundle:', err.message);
  console.warn('[race-widget] Run: cp ../race-widget/dist/race-widget.js public/race-widget.js');
});
