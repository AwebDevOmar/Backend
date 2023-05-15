const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({

            sender_id:{
                type:String,
                required:true
            },
            first_name:{
                type:String,
                required:true
            },
            last_name:{                
                    type:String,
                    required:true
            },
            picture :{
                type:String,
                required:true
            },            
            message :{
                type:String,
                required:true
            },
            hint:{
                type:String,
                required:true
            },
            seen: {
                type:Boolean,
                default:false
            },
            private:{
                type:Boolean,
                default: true
            },
            time:{
                type:Date,
                default:Date.now
            }
        }
    
    
);

module.exports= mongoose.model('Message',MessageSchema);