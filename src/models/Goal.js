import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  
  quarter: { type: String, required: true }, // e.g., "Q3 2026"
  objective: { type: String, required: true },
  keyResults: [{ type: String }],
  
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  managerComment: { type: String },
  status: { type: String, enum: ["On Track", "At Risk", "Completed"], default: "On Track" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

GoalSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
