"use client";
import { useState, useContext, useEffect } from "react";
import { TenantContext } from "../layout";

export default function FinancePortal() {
  const { tenant } = useContext(TenantContext);
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch("/api/reports/analytics", { headers: { "x-tenant-id": tenant } })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data.data.finance);
      });
  }, [tenant]);

  const runPayroll = async () => {
    setCalculating(true);
    setResults(null);
    try {
      const res = await fetch("/api/payroll/calculate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenant
        },
        body: JSON.stringify({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Failed to run payroll");
    }
    setCalculating(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: "24px", fontSize: "28px" }}>Finance & Payroll</h2>

      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Projected Gross Payroll</h4>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-main)", marginTop: "8px" }}>₹{analytics.totalGross.toLocaleString("en-IN")}</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Statutory PF Liability</h4>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--warning)", marginTop: "8px" }}>₹{analytics.totalPFLiability.toLocaleString("en-IN")}</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Professional Tax (PT)</h4>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--warning)", marginTop: "8px" }}>₹{analytics.totalPT.toLocaleString("en-IN")}</div>
          </div>
        </div>
      )}

      <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
        Currently managing payroll for: <strong style={{ color: "var(--text-main)" }}>{tenant === "tenant-acme-corp" ? "Acme Corp" : "Globex Inc"}</strong>
      </p>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div className="card">
          <h3>Ad-Hoc Payments & Deductions</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>Log one-time data like loss of laptop, arrears, or vendor canteen deductions.</p>
          <button style={{ background: "var(--btn-secondary)", color: "var(--text-main)", border: "1px solid var(--panel-border)" }}>Log New Deduction</button>
        </div>

        <div className="card" style={{ borderTop: "4px solid var(--accent)" }}>
          <h3>Run Monthly Payroll</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>Aggregate HR, Attendance, and Finance data to generate final settlement.</p>
          <button onClick={runPayroll} disabled={calculating}>
            {calculating ? "Calculating Engine..." : "Run Payroll Engine"}
          </button>
        </div>
      </div>

      {results && (
        <div className="card" style={{ marginTop: "24px" }}>
          <h3>Payroll Run Results (Current Month)</h3>
          {results.length === 0 ? (
            <p style={{ color: "var(--text-muted)", marginTop: "10px" }}>No active employees found for this tenant.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Days Present</th>
                  <th>Base Salary</th>
                  <th>Additions</th>
                  <th>Deductions</th>
                  <th>PF (12%)</th>
                  <th>ESI (0.75%)</th>
                  <th>PT</th>
                  <th>TDS (Tax)</th>
                  <th>Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ color: "var(--text-muted)" }}>{r.daysPresent}</td>
                    <td>₹{r.baseSalary}</td>
                    <td style={{ color: "var(--success)" }}>+₹{r.totalAdditions}</td>
                    <td style={{ color: "var(--danger)" }}>-₹{r.totalDeductions}</td>
                    <td style={{ color: "var(--warning)" }}>-₹{r.pf}</td>
                    <td style={{ color: "var(--warning)" }}>-₹{r.esi}</td>
                    <td style={{ color: "var(--warning)" }}>-₹{r.pt}</td>
                    <td style={{ color: "var(--warning)" }}>-₹{r.tds}</td>
                    <td style={{ fontSize: "16px", color: "var(--success)" }}><strong>₹{r.netPay}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: "24px", borderTop: "4px solid var(--warning)" }}>
        <h3>Statutory Reports & Integrations</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>Generate compliance reports and export data for Tally/Zoho accounting systems.</p>
        
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={() => window.open(`/api/reports/ecr`, '_blank')} style={{ background: "var(--warning)", color: "#000" }}>
            ↓ Download PF ECR (Text)
          </button>
          <button onClick={() => window.open(`/api/reports/register`, '_blank')} style={{ background: "var(--accent)" }}>
            ↓ Export Payroll Register (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
