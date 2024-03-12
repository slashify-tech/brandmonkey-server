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
      require : true
    },
    complain: {
      type: String,
      require : true
    },
    feedback: {
      type: String,
    },
    attendies: { type: String },
  },
  { timestamps: true }
);

const MomData = mongoose.model("MOM_Data", momSchema);
module.exports = MomData;
