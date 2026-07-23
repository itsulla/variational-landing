import { createServer } from "node:http";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const PRERENDER_ROUTES = [
  "/",
  "/rates",
  "/compare",
  "/liquidations",
  "/pre-ipo",
  "/spcx",
  "/spacex",
  "/insights",
  "/insights/why-perp-dexes-coexist",
  "/insights/openai-pre-ipo-perps",
  "/insights/anthropic-pre-ipo-perps",
  "/insights/funding-rate-farming-guide",
  "/insights/variational-review",
  "/insights/pre-ipo-perps-explained",
  "/insights/best-pre-ipo-platforms",
  "/terminal",
  "/bloomberg",
  "/neon",
];

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

export function routeOutputPath(route, distDir) {
  if (!route.startsWith("/") || route.includes("..") || route.includes("\\")) {
    throw new Error(`Unsafe route: ${route}`);
  }
  if (route === "/") return join(distDir, "index.html");
  return join(distDir, route.slice(1), "index.html");
}

async function browserExecutable() {
  const candidates = [
    process.env.PRERENDER_BROWSER_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      // Continue to Playwright's managed browser.
    }
  }
  return undefined;
}

function createStaticServer(distDir, appShell) {
  const root = resolve(distDir);
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(url.pathname);
      const requestedPath = normalize(join(root, pathname));
      const isStaticFile = pathname.startsWith("/assets/")
        || ["/favicon.svg", "/robots.txt", "/sitemap.xml"].includes(pathname)
        || Boolean(extname(pathname));

      if (isStaticFile && requestedPath.startsWith(root)) {
        const body = await readFile(requestedPath);
        response.writeHead(200, {
          "content-type": MIME_TYPES[extname(requestedPath)] || "application/octet-stream",
          "cache-control": pathname.startsWith("/assets/")
            ? "public, max-age=31536000, immutable"
            : "no-cache",
        });
        response.end(body);
        return;
      }

      response.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(appShell);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}

async function listen(server) {
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

export async function prerender({
  distDir = process.env.PRERENDER_DIST || resolve("dist"),
  routes = PRERENDER_ROUTES,
} = {}) {
  const appShell = await readFile(join(distDir, "index.html"), "utf8");
  const server = createStaticServer(distDir, appShell);
  const baseUrl = await listen(server);
  const executablePath = await browserExecutable();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });

  try {
    const context = await browser.newContext({
      serviceWorkers: "block",
      userAgent: "VariationalStaticRenderer/1.0",
    });

    await context.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      const isLocal = requestUrl.origin === baseUrl;
      if (!isLocal || requestUrl.pathname.startsWith("/api/") || requestUrl.pathname === "/script.js") {
        await route.abort();
        return;
      }
      await route.continue();
    });

    const page = await context.newPage();
    page.setDefaultTimeout(20_000);

    for (const route of routes) {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
      if (!response?.ok()) throw new Error(`${route}: app shell returned ${response?.status()}`);

      await page.waitForSelector("#root h1");
      await page.waitForFunction(() => {
        // This callback executes inside Chromium, where `document` is defined.
        // eslint-disable-next-line no-undef
        const root = document.querySelector("#root");
        return root && root.textContent.length > 400 && !root.textContent.includes("Loading...");
      });
      await page.waitForTimeout(75);

      const snapshot = await page.content();
      if (!snapshot.includes("<h1") || snapshot.includes('<div id="root"></div>')) {
        throw new Error(`${route}: rendered snapshot did not contain crawler-visible content`);
      }

      const outputPath = routeOutputPath(route, distDir);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, snapshot, "utf8");
      console.log(`prerendered ${route} -> ${outputPath}`);
    }

    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolveClose, reject) => {
      server.close((error) => (error ? reject(error) : resolveClose()));
    });
  }
}

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  prerender().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
