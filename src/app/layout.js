"use client";
import "./globals.css";
import { createContext, useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const TenantContext = createContext();

export default function RootLayout({ children }) {
  const [tenant, setTenant] = useState("tenant-acme-corp");
  const [theme, setTheme] = useState("dark"); // 'light' or 'dark'
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <html lang="en" data-theme={theme}>
      <body>
        <TenantContext.Provider value={{ tenant, setTenant }}>
          <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
              <div className="sidebar-brand">
                PayrollHub
              </div>
              <nav className="sidebar-nav">
                <Link href="/" className={pathname === "/" ? "active" : ""}>Overview</Link>
                <Link href="/hr" className={pathname === "/hr" ? "active" : ""}>HR Portal</Link>
                <Link href="/finance" className={pathname === "/finance" ? "active" : ""}>Finance</Link>
                <Link href="/employee" className={pathname === "/employee" ? "active" : ""}>Self-Service</Link>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
              {/* Topbar with Tenant Switcher */}
              <header className="topbar">
                <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  System Architecture: <strong style={{ color: "var(--text-main)" }}>Multi-Tenant Mode</strong>
                </div>
                <div className="tenant-switcher">
                  <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Active Tenant:</span>
                  <select value={tenant} onChange={(e) => setTenant(e.target.value)}>
                    <option value="tenant-acme-corp">Acme Corp (Global)</option>
                    <option value="tenant-globex-inc">Globex Inc (Europe)</option>
                  </select>
                  <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                </div>
              </header>

              {/* Page Content */}
              <div className="page-content">
                {children}
              </div>
            </main>
          </div>
        </TenantContext.Provider>
      </body>
    </html>
  );
}
