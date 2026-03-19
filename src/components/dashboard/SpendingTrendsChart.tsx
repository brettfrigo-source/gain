"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  income: number;
  expenses: number;
}

export default function SpendingTrendsChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34c759" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#34c759" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3b30" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#ff3b30" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#a1a1a6" }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#a1a1a6" }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? "k" : ""}`}
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
            cursor={{ stroke: "#e8e8ed" }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#34c759"
            strokeWidth={2}
            fill="url(#gIncome)"
            dot={false}
            activeDot={{ r: 4, fill: "#34c759", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ff3b30"
            strokeWidth={2}
            fill="url(#gExpenses)"
            dot={false}
            activeDot={{ r: 4, fill: "#ff3b30", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
