"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SnapshotTrend } from "./queries";

export function TrendChart({ data }: { data: SnapshotTrend[] }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="tick" tick={{ fontSize: 11, fill: "var(--od-muted)" }}
            axisLine={{ stroke: "var(--od-border)" }} tickLine={{ stroke: "var(--od-border)" }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "var(--od-muted)" }}
            axisLine={{ stroke: "var(--od-border)" }} tickLine={{ stroke: "var(--od-border)" }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "var(--od-muted)" }}
            axisLine={{ stroke: "var(--od-border)" }} tickLine={{ stroke: "var(--od-border)" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "var(--od-bg)", borderColor: "var(--od-border)", borderRadius: 12, fontSize: 12, color: "var(--od-fg)" }}
            labelStyle={{ color: "var(--od-muted)", marginBottom: 4 }}
            labelFormatter={(label) => `Ciclo #${label}`}
          />
          <Line yAxisId="left" type="monotone" dataKey="alertas" name="Alertas" stroke="var(--od-amber)" strokeWidth={2} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="emFila" name="Em Fila" stroke="var(--od-red)" strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="economiaDia" name="Economia/Dia (R$)" stroke="var(--od-accent)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}