import mongoose from "mongoose";

const ExpenseClaimSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  category: { 
    type: String, 
    enum: ["Travel", "Food", "Fuel", "Accommodation", "Office Supplies", "Other"], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  proofUrl: { type: String }, // Path or URL to the uploaded receipt
  
  // Workflow Automation
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who approved/rejected it
  managerComment: { type: String },
  
  // Link to Payroll if approved
  payrollInputId: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollInput" },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ExpenseClaim || mongoose.model("ExpenseClaim", ExpenseClaimSchema);
