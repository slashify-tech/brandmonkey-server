const mongoose = require("mongoose");

const financeSchema = mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    month: {
      type: String,
      required: true,
      default: () => new Date().toISOString().slice(0, 7), // YYYY-MM format
      validate: {
        validator: function (v) {
          const monthRegex = /^\d{4}-\d{2}$/;
          if (!monthRegex.test(v)) {
            return false;
          }
          const monthPart = parseInt(v.split("-")[1]);
          return monthPart >= 1 && monthPart <= 12;
        },
        message: "Month must be in YYYY-MM format with valid month (01-12)",
      },
    },
    // Revenue details
    revenue: {
      clientRevenue: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      reimbursement: { type: Number, default: 0 },
      salaries: { type: Number, default: 0 },
    },
    // Cost details
    costs: {
      officeRentMaintenance: { type: Number, default: 0 },
      emi: { type: Number, default: 0 },
      it: { type: Number, default: 0 },
      miscellaneous: { type: Number, default: 0 },
    },
    // Calculated fields
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalCosts: {
      type: Number,
      default: 0,
    },
    profitMargin: {
      type: Number,
      default: 0,
    },
    profitAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totals and profit
financeSchema.pre("save", function (next) {
  // Calculate total revenue
  this.totalRevenue =
    this.revenue.clientRevenue +
    this.revenue.marketing +
    this.revenue.reimbursement +
    this.revenue.salaries;

  // Calculate total costs
  this.totalCosts =
    this.costs.officeRentMaintenance +
    this.costs.emi +
    this.costs.it +
    this.costs.miscellaneous;

  // Calculate profit amount
  this.profitAmount = this.totalRevenue - this.totalCosts;

  // Calculate profit margin percentage
  if (this.totalRevenue > 0) {
    this.profitMargin = ((this.profitAmount / this.totalRevenue) * 100).toFixed(
      2
    );
  }

  next();
});

// Add compound index for unique client-month combination
financeSchema.index({ clientId: 1, month: 1 }, { unique: true });

const Finance = mongoose.model("finance", financeSchema);
module.exports = Finance;
