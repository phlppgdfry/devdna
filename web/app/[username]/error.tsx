"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell loading">
      <h1>The lab needs a moment.</h1>
      <p className="muted" style={{ margin: "20px 0" }}>
        GitHub could not supply this report. Its API may be busy or
        rate-limited. Please try again later.
      </p>
      <div className="actions" style={{ justifyContent: "center" }}>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
        <a className="button" href="/">
          Back to the lab
        </a>
      </div>
    </main>
  );
}
