const mongoose = require('mongoose');
const Message =require('./Message')

const UserSchema = new mongoose.Schema({
    email : {
        type : String ,
        required : true
    },
    id : {
        type : String ,
        required : true
    },
    first_name : {
        type : String ,
        required : true
    },
    last_name : {
        type : String ,
        required : true
    },
    picture : {
        type : String ,
        required : true
    },    
    credit : {
        type : Number,
        default :0,
        required : false

    },
    subscription_expiry :{
        type : Date
    },

    conversations:[Message.schema]
    
});

module.exports= mongoose.model('User',UserSchema);