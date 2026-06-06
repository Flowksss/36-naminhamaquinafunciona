import Link from "next/link";
import {
  LayoutDashboard,
  MapPin,
  DollarSign,
  Radar,
} from "lucide-react";

const navItems = [
  { href: "/operacao", label: "Centro de Operações", icon: Radar },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fazendas", label: "Unidades", icon: MapPin },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">AgroERP</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gestão do Agronegócio</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
