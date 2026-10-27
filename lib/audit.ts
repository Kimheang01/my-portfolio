import "server-only";

/**
 * Records a change made in the admin as one line in the server log (on
 * Vercel: the project's Logs), e.g.
 * {"event":"admin_change","action":"project.save","id":5,"status":"published"}.
 * Only what changed and its id: never form contents, emails or secrets.
 */
export function logAdminChange(action: string, details: Record<string, string | number | null> = {}) {
  console.info(JSON.stringify({ event: "admin_change", action, ...details, at: new Date().toISOString() }));
}
