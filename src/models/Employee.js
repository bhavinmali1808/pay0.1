import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  department: { type: String },
  designation: { type: String },
  joiningDate: { type: Date, required: true },
  status: { type: String, enum: ["Active", "Notice", "Retired", "Terminated"], default: "Active" },
  noticePeriodDays: { type: Number, default: 30 },
  
  // Work Location for Statutory Compliance (PT, LWF)
  workLocationState: { type: String, required: true, default: "Karnataka" },
  
  // Salary Data
  salaryStructure: {
    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    specialAllowance: { type: Number, default: 0 },
  },
  
  // KYC & Statutory Documents
  kyc: {
    pan: { type: String },
    aadhar: { type: String },
    uan: { type: String }, // EPF Universal Account Number
    esiNumber: { type: String }
  },

  // Bank Details for Payroll Transfer
  bankDetails: {
    accountName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String }
  },

  // Benefits & Policies
  eligibilityForBenefits: [{ type: String }],
  policiesAcknowledged: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
