/**
 * Plan tier comparison.
 *
 * Lives apart from PlanGate.jsx so that file exports only its component — a
 * module mixing a component with plain functions breaks Fast Refresh.
 *
 * Mirrors TIER_LEVEL in api/_auth.js. Drift between the two shows up as a UI
 * that offers something the server then refuses, so keep them in step.
 */
const PLAN_LEVELS = { free: 0, starter: 1, pro: 2, enterprise: 3, unlimited: 3 };

export function isPlanAllowed(userPlan, requiredPlan) {
  return (PLAN_LEVELS[userPlan] || 0) >= (PLAN_LEVELS[requiredPlan] || 0);
}
