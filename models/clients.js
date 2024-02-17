const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    // Reels : {
    //     type : String,
    //     default : "NA"
    // },
    // Flyer : {
    //     type : String,
    //     default : "NA"
    // },
    // "Facebook Ads" : {
    //     type : String,
    //     default : "NA"
    // },
    // "Google Ads" : {
    //     type : String,
    //     default : "NA"
    // },
    // "SEO" : {
    //     type : String,
    //     default : "NA"
    // },
    // "GMB" : {
    //     type : String,
    //     default : "NA"
    // },
    // "Youtube Management" : {
    //     type : String,
    //     default : "NA"
    // },
    // Ecommerce : {
    //     type : String,
    //     default : "NA"
    // },
    // "Social Media Management" : {
    //     type : String,
    //     default : "NA"
    // },
    // Photography :{
    //     type : String,
    //     default : "NA"
    // },
    // Videography :{
    //     type : String,
    //     default : "NA"
    // },
    // "Content Creator" :{
    //     type : String,
    //     default : "NA"
    // },
    // Website :{
    //     type : String,
    //     default : "NA"
    // },
    clientType : {
        type : String,
        enum : [ "regular", "onetime"],
        default : "regular"
    }
},{strict:false});

const Clients = mongoose.model('clients', clientSchema);
module.exports = Clients;