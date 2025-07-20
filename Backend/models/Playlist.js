const mongoose =require("mongoose");
// step 1 require mongoose
// step2 create a mongoose schema (Structure of a user)
// step 3 creating a model 

const PlayList= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
   
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"User",
    },

    songs: [{
        type: mongoose.Types.ObjectId,
        ref: "Song",
    }],

    collaborators: [{
        type: mongoose.Types.ObjectId,
        ref: "User",
    }],

});

const PlayListModel= mongoose.model("Playlist",PlayList);
module.exports=PlayListModel;