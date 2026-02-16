"use client";

import { useAppStore } from "@/features/lesson/store";

export function SettingsForm() {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="placeholder" style={{ display: "grid", gap: "0.75rem", maxWidth: 520 }}>
      <label>
        <input type="checkbox" checked={settings.transliteration} onChange={(event) => updateSettings({ transliteration: event.target.checked })} /> Transliteration
      </label>
      <label>
        <input type="checkbox" checked={settings.sound} onChange={(event) => updateSettings({ sound: event.target.checked })} /> Sound effects
      </label>
      <label>
        <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => updateSettings({ reducedMotion: event.target.checked })} /> Reduced motion
      </label>
      <label>
        Daily goal XP
        <input
          aria-label="Daily goal"
          className="text-input"
          type="number"
          min={10}
          max={200}
          value={settings.dailyGoal}
          onChange={(event) => updateSettings({ dailyGoal: Number(event.target.value) || 30 })}
        />
      </label>
    </div>
  );
}
