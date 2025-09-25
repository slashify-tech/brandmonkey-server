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
    // Cost breakdown structure
    clientRevenue: {
      type: Number,
      default: 0,
    },
    costs: {
      officeRent: { type: Number, default: 0 },
      tools: { type: Number, default: 0 },
      overheads: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    // Profitability metrics
    profitability: {
      revenue: { type: Number, default: 0 },
      cost: { type: Number, default: 0 },
      profit: { type: Number, default: 0 },
      margin: { type: String, default: "0%" },
      isUp: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totals and profit
financeSchema.pre("save", function (next) {
  // Calculate total costs
  this.costs.total = this.costs.officeRent + this.costs.tools + this.costs.overheads;

  // Set profitability metrics
  this.profitability.revenue = this.clientRevenue;
  this.profitability.cost = this.costs.total;
  this.profitability.profit = this.clientRevenue - this.costs.total;

  // Calculate profit margin percentage
  if (this.clientRevenue > 0) {
    const marginPercentage = ((this.profitability.profit / this.clientRevenue) * 100).toFixed(1);
    this.profitability.margin = `${marginPercentage}%`;
  } else {
    this.profitability.margin = "0%";
  }

  // Determine if profit is positive (isUp)
  this.profitability.isUp = this.profitability.profit > 0;

  next();
});

// Add compound index for unique client-month combination
financeSchema.index({ clientId: 1, month: 1 }, { unique: true });

const Finance = mongoose.model("finance", financeSchema);
module.exports = Finance;
