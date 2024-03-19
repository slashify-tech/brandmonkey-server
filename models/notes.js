const mongoose = require("mongoose");
const noteSchema = mongoose.Schema(
  {
    authorName: {
      type: String,
      default : "",
    },
    notes: {
      type: String,
      require : true
    },
  },
  { timestamps: true }
);

const Notes = mongoose.model("note", noteSchema);
module.exports = Notes;
