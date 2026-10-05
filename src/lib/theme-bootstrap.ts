/**
 * Runs in `<head>` before paint so the saved next-themes value is on `<html>`
 * without a flash. Mirrors the bundled "Preventing flash before hydration"
 * guide, using `class="dark"` to match Tailwind and next-themes.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`;

/**
 * Sets `<html lang>` from the locale prefix before paint. Cache Components
 * cannot `await params` in the root layout without blocking the static shell.
 */
export const LOCALE_BOOTSTRAP_SCRIPT = `(function(){try{var m=location.pathname.match(/^\\/(en|pl)(?:\\/|$)/);if(m)document.documentElement.lang=m[1]}catch(e){}})()`;
