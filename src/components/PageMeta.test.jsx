// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import PageMeta from "./PageMeta.jsx";

afterEach(cleanup);

describe("PageMeta", () => {
  it("normalizes trailing-slash deployment URLs before metadata lookup", async () => {
    document.head.innerHTML = '<link rel="canonical" href="https://tryvariational.xyz/">';
    render(<PageMeta path="/rates/" />);

    await waitFor(() => {
      expect(document.title).toContain("Funding Rate Comparison Tool");
    });
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://tryvariational.xyz/rates"
    );
  });
});
