import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return new NextResponse("Missing tenant ID", { status: 400 });

    const employees = await Employee.find({ tenantId, status: "Active" }).populate("userId");

    // CSV Header
    let csvContent = "Employee_ID,Name,Department,Location,Basic,HRA,Special_Allowance,Gross_Salary,PF_Deduction,PT_Deduction,Net_Pay\n";
    
    for (const emp of employees) {
      const empId = emp._id.toString();
      const name = emp.userId?.name || "Unknown";
      const dept = emp.department || "General";
      const loc = emp.workLocationState || "HQ";
      
      const basic = emp.salaryStructure?.basic || 0;
      const hra = emp.salaryStructure?.hra || 0;
      const special = emp.salaryStructure?.specialAllowance || 0;
      const gross = basic + hra + special;
      
      const pf = Math.round(Math.min(basic, 15000) * 0.12);
      const pt = gross > 15000 ? 200 : 0;
      
      const netPay = gross - (pf + pt);

      csvContent += `"${empId}","${name}","${dept}","${loc}",${basic},${hra},${special},${gross},${pf},${pt},${netPay}\n`;
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=Payroll_Register.csv"
      }
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}
