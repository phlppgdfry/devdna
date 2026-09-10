"use client";
import { useState } from "react";
import type { DNAData } from "../lib/github";
import { createShareCard } from "../lib/share-card.js";
export default function ReportActions({
  username,
  report,
}: {
  username: string;
  report: DNAData;
}) {
  const [status, setStatus] = useState("");
  async function copy(markdown = false) {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(
        markdown ? `[🧬 Explore ${username}'s DevDNA](${url})` : url,
      );
      setStatus(markdown ? "README snippet copied." : "Profile link copied.");
    } catch {
      setStatus(
        "Clipboard unavailable. Copy the profile URL from your address bar.",
      );
    }
  }
  function download(card = false) {
    const url = URL.createObjectURL(
      new Blob(
        [card ? createShareCard(report) : JSON.stringify(report, null, 2)],
        { type: card ? "image/svg+xml" : "application/json" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `devdna-${username}.${card ? "svg" : "json"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      card
        ? "DNA card downloaded. Add it to your portfolio or README."
        : "JSON report downloaded.",
    );
  }
  return (
    <div>
      <div className="actions">
        <button className="button primary" onClick={() => copy()}>
          ↗ Share my DNA
        </button>
        <button className="button" onClick={() => copy(true)}>
          ⌘ README snippet
        </button>
        <button className="button" onClick={() => download(true)}>
          ◈ Download DNA card
        </button>
        <button className="button" onClick={() => download()}>
          ↓ JSON
        </button>
        <button className="button" onClick={() => window.print()}>
          Print / PDF
        </button>
      </div>
      <p className="status" role="status">
        {status}
      </p>
    </div>
  );
}
