const mongoose = require("mongoose");

const ticketCountSchema = mongoose.Schema({
  TotalTickets: { type: Number, default: 0 },
  TotalTicketSolved: { type: Number, default: 0 },
});

const TicketCount = mongoose.model("ticketCount", ticketCountSchema);

module.exports = TicketCount;
