"use client";
import { useState, useEffect, useContext } from "react";
import { TenantContext } from "../layout";

export default function EmployeePortal() {
  const { tenant } = useContext(TenantContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [declarationAmount, setDeclarationAmount] = useState("");
  const [declarationSuccess, setDeclarationSuccess] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  useEffect(() => {
    fetch("/api/hr/employees", {
      headers: { "x-tenant-id": tenant }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setEmployees(data.data);
          setSelectedEmp(data.data[0]._id);
        } else {
          setEmployees([]);
          setSelectedEmp("");
        }
      });
  }, [tenant]);

  const handleDeclarationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !declarationAmount) return;

    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenant
        },
        body: JSON.stringify({
          employeeId: selectedEmp,
          type: "TaxDeclaration",
          amount: parseFloat(declarationAmount),
          description: "Section 80C Investment Proofs",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          submittedBy: "64b0f94d0c9f131a441e411b" // Mock Admin ID
        })
      });
      const data = await res.json();
      if (data.success) {
        setDeclarationSuccess(true);
        setDeclarationAmount("");
        setTimeout(() => setDeclarationSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to submit declaration");
    }
  };

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Travel");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseSuccess, setExpenseSuccess] = useState(false);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !expenseAmount || !expenseDesc) return;

    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenant
        },
        body: JSON.stringify({
          employeeId: selectedEmp,
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDesc,
          proofUrl: "mock_receipt.pdf"
        })
      });
      const data = await res.json();
      if (data.success) {
        setExpenseSuccess(true);
        setExpenseAmount("");
        setExpenseDesc("");
        setTimeout(() => setExpenseSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to submit expense claim");
    }
  };

  const generatePayslip = async () => {
    if (!selectedEmp) return;
    setLoadingPayslip(true);
    try {
      const res = await fetch("/api/payroll/calculate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-tenant-id": tenant
        },
        body: JSON.stringify({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        })
      });
      const data = await res.json();
      if (data.success) {
        const empPayslip = data.data.find(r => r.employeeId === selectedEmp);
        setPayslip(empPayslip || null);
      }
    } catch (err) {
      alert("Failed to retrieve payslip");
    }
    setLoadingPayslip(false);
  };

  const [ticketCategory, setTicketCategory] = useState("Payroll Query");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !ticketTitle || !ticketDesc) return;

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": tenant },
        body: JSON.stringify({
          employeeId: selectedEmp,
          category: ticketCategory,
          title: ticketTitle,
          description: ticketDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess(true);
        setTicketTitle("");
        setTicketDesc("");
        setTimeout(() => setTicketSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to submit ticket");
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "24px", fontSize: "28px" }}>Employee Self-Service</h2>
      
      <div style={{ marginBottom: "24px" }}>
        <label style={{ fontWeight: "600", marginRight: "12px", color: "var(--text-muted)", fontSize: "14px" }}>Select Employee Profile:</label>
        {employees.length > 0 ? (
          <select 
            value={selectedEmp} 
            onChange={(e) => { setSelectedEmp(e.target.value); setPayslip(null); }}
          >
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>{emp.userId?.name} ({emp.department})</option>
            ))}
          </select>
        ) : (
          <span style={{ color: "var(--warning)", fontSize: "14px" }}>No employees available in this tenant.</span>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        
        <div className="card">
          <h3>One Time Tax Declaration</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "10px", marginBottom: "16px" }}>Submit your annual investment declarations (e.g. Section 80C, 80D) to optimize your monthly TDS.</p>
          <form onSubmit={handleDeclarationSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Investment Amount (₹):</label>
              <input 
                type="number" 
                value={declarationAmount} 
                onChange={(e) => setDeclarationAmount(e.target.value)}
                placeholder="e.g. 150000"
                style={{ width: "100%", boxSizing: "border-box", marginBottom: "12px" }}
                required
              />
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Attach Proof (PDF/Image):</label>
              <input 
                type="file" 
                accept=".pdf, .png, .jpg, .jpeg"
                style={{ width: "100%", boxSizing: "border-box", padding: "6px 12px" }}
                required
              />
            </div>
            <button type="submit" style={{ background: "var(--warning)", color: "#000" }}>Submit Proofs</button>
            {declarationSuccess && <p style={{ color: "var(--success)", marginTop: "12px", fontSize: "14px" }}>✓ Proofs submitted successfully!</p>}
          </form>
        </div>

        <div className="card">
          <h3>File Expense Claim</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "10px", marginBottom: "16px" }}>Submit out-of-pocket expenses for manager approval and automated payroll reimbursement.</p>
          <form onSubmit={handleExpenseSubmit}>
            <div style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Amount (₹):</label>
                <input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Category:</label>
                <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-main)" }}>
                  <option>Travel</option><option>Food</option><option>Fuel</option><option>Office Supplies</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Description:</label>
              <input type="text" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} placeholder="e.g. Client lunch" required />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Attach Receipt:</label>
              <input type="file" required style={{ width: "100%", boxSizing: "border-box", padding: "6px" }} />
            </div>
            <button type="submit" style={{ background: "var(--btn-secondary)", color: "var(--text-main)", border: "1px solid var(--panel-border)" }}>Submit Claim</button>
            {expenseSuccess && <p style={{ color: "var(--success)", marginTop: "12px", fontSize: "14px" }}>✓ Claim submitted for approval!</p>}
          </form>
        </div>

      </div>

      <div className="card" style={{ marginTop: "24px", borderTop: "4px solid var(--success)" }}>
        <h3>My Payslips</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>View and inspect your compliance payslip containing PF, ESI, and Tax breakdowns.</p>
        <button onClick={generatePayslip} style={{ background: "var(--success)" }}>
          {loadingPayslip ? "Generating..." : "View Current Payslip"}
        </button>

        {payslip && (
          <div style={{ border: "1px solid var(--panel-border)", borderRadius: "12px", padding: "24px", marginTop: "24px", background: "var(--select-bg)" }}>
            <h4 style={{ margin: "0 0 16px 0", borderBottom: "1px solid var(--panel-border)", paddingBottom: "12px", textAlign: "center", color: "var(--text-main)" }}>
              PAYSLIP - {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <h5 style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Earnings</h5>
                <table style={{ width: "100%", marginTop: 0 }}>
                  <tbody>
                    <tr><td style={{ padding: "8px 0" }}>Gross Salary:</td><td style={{ textAlign: "right", padding: "8px 0" }}>₹{payslip.grossPay}</td></tr>
                    <tr><td style={{ padding: "8px 0" }}>Additions:</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--success)" }}>+₹{payslip.totalAdditions}</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h5 style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Deductions</h5>
                <table style={{ width: "100%", marginTop: 0 }}>
                  <tbody>
                    <tr><td style={{ padding: "8px 0" }}>PF (12%):</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--warning)" }}>-₹{payslip.pf}</td></tr>
                    <tr><td style={{ padding: "8px 0" }}>ESI (0.75%):</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--warning)" }}>-₹{payslip.esi}</td></tr>
                    <tr><td style={{ padding: "8px 0" }}>PT:</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--warning)" }}>-₹{payslip.pt}</td></tr>
                    <tr><td style={{ padding: "8px 0" }}>TDS (Tax):</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--warning)" }}>-₹{payslip.tds}</td></tr>
                    <tr><td style={{ padding: "8px 0", borderBottom: "none" }}>Other Ded.:</td><td style={{ textAlign: "right", padding: "8px 0", color: "var(--danger)", borderBottom: "none" }}>-₹{payslip.totalDeductions}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--panel-border)", marginTop: "24px", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>Net Pay (Take-home)</span>
              <strong style={{ fontSize: "24px", color: "var(--success)" }}>₹{payslip.netPay}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "24px", borderTop: "4px solid var(--accent)" }}>
        <h3>My Goals (OKRs)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>Track your continuous performance objectives for this quarter.</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div style={{ padding: "16px", border: "1px solid var(--panel-border)", borderRadius: "8px", background: "var(--select-bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <strong style={{ fontSize: "16px", color: "var(--text-main)" }}>Reduce Cloud Infrastructure Costs</strong>
              <span style={{ fontSize: "12px", background: "rgba(16, 185, 129, 0.2)", color: "var(--success)", padding: "4px 8px", borderRadius: "12px" }}>On Track</span>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px" }}>Quarter: Q3 2026</p>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", color: "var(--text-muted)" }}>
                <span>Progress</span>
                <span>65%</span>
              </div>
              <div style={{ width: "100%", background: "var(--panel-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: "65%", background: "var(--accent)", height: "100%" }}></div>
              </div>
            </div>
            <ul style={{ fontSize: "13px", color: "var(--text-muted)", paddingLeft: "20px" }}>
              <li>Audit AWS S3 buckets (Done)</li>
              <li>Migrate staging env to spot instances (In Progress)</li>
            </ul>
          </div>
          
          <div style={{ padding: "16px", border: "1px dashed var(--panel-border)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <span style={{ color: "var(--accent)", fontWeight: "600" }}>+ Create New Goal</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px", borderTop: "4px solid var(--danger)" }}>
        <h3>HR Helpdesk</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "10px", marginBottom: "16px" }}>Raise queries regarding your payslip, attendance, or IT issues.</p>
        
        <form onSubmit={handleTicketSubmit} style={{ maxWidth: "600px" }}>
          <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Category:</label>
              <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-main)" }}>
                <option>Payroll Query</option><option>Leave/Attendance</option><option>IT Request</option><option>Grievance</option>
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Subject / Title:</label>
              <input type="text" value={ticketTitle} onChange={(e) => setTicketTitle(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} placeholder="Brief issue title" required />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "14px" }}>Description:</label>
            <textarea value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--panel-border)", color: "var(--text-main)", minHeight: "100px" }} placeholder="Describe your issue in detail..." required />
          </div>
          <button type="submit" style={{ background: "var(--danger)" }}>Submit Ticket</button>
          {ticketSuccess && <span style={{ color: "var(--success)", marginLeft: "16px", fontSize: "14px" }}>✓ Ticket raised successfully. HR will contact you.</span>}
        </form>
      </div>
    </div>
  );
}
