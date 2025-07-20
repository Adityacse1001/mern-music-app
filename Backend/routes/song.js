const express = require("express");
const router = express.Router();
const passport = require("passport");
const Song = require("../models/Song");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
// const userRoutes = require('./routes/user');
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // req.user gets the user because of passport.authentication
    const { name, thumbnail, track } = req.body;

    // console.log("name "+name);
    // console.log(req.user);
    // when will this routes fails
    if (!name || !thumbnail || !track) {
      return res
        .status(301)
        .json({ error: "Insufficient details to create song " });
    }
    const artist = req.user._id; // this happen because of the middleware

    const SongDetails = { name, thumbnail, track, artist };
    const createdSong = await Song.create(SongDetails);

    return res.status(200).json(createdSong);
  }
);
// owner of the song can retrieve their song details
router.get(
  "/get/mysongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    // we need to get all the songs where artist id == currentUser.id

    const songs = await Song.find({ artist: req.user._id }).populate("artist");

    return res.status(200).json({ data: songs });
  }
);
// next api is to retrieve all the songs that any artist has published
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistId } = req.params; // did use for now but actually this is incorrect

    // we can check if the artist does not exit
    const artist = await User.findOne({ _id: artistId });
    // ![]= false  ::  for the case of user.find
    // !null is true  for  method of user.findone check if the user is there or not if not then return the null that is what we want
    // also !undefined  is true for method of user
    if (!artist) {
      return res.status(301).json({ error: "Artist does not exist" });
    }
    // get all the songs by the artistId

    const songs = await Song.find({ artist: artistId });
    return res.status(200).json({ data: songs });
  }
);
// next api is to get the song by using the song name

// router.get(
//   "/get/songname/:songName",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     const { songName } = req.params;
//     /// flaw: there is a pattern matching of the same name in database , vanilla if typo with vanila give us error
//     // move for pattern matching to solve the problem
//     // use regex to match the songName exactly
//     // const songs=await Song.find({name: {$regex: songName, $options: 'i'}}); // i is for case insensitive
//     // return res.status(200).json({data:songs});

//     const songs = await Song.find({ name: songName }).populate("artist");
//     return res.status(200).json({ data: songs });
//   }
// );
router.get(
  "/get/songname/:songName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { songName } = req.params;
      
      // Escape special regex characters
      const escapedSongName = songName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create a regex that looks for the pattern anywhere in the name
      // but maintains enough structure to avoid matching everything
      const searchPattern = new RegExp(escapedSongName, 'i');
      
      // First try a more strict search
      let songs = await Song.find({
        name: searchPattern
      }).populate("artist");
      
      // If no exact matches found, try a more flexible search
      // but only if the songName is long enough to justify it
      if (songs.length === 0 && songName.length >= 3) {
        // This pattern will match if the words start with the query letters
        // For example, "boh rha" would match "Bohemian Rhapsody"
        const words = escapedSongName.split(' ').filter(word => word.length > 0);
        if (words.length > 0) {
          const wordPatterns = words.map(word => `\\b${word}\\w*`);
          const flexiblePattern = new RegExp(wordPatterns.join('.*'), 'i');
          
          songs = await Song.find({
            name: flexiblePattern
          }).populate("artist");
        }
      }
      
      return res.status(200).json({ data: songs });
    } catch (error) {
      
      return res.status(500).json({ error: "Failed to search for songs" });
    }
  }
);

const authenticate = passport.authenticate("jwt", { session: false });

// POST /song/like - Like or unlike a song
router.post("/like", authenticate, async (req, res) => {
  const { songId } = req.body;
  const user = req.user;

  try {
   


    const song = await Song.findById(songId).populate("artist");
    if (!song) {
      console.error("Song not found:", songId);
      return res.status(404).json({ error: "Song not found" });
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      console.error("User not found:", user._id);
      return res.status(404).json({ error: "User not found" });
    }

    const isLiked = userDoc.likedSongs.includes(songId);
    

    if (isLiked) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { likedSongs: songId },
      });
    
      return res.json({ message: "Song unliked", liked: false });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { likedSongs: songId },
      });
    
      return res.json({ message: "Song liked", liked: true });
    }
  } catch (error) {
 
    return res.status(500).json({ error: "Server error: " + error.message });
  }
});

// GET /song/liked - Fetch all liked songs
router.get("/liked", authenticate, async (req, res) => {
  try {
 
    const user = await User.findById(req.user._id)
      .populate({
        path: "likedSongs",
        populate: { path: "artist", select: "firstname lastname" },
      })
      .select("likedSongs");
    if (!user) {
   
      return res.status(404).json({ error: "User not found" });
    }
   
    return res.json({ data: user.likedSongs });
  } catch (error) {
   
    return res.status(500).json({ error: "Server error: " + error.message });
  }
});

router.get('/random', authenticate, async (req, res) => {
  try {
    const randomSong = await Song.aggregate([{ $sample: { size: 1 } }]);
    if (!randomSong || randomSong.length === 0) {
      return res.status(404).json({ error: 'No songs found' });
    }
    const song = randomSong[0];
    // Populate artist data if needed
    const populatedSong = await Song.findById(song._id).populate('artist', 'firstname lastname');
    res.json(populatedSong);
  } catch (error) {
    // console.error('Random song error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/random/:count', authenticate, async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 8;
    const randomSongs = await Song.aggregate([{ $sample: { size: Math.min(count + 10, 100) } }]);
    if (!randomSongs || randomSongs.length === 0) {
      return res.status(404).json({ error: 'No songs found' });
    }
    const selectedSongs = randomSongs.slice(0, Math.min(count, randomSongs.length));
    const populatedSongs = await Song.find({ _id: { $in: selectedSongs.map(s => s._id) } })
      .populate('artist', 'firstname lastname');
    res.json(populatedSongs);
  } catch (error) {
    // console.error('Random songs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;