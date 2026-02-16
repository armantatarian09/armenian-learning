import { ProfileStats } from "@/components/profile-stats";

export default function ProfilePage() {
  return (
    <section className="page-card">
      <h1 className="page-header">Profile</h1>
      <ProfileStats />
    </section>
  );
}
