import Link from "next/link";

export default function HomePage() {
  return (
    <section className="page-card">
      <h1 className="page-header">Welcome back 👋</h1>
      <p>Continue your Armenian learning streak and hit your daily goal.</p>
      <div className="placeholder">
        <p>Home dashboard scaffold (Phase 0):</p>
        <ul>
          <li>Continue lesson CTA</li>
          <li>Daily goal card</li>
          <li>Streak + XP overview</li>
        </ul>
        <Link href="/learn" className="nav-link" style={{ display: "inline-block", marginTop: "0.75rem" }}>
          Go to Learn
        </Link>
      </div>
    </section>
  );
}
