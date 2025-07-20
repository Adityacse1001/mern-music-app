const express = require('express');
const router = express.Router();
const passport = require('passport');
const Playlist = require('../models/Playlist');
const User= require('../models/user');
const Song= require('../models/Song');
// route 1 creating a playlist 

router.post("/create", passport.authenticate("jwt", {session:false}), async (req, res) => {
    const currentUser = req.user;
    const{name , thumbnail,songs}= req.body;
    if(!name|| !thumbnail|| !songs){
        return res.status(301).json({error: "All fields are required"});
     }

     const playlistData = {
         name,
         thumbnail,
         owner: currentUser._id,
         songs,
         collaborators: []
        }
        const playlist = await Playlist.create(playlistData);
        return res.status(200).json(playlist);
    });
    // route 2 get the playlist by owner id 
    // we will get the playlist id as a route parameter and we will return the playlist having the matched id 

     router.get("/get/playlist/:playlistId",passport.authenticate("jwt", {session:false}), async (req,res)=>{
        const playlistId=req.params.playlistId;

        const playlist=await Playlist.findOne({_id:playlistId}).populate({
          path:"songs" ,
         
          populate:{
            path:"artist",
            
          }
        });
        if(!playlist){
            return res.status(301).json({error: "Invalid ID"});
        }

        return res.status(200).json(playlist);
     })

     // we can retriev the playlist by me 
      router.get("/get/me",passport.authenticate("jwt", {session:false}),async(req, res)=>{
        const artistId=req.user._id;
          // checking for error handling 
          // check if the artist not found then redirect it to the home page if artist is there but no playlist is found return empty array
                
        
        const playlists=await Playlist.find({owner:artistId}).populate("owner");
         

        return res.status(200).json({data:playlists});
      }) 
     // we can retriev the playlist by the artist also // that can also be done 
      router.get("/get/artist/:artistId",passport.authenticate("jwt", {session:false}),async(req, res)=>{
        const artistId=req.params.artistId;
          // checking for error handling 
          // check if the artist not found then redirect it to the home page if artist is there but no playlist is found return empty array
           
         const artist=await User.findOne({_id:artistId});
         if(!artist){
            return res.status(304).json({err:"invalid artist Id"});
         }
        
        const playlists=await Playlist.findOne({owner:artistId});
         

        return res.status(200).json({data:playlists});
      }) 

     // one more api we create is to add song to playlist 
    
     router.post("/add/song",passport.authenticate("jwt", {session:false}), async(req, res)=>{
        const currentUser=req.user;
        const {playlistId,songId}=req.body;
        // step 0 get the playlist if valid
        const playlist=await Playlist.findOne({_id:playlistId});
        if(!playlist){
            return res.status(304).json({error: "Invalid playlist ID"});
        }
        // step 1 check if the current user owns that playlist  or is a collaborator 

            if(!playlist.owner.equals(currentUser._id) &&  !playlist.collaborators.includes(currentUser._id)){
                return res.status(400).json({err:"Not allowed"});
            }
        // step 2 check is the song is a valid song 
         const song =await Song.findOne({_id:songId});
            
        if(!song){
            return res.status(304).json({error: "Song does not exist" });
        }
      // step 3 all validation is done now just add the song to the playlist
      playlist.songs.push(songId);// may be song or  songs
      await playlist.save();
      return res.status(200).json(playlist);


    })

module.exports = router;