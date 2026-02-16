import { HomeDashboard } from "@/components/home-dashboard";

export default function HomePage() {
  return (
    <section className="page-card">
      <h1 className="page-header">Welcome back 👋</h1>
      <p>Continue your Armenian learning streak and hit your daily goal.</p>
      <HomeDashboard />
    </section>
  );
}
