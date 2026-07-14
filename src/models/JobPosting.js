import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  
  salaryRange: {
    min: { type: Number },
    max: { type: Number }
  },
  
  status: { type: String, enum: ["Draft", "Published", "Closed"], default: "Draft" },
  skillsRequired: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.JobPosting || mongoose.model("JobPosting", JobPostingSchema);
