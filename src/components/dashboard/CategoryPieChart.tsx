"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

export default function CategoryPieChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              fontSize: "13px",
              padding: "12px 16px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs" style={{ color: "var(--fg-secondary)" }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
