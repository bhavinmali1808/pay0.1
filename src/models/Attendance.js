import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Leave", "Half-Day"], required: true },
  shiftTiming: { type: String }, // e.g., "09:00 - 18:00"
  checkIn: { type: Date },
  checkOut: { type: Date },
  loggedBy: { type: String, enum: ["System", "Security", "Manager"], required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure only one attendance record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
