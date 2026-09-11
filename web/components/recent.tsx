"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "./preferences";
import { normalizeUsername } from "../lib/username.js";
export function rememberProfile(username: string) {
  try {
    const raw = JSON.parse(localStorage.getItem("devdna-recent") || "[]");
    const list = Array.isArray(raw)
      ? raw.filter((x) => typeof x === "string" && normalizeUsername(x) === x)
      : [];
    localStorage.setItem(
      "devdna-recent",
      JSON.stringify(
        [
          username,
          ...list.filter((x) => x.toLowerCase() !== username.toLowerCase()),
        ].slice(0, 8),
      ),
    );
    return true;
  } catch {
    return false;
  }
}
export default function Recent() {
  const { t } = useLocale();
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("devdna-recent") || "[]");
      setUsers(
        Array.isArray(raw)
          ? raw
              .filter(
                (x) => typeof x === "string" && normalizeUsername(x) === x,
              )
              .slice(0, 8)
          : [],
      );
    } catch {}
  }, []);
  if (!users.length) return null;
  return (
    <section className="recent panel">
      <h2 className="section-heading">
        {t("Back to your discoveries", "Terug naar je ontdekkingen")}
      </h2>
      <div className="tags">
        {users.map((u) => (
          <Link className="pill" key={u} href={`/${u}`}>
            @{u} ↗
          </Link>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 14 }}>
        <span className="caption">
          {t(
            "Only stored in this browser. No account needed.",
            "Alleen opgeslagen in deze browser. Geen account nodig.",
          )}
        </span>
        <button
          className="button"
          onClick={() => {
            try {
              localStorage.removeItem("devdna-recent");
              setUsers([]);
            } catch {
              setError(true);
            }
          }}
        >
          {t("Clear history", "Geschiedenis wissen")}
        </button>
      </div>
      {error && (
        <p role="status">
          {t(
            "Browser storage is unavailable.",
            "Browseropslag is niet beschikbaar.",
          )}
        </p>
      )}
    </section>
  );
}
