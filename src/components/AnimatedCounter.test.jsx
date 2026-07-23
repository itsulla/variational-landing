// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AnimatedCounter from "./AnimatedCounter.jsx";

let intersectionCallback;

class IntersectionObserverStub {
  constructor(callback) {
    intersectionCallback = callback;
  }

  observe() {}
  disconnect() {}
}

describe("AnimatedCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    vi.stubGlobal(
      "requestAnimationFrame",
      (callback) => setTimeout(() => callback(performance.now()), 16)
    );
    vi.stubGlobal("cancelAnimationFrame", (id) => clearTimeout(id));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("updates to a newer live value after the counter has animated", async () => {
    const { rerender } = render(
      <AnimatedCounter value={175} prefix="$" suffix="B+" duration={100} />
    );

    act(() => intersectionCallback([{ isIntersecting: true }]));
    await act(async () => vi.advanceTimersByTimeAsync(200));
    expect(screen.getByText("$175B+")).toBeInTheDocument();

    rerender(<AnimatedCounter value={277} prefix="$" suffix="B+" duration={100} />);
    expect(screen.getByText("$277B+")).toBeInTheDocument();
  });
});
