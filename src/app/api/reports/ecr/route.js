import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
// In a real scenario, this would pull from the finalized Payroll table, but we'll use Employee & PayrollInput for mock generation.

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return new NextResponse("Missing tenant ID", { status: 400 });

    const employees = await Employee.find({ tenantId, status: "Active" }).populate("userId");

    // ECR Format: UAN#MemberName#GrossWages#EPFWages#EPSWages#EDLIWages#EPFContribution#EPSContribution#EPFEPSDiff#NCPDays#Refunds
    let ecrContent = "";
    
    for (const emp of employees) {
      const uan = emp.kyc?.uan || "000000000000";
      const name = emp.userId?.name || "Unknown";
      
      const baseSalary = emp.salaryStructure?.basic || 0;
      const hra = emp.salaryStructure?.hra || 0;
      const special = emp.salaryStructure?.specialAllowance || 0;
      const grossWages = baseSalary + hra + special;
      
      const epfWages = Math.min(baseSalary, 15000);
      const epsWages = epfWages; // Usually same as EPF wages capped at 15000
      const edliWages = epfWages;
      
      const epfContribution = Math.round(epfWages * 0.12);
      const epsContribution = Math.round(epsWages * 0.0833);
      const epfEpsDiff = epfContribution - epsContribution;
      
      const ncpDays = 0; // Non-contributory days (LOP)
      const refunds = 0;

      ecrContent += `${uan}#${name}#${grossWages}#${epfWages}#${epsWages}#${edliWages}#${epfContribution}#${epsContribution}#${epfEpsDiff}#${ncpDays}#${refunds}\n`;
    }

    return new NextResponse(ecrContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": "attachment; filename=ECR_Report.txt"
      }
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
}
