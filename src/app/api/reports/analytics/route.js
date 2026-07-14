import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import Goal from "@/models/Goal";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const employees = await Employee.find({ tenantId });
    const goals = await Goal.find({ tenantId });

    // HR Metrics
    const activeHeadcount = employees.filter(e => e.status === "Active").length;
    const departments = {};
    employees.forEach(e => {
      if (e.status === "Active") {
        departments[e.department] = (departments[e.department] || 0) + 1;
      }
    });

    const completedGoals = goals.filter(g => g.progress === 100).length;
    const totalGoals = goals.length;
    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Finance Metrics (Projected Monthly)
    let totalGross = 0;
    let totalPFLiability = 0; // Employer + Employee
    let totalPT = 0;

    employees.forEach(e => {
      if (e.status === "Active") {
        const basic = e.salaryStructure?.basic || 0;
        const gross = basic + (e.salaryStructure?.hra || 0) + (e.salaryStructure?.specialAllowance || 0);
        
        totalGross += gross;
        
        const pf = Math.round(Math.min(basic, 15000) * 0.12);
        totalPFLiability += (pf * 2); // Assuming matching employer contribution

        if (gross > 15000) totalPT += 200;
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        hr: { activeHeadcount, departments, goalCompletionRate },
        finance: { totalGross, totalPFLiability, totalPT }
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
