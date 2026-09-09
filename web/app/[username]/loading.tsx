import Helix from "../../components/helix";
export default function Loading() {
  return (
    <main className="shell loading" role="status">
      <Helix />
      <h1>Sequencing your DNA…</h1>
      <p className="muted">
        Reading public repositories and finding your patterns.
      </p>
    </main>
  );
}
