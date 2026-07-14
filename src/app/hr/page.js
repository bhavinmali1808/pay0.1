"use client";
import { useState, useEffect, useContext } from "react";
import { TenantContext } from "../layout";

export default function HRPortal() {
  const { tenant } = useContext(TenantContext);
  const [employees, setEmployees] = useState([]);
  const [newEmp, setNewEmp] = useState({ name: "", email: "", department: "", basic: "" });
  const [analytics, setAnalytics] = useState(null);

  const [letterType, setLetterType] = useState("offerLetter");
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [loadingLetter, setLoadingLetter] = useState(false);

  const generateLetter = async (employeeId) => {
    setLoadingLetter(true);
    try {
      const res = await fetch("/api/hr/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": tenant },
        body: JSON.stringify({ employeeId, type: letterType })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedLetter(data.data.document);
      }
    } catch (err) {
      alert("Failed to generate letter");
    }
    setLoadingLetter(false);
  };

  const handleAddEmployee = async (e) => {
    setLoading(true);
    fetch("/api/hr/employees", {
      headers: { "x-tenant-id": tenant }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
        setLoading(false);
      });
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/hr/employees", {
      headers: { "x-tenant-id": tenant }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setEmployees(data.data);
        setLoading(false);
      });

    fetch("/api/reports/analytics", { headers: { "x-tenant-id": tenant } })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAnalytics(data.data.hr);
      });
  }, [tenant]);

  return (
    <div>
      <h2 style={{ marginBottom: "24px", fontSize: "28px" }}>HR Dashboard</h2>
      
      {analytics && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Active Headcount</h4>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-main)", marginTop: "8px" }}>{analytics.activeHeadcount}</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Goal Completion Rate</h4>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--accent)", marginTop: "8px" }}>{analytics.goalCompletionRate}%</div>
          </div>
          <div className="card" style={{ padding: "16px" }}>
            <h4 style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px" }}>Open Helpdesk Tickets</h4>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--danger)", marginTop: "8px" }}>0</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Employee Directory</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Showing data for {tenant === "tenant-acme-corp" ? "Acme Corp" : "Globex Inc"}</p>
        {loading ? <p style={{ color: "var(--text-muted)" }}>Loading employees...</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Basic Salary</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>No employees found in this tenant.</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id}>
                    <td>{emp.userId?.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{emp.userId?.email}</td>
                    <td>{emp.department}</td>
                    <td><span style={{ 
                      background: emp.status === "Active" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", 
                      color: emp.status === "Active" ? "var(--success)" : "var(--danger)", 
                      padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" 
                    }}>{emp.status}</span></td>
                    <td>₹{emp.salaryStructure?.basic}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Letter Generation Engine */}
        <div style={{ marginTop: "24px", padding: "16px", border: "1px solid var(--panel-border)", borderRadius: "8px", background: "var(--select-bg)" }}>
          <h4 style={{ margin: "0 0 12px 0", color: "var(--text-main)" }}>Letter Generation Engine</h4>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <select value={letterType} onChange={(e) => setLetterType(e.target.value)} style={{ padding: "8px", background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--panel-border)", borderRadius: "4px" }}>
              <option value="offerLetter">Offer Letter</option>
              <option value="incrementLetter">Increment Letter</option>
            </select>
            <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>Generate for top employee or select from table:</span>
            <button 
              onClick={() => generateLetter(employees[0]?._id)}
              disabled={!employees.length || loadingLetter}
              style={{ background: "var(--accent)" }}
            >
              {loadingLetter ? "Generating..." : "Generate Test Letter"}
            </button>
          </div>

          {generatedLetter && (
            <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg-color)", border: "1px solid var(--panel-border)", borderRadius: "4px", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "14px", color: "var(--text-main)" }}>
              {generatedLetter}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <h3>Onboard New Employee</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>Recruitment data integration goes here (Name, Email, Salary Structure, Benefits Eligibility).</p>
        <button style={{ background: "var(--danger)" }}>+ Add Employee to Tenant</button>
      </div>
    </div>
  );
}
