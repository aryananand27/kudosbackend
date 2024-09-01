const express=require('express');
const cors=require('cors');
const app=express(); 
require('./DB/config');
require('dotenv').config();
const UserModel=require('./Models/users');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const secretkey=process.env.JWT_SECRET_KEY;
const upload=require('./uploads');
const {ObjectId}=require('mongodb');

app.use(cors());
app.use(express.json());


app.get('/',(req,resp)=>{
    resp.send("Hello from server")
})
app.post('/register',async(req,resp)=>{
    try{
        if(req.body.name && req.body.email && req.body.password){
            const result=new UserModel(req.body);
            const token=  jwt.sign({_id:result._id},secretkey,{expiresIn:"1h"});
            const data=await result.save();
            delete data.password;
            resp.send({result:data,token});
        }
        else{
            resp.send({err:"All Field is required.."});
        } 
   }
   catch(error){
    if(error.keyPattern){
        resp.send({err:"User Already Exists."})
    }
    else{
        resp.send(error);
    }
   }
})

app.post('/login',async(req,resp)=>{
    if(req.body.email && req.body.password){
        const result= await UserModel.findOne({email:req.body.email});
        
        if(result){
            const ismatch=await bcrypt.compare(req.body.password,result.password);
            const token=jwt.sign({_id:result._id},secretkey,{expiresIn:"1h"});
            if(ismatch){
                delete result.password;
                resp.send({result,token});
            }
            else{
                resp.send({err:"User Credential is wrong."})
            }
        }
        else{
            resp.send({err:"Username is not found."})
        }
        
    }
    else{
        resp.send({err:"All Field is required."})
    }
})

app.post('/upload',  upload.single('file'), (req, res) => {
    try {
      res.send({ fileUrl: req.file.path });
    }
     catch (err) {
      res.send({ err: 'Failed to upload file' });
    }
  });

app.put('/update/:id',async(req,resp)=>{
    if(req.params.id){
        const result =await UserModel.updateOne({_id:new ObjectId(req.params.id)},{$set:{resume:req.body.resume}});
        resp.send(result);
    }
    else{
        resp.send({err:"Not recognised user."})
    }
})
app.get('/getresume/:id',async(req,resp)=>{
        if(req.params.id){
            const result=await UserModel.findOne({_id:new ObjectId(req.params.id)});
            if(result){
                resp.send(result);
            }
            else{
                resp.send({err:"Data Not Found."})
            }
        }
        else{
            resp.send({err:"Not Recognised User."})
        }
})

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
    next(); 
})
app.listen(8000);