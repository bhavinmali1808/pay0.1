import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  leaveType: { type: String, enum: ["Sick", "Casual", "Earned", "Maternity", "Paternity"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  
  // Workflow Automation
  approvalStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Approver
  managerComment: { type: String },
  
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);
