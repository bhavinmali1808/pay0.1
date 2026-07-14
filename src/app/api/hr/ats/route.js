import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Candidate from "@/models/Candidate";
import JobPosting from "@/models/JobPosting";
import Employee from "@/models/Employee";
import User from "@/models/User";

export async function POST(req) {
  await dbConnect();
  try {
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) return NextResponse.json({ success: false, error: "Missing tenant ID" }, { status: 400 });

    const body = await req.json();
    const { action } = body;

    // Create a new Candidate
    if (action === "createCandidate") {
      const candidate = await Candidate.create({
        tenantId,
        jobPostingId: body.jobPostingId,
        name: body.name,
        email: body.email,
        expectedSalary: body.expectedSalary
      });
      return NextResponse.json({ success: true, data: candidate });
    }

    // Move Candidate Pipeline Stage
    if (action === "updateCandidateStatus") {
      const { candidateId, status } = body;
      const candidate = await Candidate.findOne({ _id: candidateId, tenantId }).populate("jobPostingId");
      if (!candidate) return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });

      candidate.status = status;

      // --- AUTOMATION: One-Click Hire ---
      if (status === "Hired" && !candidate.employeeId) {
        // 1. Create Login User
        const user = await User.create({
          tenantId,
          name: candidate.name,
          email: candidate.email,
          passwordHash: "changeme123", // Force change on first login
          role: "Employee"
        });

        // 2. Create Employee Profile using Candidate Data
        const employee = await Employee.create({
          tenantId,
          userId: user._id,
          department: candidate.jobPostingId.department || "General",
          designation: candidate.jobPostingId.title || "New Hire",
          joiningDate: new Date(),
          status: "Active",
          workLocationState: candidate.jobPostingId.location || "Karnataka",
          salaryStructure: { 
            basic: Math.round((candidate.expectedSalary || 300000) * 0.4 / 12), // Assumes Basic is 40% of CTC
            hra: Math.round((candidate.expectedSalary || 300000) * 0.2 / 12),
            specialAllowance: Math.round((candidate.expectedSalary || 300000) * 0.4 / 12)
          }
        });

        candidate.employeeId = employee._id;
      }

      await candidate.save();
      return NextResponse.json({ success: true, data: candidate });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
