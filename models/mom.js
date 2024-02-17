const mongoose = require("mongoose");
const { Schema } = mongoose;
const momSchema = mongoose.Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "clients",
    },
    topicDiscuss: {
      type: String,
    },
    complain: {
      type: String,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

const MomData = mongoose.model("MOM_Data", momSchema);
module.exports = MomData;
