require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const {mongoose} = require('mongoose');
const bodyParser = require("body-parser");
const User = require('./models/User');
const Message = require ('./models/Message');


const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function connect () {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("MongoDB error");
    }
}
connect();

// login route

app.post("/auth",async(req,res)=>{
    try {
        const email=req.body.email
        const id = req.body.id
        const first_name = req.body.first_name 
        const last_name = req.body.last_name 
        const picture = req.body.picture.data.url
         
   const newUser = new User({
        email : email ,
        id : id ,
        first_name : first_name ,
        last_name : last_name ,
        picture : picture
    })

    const search = await User.findOne({id : id});

    if(search){
        const token =jwt.sign(
            {
            id : id ,
            first_name : first_name ,
            last_name : last_name ,
            },
            process.env.JWT_KEY,
            {
            expiresIn:"365 days"
            }
        );
        
        console.log(`user ${id} found`);
    
        
        res.status(200).json({
            "access_token":token ,
            "message":"login succesfull"
        } 
        )
    }else{
        await newUser.save();
        console.log(newUser._id);
        const token =jwt.sign(
            {
            id : id ,
            first_name : first_name ,
            last_name : last_name ,
            },
            process.env.JWT_KEY,
            {
            expiresIn:"365 days"
            }
        );
        console.log('new user created')
        res.status(200).json({
            "access_token":token,
            "message":"acount created"
        } 
        )
    }

} catch (error) {
        
    res.json({message:'error precossing authentication'});
}
})

//get user data route

app.get('/get_user/:id', async(req,res)=>{
    const receiverFbId= req.params.id
    console.log('details sent');        
     const userData = await User.findOne({id:receiverFbId});
     if(userData){
        const responseData ={
            first_name:userData.first_name,
            last_name:userData.last_name,
            picture:userData.picture,
         }
    
         res.status(200).json(responseData)
     }else{

     }

})

//save message to database route

app.post('/post_message/:id', async(req,res)=>{
    const receiverId= req.params.id
    // console.log(receiverId)
    const token = req.headers['token'];

        try {
            const payload= jwt.verify(token,process.env.JWT_KEY) ;
            const senderId = payload.id ;
            const senderData = await User.findOne({id:senderId});
            const receiverData = await User.findOne({id:receiverId}) ;
            

            if(receiverData){

                const message = req.body.message ;
                const hint = req.body.hint ;

                const messageData = new Message({
                    sender_id: senderId,
                    first_name:senderData.first_name,
                    last_name:senderData.last_name,
                    picture:senderData.picture,                   
                    message : message,
                    hint: hint
                })
                await User.findOneAndUpdate({id:receiverId},{$push:{conversations:messageData}},{new:true});
                
                // const array= await User.findOne({id:receiverId}).select(
                //     { 
                //     'conversations.sender_id': 0,
                //     'conversations.first_name': 0,
                //     'conversations.last_name': 0 ,
                //     'conversations.picture':0 ,
                //     'conversations.time':0 
                //     }
                // )
                
                // console.log(array.conversations)
                console.log("message received")
                res.status(200).json({message:'succesfull'})
            }else{
               console.log("user not found")
            }

        } catch (error) {
            console.log(error)
            res.status(401).send('Invalid token');
        }    
    }
)

app.get('/get_message', async(req,res)=>{
    const token = req.headers['token'];

    try {
        const payload= jwt.verify(token,process.env.JWT_KEY) ;
        const userId = payload.id ;
                   
            const userFullData= await User.findOne({id:userId}).select(
                { 
                'conversations.sender_id': 0,
                'conversations.first_name': 0,
                'conversations.last_name': 0 ,
                'conversations.picture':0 ,
                'conversations.time':0 
                }
            );
            const messages =userFullData.conversations;  
            console.log('messages sent')
            res.status(200).json(messages)


    } catch (error) {

        res.status(401).send('Invalid token');
    }    
}
)


app.post('/seen_status', async(req,res)=>{
    const token = req.headers['token'];

    try {
 
    const id = req.body._id ;
                   
    console.log(id)
    

    await User.findOneAndUpdate(
        { 'conversations._id': id }, // Match the document within the conversations array
        { $set: { 'conversations.$.seen': true } } // Update the specific property within the matched document
 
      )

    res.status(200).json({message :'updated'})
    } catch (error) {
    console.log(error)
        res.status(401).send('Invalid token');
    } 
    
})


app.listen(port , ()=>{
    console.log("Server started succesfully")

})