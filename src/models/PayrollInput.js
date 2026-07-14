import mongoose from "mongoose";

const PayrollInputSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  type: { 
    type: String, 
    enum: ["AdHocPayment", "Deduction", "TaxDeclaration", "ExpenseClaim", "Arrears", "VendorDeduction"], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true }, // e.g. 2026
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who created this entry
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PayrollInput || mongoose.model("PayrollInput", PayrollInputSchema);
