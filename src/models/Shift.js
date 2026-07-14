import mongoose from "mongoose";

const ShiftSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true }, // e.g., "General Shift", "Night Shift"
  startTime: { type: String, required: true }, // e.g., "09:00"
  endTime: { type: String, required: true }, // e.g., "18:00"
  gracePeriodMinutes: { type: Number, default: 15 },
  halfDayAfterMinutes: { type: Number, default: 120 },
  weeklyOffDays: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Shift || mongoose.model("Shift", ShiftSchema);
