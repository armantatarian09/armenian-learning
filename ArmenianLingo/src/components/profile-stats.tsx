"use client";

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", xp: 10 },
  { day: "Tue", xp: 20 },
  { day: "Wed", xp: 35 },
  { day: "Thu", xp: 50 },
  { day: "Fri", xp: 70 }
];

export function ProfileStats() {
  return (
    <div className="placeholder" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="xp" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
