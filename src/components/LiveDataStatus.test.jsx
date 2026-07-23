// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import LiveDataStatus from "./LiveDataStatus.jsx";

afterEach(cleanup);

describe("LiveDataStatus", () => {
  it("warns clearly when local fallback fixtures are shown", () => {
    render(<LiveDataStatus status="fallback" error="API unavailable" />);
    expect(screen.getByRole("status")).toHaveTextContent("Illustrative fallback data");
    expect(screen.getByRole("status")).toHaveTextContent("API unavailable");
  });

  it("shows stale age and source", () => {
    render(
      <LiveDataStatus
        status="stale"
        meta={{ dataAgeMs: 120_000, source: "Variational + venues" }}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Cached data");
    expect(screen.getByRole("status")).toHaveTextContent("2m old");
    expect(screen.getByRole("status")).toHaveTextContent("Variational + venues");
  });

  it("stays compact for healthy live data", () => {
    render(<LiveDataStatus status="live" meta={{ dataAgeMs: 5_000, source: "API" }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Live data");
  });

  it("distinguishes unavailable data from illustrative fallback data", () => {
    render(<LiveDataStatus status="unavailable" error="Price feed timed out" />);
    expect(screen.getByRole("status")).toHaveTextContent("Live data unavailable");
    expect(screen.getByRole("status")).toHaveTextContent("Price feed timed out");
    expect(screen.getByRole("status")).not.toHaveTextContent("Illustrative fallback data");
  });
});
