import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  jobPostingId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
  
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  resumeUrl: { type: String },
  
  status: { 
    type: String, 
    enum: ["Applied", "Screening", "Interviewing", "Offered", "Hired", "Rejected"], 
    default: "Applied" 
  },
  
  interviewerFeedback: { type: String },
  expectedSalary: { type: Number },
  
  // Link to Employee record if Hired
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CandidateSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema);
