"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FluxoMensal } from "./queries";

const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

export function FluxoChart({ data }: { data: FluxoMensal[] }) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: 11, fill: "var(--od-muted)" }} 
            axisLine={{ stroke: "var(--od-border)" }}
            tickLine={{ stroke: "var(--od-border)" }}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: "var(--od-muted)" }} 
            tickFormatter={(v) => brl(Number(v))} 
            width={80}
            axisLine={{ stroke: "var(--od-border)" }}
            tickLine={{ stroke: "var(--od-border)" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--od-bg)", 
              borderColor: "var(--od-border)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "var(--od-fg)"
            }}
            itemStyle={{ color: "var(--od-fg)" }}
            formatter={(v) => brl(Number(v))} 
          />
          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
          <Bar dataKey="receita" name="Receita" fill="var(--od-accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesa" name="Despesa" fill="var(--od-red)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
