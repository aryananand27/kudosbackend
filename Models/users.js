const mongoose=require('mongoose');
const bcrypt=require('bcrypt');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        require:[true,"Username Field is required."],
        unique:[true,"Username Already exists."]
    },
    email:{
        type:String,
        require:[true,"Email Field is required."],
        unique:[true,"Email Already exists."]
    },
    password:{
        type:String,
        require:[true,"Password Field is required."],
        unique:[true,"Password Already exists."]
    },
    interest:{
        type:String,
        require:true
    },
    resume:{
        type:String,
        require:true
    }
})
UserSchema.pre('save',async function(next){
    this.password=await bcrypt.hash(this.password,10);
   
    next();
})
module.exports=mongoose.model('users',UserSchema);