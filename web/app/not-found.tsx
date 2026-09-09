import Link from "next/link";
export default function NotFound() {
  return (
    <main className="shell loading">
      <span className="eyebrow">Specimen not found</span>
      <h1 style={{ margin: "20px 0" }}>That profile is still a mystery.</h1>
      <p className="muted">Check the GitHub username and give it another go.</p>
      <Link className="button primary" style={{ marginTop: 24 }} href="/">
        Back to the lab
      </Link>
    </main>
  );
}
