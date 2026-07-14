import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";

export async function GET(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    
    let query = { tenantId };
    if (employeeId) query.employeeId = employeeId;

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tickets });
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
    
    const ticket = await Ticket.create({
      tenantId,
      employeeId: body.employeeId,
      category: body.category,
      title: body.title,
      description: body.description
    });
    
    return NextResponse.json({ success: true, data: ticket }, { status: 201 });
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
    const { ticketId, status, resolutionComment, assignedHrId } = body;

    const ticket = await Ticket.findOne({ _id: ticketId, tenantId });
    if (!ticket) return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });

    if (status) ticket.status = status;
    if (resolutionComment) ticket.resolutionComment = resolutionComment;
    if (assignedHrId) ticket.assignedHrId = assignedHrId;

    await ticket.save();

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
