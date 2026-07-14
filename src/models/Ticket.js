import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  
  category: { 
    type: String, 
    enum: ["Payroll Query", "Leave/Attendance", "IT Request", "Grievance", "Other"], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  status: { type: String, enum: ["Open", "In Progress", "Resolved", "Closed"], default: "Open" },
  assignedHrId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolutionComment: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
TicketSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
