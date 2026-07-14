"use client";

import Link from "next/link";
import { useContext } from "react";
import { TenantContext } from "./layout";

export default function Home() {
  const { tenant } = useContext(TenantContext);
  const companyName = tenant === "tenant-acme-corp" ? "Acme Corp" : "Globex Inc";

  return (
    <div>
      <h1 style={{ marginBottom: "10px", fontSize: "32px" }}>Welcome to {companyName}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "40px", fontSize: "18px" }}>Your centralized payroll and compliance management engine.</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        
        <div className="card" style={{ borderTop: "4px solid var(--danger)" }}>
          <h3>HR Team</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "10px", marginBottom: "20px", lineHeight: "1.6" }}>
            Manage recruitment data, new hires, salary structures, and compensation benefits for {companyName}.
          </p>
          <Link href="/hr"><button style={{ background: "var(--danger)" }}>Launch Portal</button></Link>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--accent)" }}>
          <h3>Finance Team</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "10px", marginBottom: "20px", lineHeight: "1.6" }}>
            Process ad-hoc payments, deductions, expense claims, and finalize payroll runs globally.
          </p>
          <Link href="/finance"><button>Launch Portal</button></Link>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--warning)" }}>
          <h3>Employees</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "10px", marginBottom: "20px", lineHeight: "1.6" }}>
            Submit income tax declarations, expense proofs, and view compliant payslips instantly.
          </p>
          <Link href="/employee"><button style={{ background: "var(--warning)" }}>Launch Portal</button></Link>
        </div>

      </div>
    </div>
  );
}
