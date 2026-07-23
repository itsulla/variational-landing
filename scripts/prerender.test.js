import { describe, expect, it } from "vitest";

import { PRERENDER_ROUTES, routeOutputPath } from "./prerender.mjs";

describe("prerender manifest", () => {
  it("covers every canonical public acquisition and article route", () => {
    expect(PRERENDER_ROUTES).toEqual(expect.arrayContaining([
      "/",
      "/rates",
      "/compare",
      "/liquidations",
      "/pre-ipo",
      "/insights",
      "/insights/best-pre-ipo-platforms",
      "/insights/variational-review",
      "/insights/funding-rate-farming-guide",
    ]));
    expect(new Set(PRERENDER_ROUTES).size).toBe(PRERENDER_ROUTES.length);
  });

  it("writes root and nested route documents to nginx-friendly paths", () => {
    expect(routeOutputPath("/", "/tmp/site")).toBe("/tmp/site/index.html");
    expect(routeOutputPath("/rates", "/tmp/site")).toBe("/tmp/site/rates/index.html");
    expect(routeOutputPath("/insights/openai-pre-ipo", "/tmp/site"))
      .toBe("/tmp/site/insights/openai-pre-ipo/index.html");
  });

  it("rejects paths that could escape the output directory", () => {
    expect(() => routeOutputPath("/../secret", "/tmp/site")).toThrow(/Unsafe route/);
  });
});
