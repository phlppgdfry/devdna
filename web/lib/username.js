/** Accept a username, @handle, or a GitHub profile URL. */
export function normalizeUsername(value) {
  let username = String(value || "").trim();
  if (/^(?:https?:\/\/)?(?:www\.)?github\.com\//i.test(username)) {
    try {
      const url = new URL(
        /^https?:\/\//i.test(username) ? username : `https://${username}`,
      );
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length !== 1) return null;
      username = parts[0];
    } catch {
      return null;
    }
  }
  username = username.replace(/^@/, "");
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) &&
    !username.includes("--")
    ? username
    : null;
}
