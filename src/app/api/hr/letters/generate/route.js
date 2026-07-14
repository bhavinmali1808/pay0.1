import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

const templates = {
  offerLetter: `
    Dear {{name}},
    
    We are thrilled to offer you the position of {{designation}} in the {{department}} department at our company.
    
    Your starting gross annual compensation will be ₹{{annualSalary}}. You will report to the company headquarters in {{location}}.
    
    Please review the attached terms and reply with your acceptance.
    
    Warm Regards,
    Human Resources
  `,
  incrementLetter: `
    Dear {{name}},
    
    In recognition of your outstanding performance, we are pleased to inform you that your annual compensation has been revised to ₹{{annualSalary}}, effective immediately.
    
    Thank you for your continued dedication to the {{department}} team!
    
    Warm Regards,
    Human Resources
  `
};

export async function POST(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    const { employeeId, type } = body;

    const employee = await Employee.findOne({ _id: employeeId, tenantId }).populate("userId");
    if (!employee) return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });

    const template = templates[type];
    if (!template) return NextResponse.json({ success: false, error: "Template not found" }, { status: 400 });

    // Calculate Annual Salary from Basic + HRA + Special
    const monthlyGross = (employee.salaryStructure.basic || 0) + (employee.salaryStructure.hra || 0) + (employee.salaryStructure.specialAllowance || 0);
    const annualSalary = monthlyGross * 12;

    // Inject Variables
    let generatedDocument = template
      .replace(/{{name}}/g, employee.userId.name)
      .replace(/{{designation}}/g, employee.designation)
      .replace(/{{department}}/g, employee.department)
      .replace(/{{annualSalary}}/g, annualSalary.toLocaleString("en-IN"))
      .replace(/{{location}}/g, employee.workLocationState || "HQ");

    return NextResponse.json({ success: true, data: { document: generatedDocument } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
