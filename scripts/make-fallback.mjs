// Renderiza scripts/fallback-planet.html con Edge/Chrome headless y guarda public/fallback/planet.webp.
// Uso: npm run fallback  (BROWSER=ruta\al\navegador si no está en la ruta por defecto)
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(resolve(here, "fallback-planet.html")).href;
const out = resolve(here, "../public/fallback/planet.webp");

const candidates = [
  process.env.BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) throw new Error("No se encontró Edge/Chrome. Define BROWSER.");

const dom = execFileSync(browser, ["--headless=new", "--disable-gpu", "--dump-dom", page], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});
const match = dom.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/);
if (!match?.[1]) throw new Error("El navegador no devolvió un WebP.");

mkdirSync(dirname(out), { recursive: true });
const bytes = Buffer.from(match[1], "base64");
writeFileSync(out, bytes);
console.log(`planet.webp: ${(bytes.length / 1024).toFixed(1)} KB`);
