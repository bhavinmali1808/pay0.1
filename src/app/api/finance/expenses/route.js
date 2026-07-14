import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ExpenseClaim from "@/models/ExpenseClaim";
import PayrollInput from "@/models/PayrollInput";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    
    let query = { tenantId };
    if (employeeId) query.employeeId = employeeId;

    const claims = await ExpenseClaim.find(query).populate("employeeId").sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: claims });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    
    const claim = await ExpenseClaim.create({
      tenantId,
      employeeId: body.employeeId,
      category: body.category,
      amount: body.amount,
      description: body.description,
      proofUrl: body.proofUrl // Mocked path for now
    });
    
    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    const { claimId, status, managerId, managerComment } = body;

    const claim = await ExpenseClaim.findOne({ _id: claimId, tenantId });
    if (!claim) return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });

    claim.status = status;
    claim.managerId = managerId;
    if (managerComment) claim.managerComment = managerComment;

    // Workflow Automation: If approved, automatically inject into Payroll engine
    if (status === "Approved") {
      const payrollInput = await PayrollInput.create({
        tenantId,
        employeeId: claim.employeeId,
        type: "ExpenseClaim",
        amount: claim.amount,
        description: `Expense Reimbursement: ${claim.category} - ${claim.description}`,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        submittedBy: managerId
      });
      claim.payrollInputId = payrollInput._id;
    }

    await claim.save();

    return NextResponse.json({ success: true, data: claim });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
