const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://127.0.0.1:27017/payroll_system";

const UserSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  email: String,
  passwordHash: String,
  role: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const EmployeeSchema = new mongoose.Schema({
  tenantId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  department: String,
  designation: String,
  joiningDate: Date,
  status: String,
  workLocationState: String,
  salaryStructure: {
    basic: Number,
    hra: Number,
    specialAllowance: Number,
  },
  kyc: {
    pan: String,
    aadhar: String,
    uan: String,
    esiNumber: String
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  eligibilityForBenefits: [String],
  policiesAcknowledged: [String]
});
const Employee = mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);

const AttendanceSchema = new mongoose.Schema({
  tenantId: String,
  employeeId: mongoose.Schema.Types.ObjectId,
  date: Date,
  status: String,
  shiftTiming: String,
  loggedBy: String
});
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for multi-tenant Phase 1 seeding...");

  await User.deleteMany({});
  await Employee.deleteMany({});
  await Attendance.deleteMany({});

  const tenantA = "tenant-acme-corp";
  const tenantB = "tenant-globex-inc";

  // --- ACME CORP EMPLOYEES ---
  const user1 = await User.create({
    tenantId: tenantA,
    name: "Rajesh Kumar",
    email: "rajesh@acmecorp.com",
    passwordHash: "default123",
    role: "Employee"
  });
  const emp1 = await Employee.create({
    tenantId: tenantA,
    userId: user1._id,
    department: "Operations",
    designation: "Associate",
    joiningDate: new Date("2024-01-15"),
    status: "Active",
    workLocationState: "Karnataka",
    salaryStructure: { basic: 12000, hra: 5000, specialAllowance: 1000 },
    kyc: { pan: "ABCDE1234F", aadhar: "123456789012", uan: "100987654321", esiNumber: "51000000000000000" },
    bankDetails: { accountName: "Rajesh Kumar", accountNumber: "0000111122223333", ifscCode: "HDFC0001234", bankName: "HDFC Bank" },
    eligibilityForBenefits: ["Health Insurance"],
    policiesAcknowledged: ["IT Policy", "Leave Policy"]
  });

  const user2 = await User.create({
    tenantId: tenantA,
    name: "Priya Sharma",
    email: "priya@acmecorp.com",
    passwordHash: "default123",
    role: "Employee"
  });
  const emp2 = await Employee.create({
    tenantId: tenantA,
    userId: user2._id,
    department: "Engineering",
    designation: "Software Engineer",
    joiningDate: new Date("2023-06-10"),
    status: "Active",
    workLocationState: "Maharashtra",
    salaryStructure: { basic: 50000, hra: 20000, specialAllowance: 10000 },
    kyc: { pan: "FGHIJ5678K", aadhar: "987654321098", uan: "100123456789", esiNumber: "" },
    bankDetails: { accountName: "Priya Sharma", accountNumber: "9999888877776666", ifscCode: "ICIC0005678", bankName: "ICICI Bank" },
    eligibilityForBenefits: ["Health Insurance", "PF", "Gym Allowance"],
    policiesAcknowledged: ["IT Policy", "Leave Policy", "Engineering Guidelines"]
  });

  // --- GLOBEX INC EMPLOYEES ---
  const user3 = await User.create({
    tenantId: tenantB,
    name: "John Smith",
    email: "jsmith@globex.com",
    passwordHash: "default123",
    role: "Employee"
  });
  const emp3 = await Employee.create({
    tenantId: tenantB,
    userId: user3._id,
    department: "Marketing",
    designation: "Director",
    joiningDate: new Date("2022-04-10"),
    status: "Active",
    workLocationState: "Delhi",
    salaryStructure: { basic: 90000, hra: 40000, specialAllowance: 20000 },
    kyc: { pan: "KLMNO9012P", aadhar: "456789012345", uan: "100456789012", esiNumber: "" },
    bankDetails: { accountName: "John Smith", accountNumber: "1111222233334444", ifscCode: "SBIN0009012", bankName: "State Bank of India" },
    eligibilityForBenefits: ["Health Insurance", "PF", "Car Allowance"],
    policiesAcknowledged: ["Global Code of Conduct"]
  });

  // Seed 20 days of present attendance
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  for (let day = 1; day <= 20; day++) {
    const date = new Date(currentYear, currentMonth, day);
    // Acme
    await Attendance.create({ tenantId: tenantA, employeeId: emp1._id, date, status: "Present", shiftTiming: "09:00 - 18:00", loggedBy: "System" });
    await Attendance.create({ tenantId: tenantA, employeeId: emp2._id, date, status: "Present", shiftTiming: "09:00 - 18:00", loggedBy: "System" });
    // Globex
    await Attendance.create({ tenantId: tenantB, employeeId: emp3._id, date, status: "Present", shiftTiming: "09:00 - 18:00", loggedBy: "System" });
  }

  console.log("Phase 1 DB seeded successfully with new KYC & Location data!");
  process.exit(0);
}

seed().catch(console.error);
