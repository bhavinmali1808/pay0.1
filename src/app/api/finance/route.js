import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PayrollInput from "@/models/PayrollInput";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const tenantId = req.headers.get("x-tenant-id");

  if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

  let query = { tenantId, type: { $in: ["AdHocPayment", "Deduction", "Arrears"] } };
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);

  try {
    const inputs = await PayrollInput.find(query).populate("employeeId");
    return NextResponse.json({ success: true, data: inputs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    const input = await PayrollInput.create({
      tenantId,
      employeeId: body.employeeId,
      type: body.type, // e.g., AdHocPayment, Deduction
      amount: body.amount,
      description: body.description,
      month: body.month,
      year: body.year,
      submittedBy: body.submittedBy // Assuming Finance user ID is passed
    });
    return NextResponse.json({ success: true, data: input }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
