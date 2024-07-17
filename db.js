const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://***********************************mongodb.net/paytm")
 
const userSchema=mongoose.Schema({
username:{type:String,
    unique:true
},
password:String,
firstName:String,
lastName:String


})

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to User model
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});
const Model=mongoose.model('Data',userSchema);
const Account = mongoose.model('Account', accountSchema);
module.exports={Model,Account};
