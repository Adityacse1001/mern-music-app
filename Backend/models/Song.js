const mongoose =require("mongoose");
// const User = require("./user");
// step 1 require mongoose
// step2 create a mongoose schema (Structure of a user)
// step 3 creating a model 

const Song= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    track:{
        // just for now 
        type:String,
        required:true
    },
    artist:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    }
});

const SongModel= mongoose.model("Song",Song);
module.exports=SongModel;