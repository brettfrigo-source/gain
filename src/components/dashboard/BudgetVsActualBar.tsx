"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  budgeted: number;
  actual: number;
}

export default function BudgetVsActualBar({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }} barGap={2}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#a1a1a6" }}
            angle={-35}
            textAnchor="end"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#a1a1a6" }}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              fontSize: "13px",
              padding: "12px 16px",
            }}
            cursor={{ fill: "rgba(0,0,0,0.02)" }}
          />
          <Bar dataKey="budgeted" fill="#e8e8ed" radius={[6, 6, 6, 6]} />
          <Bar dataKey="actual" fill="#1d1d1f" radius={[6, 6, 6, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
