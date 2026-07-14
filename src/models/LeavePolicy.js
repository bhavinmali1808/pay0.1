import mongoose from "mongoose";

const LeavePolicySchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true }, // e.g., "Standard Policy 2026"
  sickLeave: {
    annualLimit: { type: Number, required: true },
    carryForwardLimit: { type: Number, default: 0 }
  },
  casualLeave: {
    annualLimit: { type: Number, required: true },
    carryForwardLimit: { type: Number, default: 0 }
  },
  earnedLeave: {
    annualLimit: { type: Number, required: true },
    carryForwardLimit: { type: Number, default: 30 },
    encashable: { type: Boolean, default: true }
  },
  maternityLeaveDays: { type: Number, default: 180 },
  paternityLeaveDays: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.LeavePolicy || mongoose.model("LeavePolicy", LeavePolicySchema);
