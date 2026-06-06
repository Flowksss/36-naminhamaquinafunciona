"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatusDist } from "./queries";

const COR: Record<string, string> = {
  EM_OPERACAO: "#00ff9d",
  NA_FILA: "#f5a623",
  EM_TRANSITO: "#4a9eff",
  OCIOSO: "#8a8f98",
  MANUTENCAO: "#ff4d4d",
};

export function StatusChart({ data }: { data: StatusDist[] }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--od-muted)" }}
            axisLine={{ stroke: "var(--od-border)" }} tickLine={{ stroke: "var(--od-border)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--od-muted)" }}
            axisLine={{ stroke: "var(--od-border)" }} tickLine={{ stroke: "var(--od-border)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--od-bg)", borderColor: "var(--od-border)", borderRadius: 12, fontSize: 12, color: "var(--od-fg)" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(v) => [`${v} ativos`, "Total"]}
          />
          <Bar dataKey="total" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.status} fill={COR[d.status] ?? "#8a8f98"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
