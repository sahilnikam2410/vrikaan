/**
 * Inbox routing and founder contact data.
 *
 * Split out of EmailRouting.jsx so that file exports only its component —
 * a module mixing a component with plain data breaks Fast Refresh.
 */

import { T } from "../components/ui/tokens";

export const INBOXES = [
  {
    key: "careers",
    tag: "Careers · Internships",
    color: T.cyan,
    icon: "💼",
    email: "careers@vrikaan.com",
    body: "Job + internship applications, take-home submissions, interview logistics.",
    subject: "Careers — ",
  },
  {
    key: "hr",
    tag: "HR · People Ops",
    color: "#06b6d4",
    icon: "🧑‍💼",
    email: "hr@vrikaan.com",
    body: "Payroll, onboarding, employee/intern HR queries, policy questions.",
    subject: "HR — ",
  },
  {
    key: "ai",
    tag: "AI · Product · Dev",
    color: T.accent,
    icon: "🤖",
    email: "ai@vrikaan.com",
    body: "AI/ML feedback, bug reports, feature requests, API integration questions, partnership pitches around the AI stack.",
    subject: "AI / Product — ",
  },
  {
    key: "general",
    tag: "General · Press · Support",
    color: T.green,
    icon: "✉️",
    email: "hello@vrikaan.com",
    body: "Customer support, press & media, general enquiries, brand & partnership requests outside AI/dev.",
    subject: "Hello — ",
  },
];

// Founder direct emails — surface on /founder, /about, internal pages only.
export const FOUNDERS = [
  { name: "Sahil Anil Nikam", role: "Founder & CEO", email: "founder@vrikaan.com" },
  { name: "Khushi Raygade",   role: "Co-founder & CTO", email: "cofounder@vrikaan.com" },
];
