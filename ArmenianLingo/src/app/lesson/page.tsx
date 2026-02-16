import Link from "next/link";

export default function LessonIndexPage() {
  return (
    <section className="page-card">
      <h1 className="page-header">Lesson</h1>
      <p>Open an available lesson from Learn.</p>
      <Link className="primary-btn" href="/learn">Go to Learn</Link>
    </section>
  );
}
