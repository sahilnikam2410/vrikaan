import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PlanGate from "./PlanGate.jsx";
import { isPlanAllowed } from "../lib/plans.js";

// Mock the AuthContext so we can drive user.plan from each test
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
import { useAuth } from "../context/AuthContext";

function withRouter(node) {
  return <MemoryRouter>{node}</MemoryRouter>;
}

describe("isPlanAllowed (pure)", () => {
  it("free user blocked from pro feature", () => {
    expect(isPlanAllowed("free", "pro")).toBe(false);
  });
  it("pro user allowed for pro feature", () => {
    expect(isPlanAllowed("pro", "pro")).toBe(true);
  });
  it("enterprise user allowed for pro feature (higher tier)", () => {
    expect(isPlanAllowed("enterprise", "pro")).toBe(true);
  });
  it("pro user blocked from enterprise feature", () => {
    expect(isPlanAllowed("pro", "enterprise")).toBe(false);
  });
  it("unlimited matches enterprise level", () => {
    expect(isPlanAllowed("unlimited", "enterprise")).toBe(true);
  });
  it("unknown plan treated as free", () => {
    expect(isPlanAllowed("garbage", "starter")).toBe(false);
  });
});

describe("<PlanGate>", () => {
  it("renders children when user plan meets requirement", () => {
    useAuth.mockReturnValue({ user: { plan: "pro" } });
    render(withRouter(
      <PlanGate required="pro" feature="Test feature">
        <div>secret pro content</div>
      </PlanGate>
    ));
    expect(screen.getByText("secret pro content")).toBeInTheDocument();
    // No upgrade link should be visible
    expect(screen.queryByRole("link", { name: /upgrade/i })).not.toBeInTheDocument();
  });

  it("shows locked overlay + upgrade link for under-tier users", () => {
    useAuth.mockReturnValue({ user: { plan: "free" } });
    render(withRouter(
      <PlanGate required="pro" feature="Dark Web Monitor">
        <div>secret pro content</div>
      </PlanGate>
    ));
    expect(screen.getByText(/Pro Plan Required/i)).toBeInTheDocument();
    expect(screen.getByText(/Dark Web Monitor/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /upgrade/i });
    expect(link).toHaveAttribute("href", "/pricing");
  });

  it("treats missing user as free plan", () => {
    useAuth.mockReturnValue({ user: null });
    render(withRouter(
      <PlanGate required="starter">
        <div>gated</div>
      </PlanGate>
    ));
    expect(screen.getByText(/Starter Plan Required/i)).toBeInTheDocument();
  });
});
