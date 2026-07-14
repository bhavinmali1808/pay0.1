import mongoose from "mongoose";

const WebhookSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  
  name: { type: String, required: true },
  url: { type: String, required: true },
  
  eventTypes: [{ type: String, enum: ["PayrollFinalized", "EmployeeCreated", "ExpenseApproved", "CandidateHired"] }],
  
  secret: { type: String }, // Used to sign the payload (HMAC)
  isActive: { type: Boolean, default: true },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Webhook || mongoose.model("Webhook", WebhookSchema);
