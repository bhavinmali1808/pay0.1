import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Goal from "@/models/Goal";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    
    let query = { tenantId };
    if (employeeId) query.employeeId = employeeId;

    const goals = await Goal.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: goals });
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
    
    const goal = await Goal.create({
      tenantId,
      employeeId: body.employeeId,
      quarter: body.quarter,
      objective: body.objective,
      keyResults: body.keyResults
    });
    
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
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
    const { goalId, progress, status, managerComment } = body;

    const goal = await Goal.findOne({ _id: goalId, tenantId });
    if (!goal) return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });

    if (progress !== undefined) goal.progress = progress;
    if (status) goal.status = status;
    if (managerComment) goal.managerComment = managerComment;

    await goal.save();

    return NextResponse.json({ success: true, data: goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
