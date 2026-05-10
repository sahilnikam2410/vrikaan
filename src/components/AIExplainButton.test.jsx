import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AIExplainButton from "./AIExplainButton.jsx";

describe("<AIExplainButton>", () => {
  beforeEach(() => {
    // Replace global fetch for every test
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the trigger button with the default label", () => {
    render(<AIExplainButton toolName="x" input="" result={{}} />);
    expect(screen.getByRole("button", { name: /AI Explain/i })).toBeInTheDocument();
  });

  it("renders a custom label when provided", () => {
    render(<AIExplainButton toolName="x" input="" result={{}} label="Tell me more" />);
    expect(screen.getByRole("button", { name: /Tell me more/i })).toBeInTheDocument();
  });

  it("posts to /api/tools?tool=ai-explain with the tool payload", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ explanation: "sample analysis" }),
    });
    render(<AIExplainButton toolName="dark-web-monitor" input="user@example.com" result={{ breaches: [] }} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/tools?tool=ai-explain",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName: "dark-web-monitor", input: "user@example.com", result: { breaches: [] } }),
        })
      );
    });
  });

  it("renders the explanation panel after a successful response", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ explanation: "This breach is dangerous because…" }),
    });
    render(<AIExplainButton toolName="x" input="" result={{}} />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/This breach is dangerous because/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Analysis/i)).toBeInTheDocument();
  });

  it("renders the error block when the API returns an error", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Rate limited" }),
    });
    render(<AIExplainButton toolName="x" input="" result={{}} />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(/Rate limited/i)).toBeInTheDocument();
  });

  it("disables the button while in flight", async () => {
    let resolveFn;
    globalThis.fetch.mockImplementationOnce(
      () => new Promise((res) => { resolveFn = res; })
    );
    render(<AIExplainButton toolName="x" input="" result={{}} />);
    const btn = screen.getByRole("button");
    fireEvent.click(btn);
    expect(btn).toBeDisabled();
    // Cleanup — let the request resolve so React doesn't warn
    resolveFn({ ok: true, json: () => Promise.resolve({ explanation: "ok" }) });
    await waitFor(() => expect(btn).not.toBeDisabled());
  });
});
