"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Radar,
  Map as MapIcon,
} from "lucide-react";
import { ShaderBackground } from "@/components/shader-background";
import { FarmSwitcher } from "@/components/farm-switcher";

const navItems = [
  { href: "/operacao", label: "Centro de Operações", icon: Radar },
  { href: "/mapa", label: "Mapa GPS", icon: MapIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fazendas", label: "Unidades", icon: MapPin },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="od-console">
      <ShaderBackground />
      <FarmSwitcher />
      <div className="od-shell">
        {/* NAV RAIL */}
        <aside className="od-rail">
          <div className="od-logo">CS</div>
          <nav className="od-nav">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`od-navitem ${active ? "od-active" : ""}`}
                  data-label={label}
                >
                  <Icon size={22} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="od-main">
          {children}
        </main>
      </div>
    </div>
  );
}
