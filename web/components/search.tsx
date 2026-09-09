"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
          const username = String(
            new FormData(event.currentTarget).get("username") || "",
          )
            .trim()
            .replace(/^@/, "");
          if (
            !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username) ||
            username.includes("--")
          ) {
            setError("Enter a GitHub username, for example octocat.");
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
          placeholder="Your GitHub username"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={40}
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
