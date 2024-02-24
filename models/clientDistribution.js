// const mongoose = require('mongoose');
// const { Schema } = mongoose;
// const clientElementSchema = mongoose.Schema({
//   clientName: {
//     type:String,
//     required : true
//   },
//   progressValue: {
//     type: String,
//     default: "0-10"
//   },
//   clientType : {
//     type:String,
//     default : "regular"
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   },
//   toEnd : {
//     type:String,
//     default : false
//   }
// },{ strict: false });

// const clientDistributionSchema = mongoose.Schema({
//   employeeName: {
//     type: Schema.Types.ObjectId,
//     ref: "employees",
//   },
//   clients: [clientElementSchema],
//   progressPercentage: {
//     type: String,
//     default : 0
//   }
// }, { timestamps: true });

// const ClientAssigned = mongoose.model('clientAssigned', clientDistributionSchema);
// module.exports = ClientAssigned;
