// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CopyCode from "./CopyCode.jsx";

const theme = { bg: "#000", text: "#fff", accent: "#60a5fa" };
const fonts = { body: "system-ui", mono: "monospace" };

describe("CopyCode waitlist", () => {
  beforeEach(() => {
    window.__REF_POOL__ = { pool_exhausted: true };
    window.rdt = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete window.rdt;
  });

  it("shows server errors instead of claiming an unacknowledged signup", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "waitlist unavailable" }),
    }));
    render(<CopyCode code="OMNIXOIXIBOD" theme={theme} fonts={fonts} />);

    fireEvent.change(screen.getByPlaceholderText("email or @telegram"), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Notify me" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("waitlist unavailable");
    expect(screen.queryByText(/You're on the list/)).not.toBeInTheDocument();
    expect(window.rdt).not.toHaveBeenCalled();
  });

  it("shows success and tracks conversion only after a 201 acknowledgement", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ok: true }),
    }));
    render(<CopyCode code="OMNIXOIXIBOD" theme={theme} fonts={fonts} />);

    fireEvent.change(screen.getByPlaceholderText("email or @telegram"), {
      target: { value: "@valid_handle" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Notify me" }));

    await waitFor(() => expect(screen.getByText(/You're on the list/)).toBeInTheDocument());
    expect(window.rdt).toHaveBeenCalledWith("track", "Custom", {
      customEventName: "WaitlistJoin",
    });
  });
});
