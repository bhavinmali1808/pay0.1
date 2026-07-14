import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import User from "@/models/User";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const employees = await Employee.find({ tenantId }).populate("userId", "name email role");
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();
    
    // First create the User
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash: "default123", // In a real app, hash this
      role: "Employee"
    });

    // Then create the Employee record
    const employee = await Employee.create({
      userId: user._id,
      department: body.department,
      designation: body.designation,
      joiningDate: new Date(body.joiningDate),
      salaryStructure: body.salaryStructure,
      eligibilityForBenefits: body.eligibilityForBenefits || []
    });

    return NextResponse.json({ success: true, data: employee }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
