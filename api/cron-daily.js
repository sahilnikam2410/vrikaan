// Thin cron entry — daily scam alert email. Delegates to tools.js dispatcher.
import dispatcher from "./tools.js";

export default function handler(req, res) {
  req.query = { ...(req.query || {}), tool: "daily-alert" };
  return dispatcher(req, res);
}
