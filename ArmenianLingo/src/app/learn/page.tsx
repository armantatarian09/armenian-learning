import Link from "next/link";
import { units } from "@/content/curriculum";

export default function LearnPage() {
  return (
    <section className="page-card">
      <h1 className="page-header">Learn</h1>
      {units.map((unit) => (
        <article key={unit.id} className="placeholder" style={{ marginBottom: "1rem" }}>
          <h2>{unit.title}</h2>
          <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {unit.lessons.map((lesson) => (
              lesson.available ? (
                <Link key={lesson.id} className="choice" href={`/lesson/${lesson.id}`}>
                  {lesson.title}
                </Link>
              ) : (
                <div key={lesson.id} className="choice" aria-disabled="true" style={{ opacity: 0.55 }}>
                  🔒 {lesson.title}
                </div>
              )
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
