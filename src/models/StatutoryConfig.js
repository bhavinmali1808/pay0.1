import mongoose from "mongoose";

const PTSlabSchema = new mongoose.Schema({
  minSalary: { type: Number, required: true },
  maxSalary: { type: Number, required: true }, // Use a very high number (e.g., 9999999) for "above"
  amount: { type: Number, required: true }
});

const StatutoryConfigSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  state: { type: String, required: true }, // e.g., "Karnataka", "Maharashtra"
  ptSlabs: [PTSlabSchema],
  lwf: {
    employeeContribution: { type: Number, default: 0 },
    employerContribution: { type: Number, default: 0 },
    deductionMonths: [{ type: Number }] // e.g., [6, 12] for June and Dec (Maharashtra)
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.StatutoryConfig || mongoose.model("StatutoryConfig", StatutoryConfigSchema);
