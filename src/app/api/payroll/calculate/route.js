import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import PayrollInput from "@/models/PayrollInput";

export async function POST(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ success: false, error: "Month and year are required" }, { status: 400 });
    }

    // 1. Get all active employees for THIS specific tenant
    const employees = await Employee.find({ tenantId, status: { $ne: "Terminated" } }).populate("userId");
    
    // 2. Calculate payroll for each employee
    const payrollResults = await Promise.all(employees.map(async (emp) => {
      // Base Data
      const baseSalary = emp.salaryStructure.basic || 0;
      
      // Attendance & LOP (Loss of Pay) Logic
      const attendance = await Attendance.find({ 
        tenantId, employeeId: emp._id, 
        month: month, year: year 
      });
      // In a real system, calculate accurate LOP days from Attendance/Leave
      const daysPresent = attendance.length || 30; // Mock: Assume full month if no data
      const totalDaysInMonth = 30;
      const grossPay = Math.round((baseSalary / totalDaysInMonth) * daysPresent);

      // Additions & Deductions
      const empInputs = await PayrollInput.find({ tenantId, employeeId: emp._id, month, year });
      let totalAdditions = 0;
      let otherDeductions = 0;
      let declaredInvestments = 0;
      
      empInputs.forEach(input => {
        if (["AdHocPayment", "Arrears"].includes(input.type)) totalAdditions += input.amount;
        if (["Deduction", "VendorDeduction"].includes(input.type)) otherDeductions += input.amount;
        if (input.type === "TaxDeclaration") declaredInvestments += input.amount;
      });

      // Statutory Compliance: PF (12% of Basic, max ceiling 15,000)
      const pfWageCeiling = Math.min(baseSalary, 15000);
      const pf = Math.round(pfWageCeiling * 0.12);

      // Statutory Compliance: ESI (0.75% of Gross, applicable only if Gross <= 21,000)
      const esi = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0;

      // Statutory Compliance: Professional Tax (PT)
      let pt = 0;
      const state = emp.workLocationState || "Karnataka";
      if (state === "Karnataka") {
        if (grossPay > 15000) pt = 200;
      } else if (state === "Maharashtra") {
        if (grossPay > 10000) {
           pt = (month === 2) ? 300 : 200;
        }
      }

      // TDS (Tax)
      const annualGross = baseSalary * 12;
      const taxableIncome = Math.max(0, annualGross - declaredInvestments);
      
      let annualTax = 0;
      if (taxableIncome > 1000000) {
        annualTax += (taxableIncome - 1000000) * 0.30 + 100000 * 0.20 + 250000 * 0.05;
      } else if (taxableIncome > 500000) {
        annualTax += (taxableIncome - 500000) * 0.20 + 250000 * 0.05;
      } else if (taxableIncome > 250000) {
        annualTax += (taxableIncome - 250000) * 0.05;
      }
      
      const tds = Math.round(annualTax / 12);

      // Final Calculation
      const totalDeductions = otherDeductions + pf + esi + pt + tds;
      const netPay = (grossPay + totalAdditions) - totalDeductions;

      return {
        employeeId: emp._id,
        name: emp.userId.name,
        baseSalary,
        grossPay,
        daysPresent,
        totalAdditions,
        totalDeductions,
        pf,
        esi,
        pt,
        tds,
        netPay
      };
    }));

    return NextResponse.json({ success: true, data: payrollResults });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
