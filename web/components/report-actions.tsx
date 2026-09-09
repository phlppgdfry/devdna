"use client";
import { useState } from "react";
export default function ReportActions({
  username,
  report,
}: {
  username: string;
  report: unknown;
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
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `devdna-${username}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("JSON report downloaded.");
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
        <button className="button" onClick={download}>
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
