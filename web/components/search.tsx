"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeUsername } from "../lib/username.js";
export default function Search() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
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
              "Enter a username or GitHub profile URL, for example github.com/octocat.",
            );
            return;
          }
          setError("");
          setPending(true);
          router.push(`/${encodeURIComponent(username)}`);
        }}
      >
        <input
          aria-label="GitHub username"
          aria-describedby="search-error"
          name="username"
          placeholder="Username or GitHub profile URL"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={200}
        />
        <button className="button primary" disabled={pending}>
          {pending ? "Sequencing…" : "Decode my DNA ↗"}
        </button>
      </form>
      <p id="search-error" role="status" className="caption">
        {error}
      </p>
    </>
  );
}
