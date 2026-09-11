"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./preferences";
import { normalizeUsername } from "../lib/username.js";
export default function Search() {
  const router = useRouter();
  const { t } = useLocale();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return (
    <>
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          const username = normalizeUsername(
            new FormData(event.currentTarget).get("username"),
          );
          if (!username) {
            setError(
              t(
                "Enter a username or GitHub profile URL, for example github.com/octocat.",
                "Vul een gebruikersnaam of GitHub-profiel-URL in, bijvoorbeeld github.com/octocat.",
              ),
            );
            return;
          }
          setError("");
          startTransition(() =>
            router.push(`/${encodeURIComponent(username)}`),
          );
        }}
      >
        <input
          aria-label={t("GitHub username", "GitHub-gebruikersnaam")}
          aria-describedby="search-error"
          name="username"
          placeholder={t(
            "Username or GitHub profile URL",
            "Gebruikersnaam of GitHub-profiel-URL",
          )}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={200}
        />
        <button className="button primary" disabled={pending}>
          {pending
            ? t("Sequencing…", "DNA ontleden…")
            : t("Decode my DNA ↗", "Ontdek mijn DNA ↗")}
        </button>
      </form>
      <p id="search-error" role="status" className="caption">
        {error}
      </p>
    </>
  );
}
