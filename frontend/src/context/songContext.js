// import { createContext } from "react";

// const songContext=createContext({
//      currentSong:null,
//      setCurrentSong:(currentSong)=>{},
//      soundPlayed:null, 
//      setSoundPlayed:()=>{},
//       isPaused:null,
//        setIsPaused:()=>{},
// });

// export default songContext;

import { createContext } from "react";

const songContext = createContext({
  currentSong: null,
  setCurrentSong: () => {},
  soundPlayed: null,
  setSoundPlayed: () => {},
  isPaused: null,
  setIsPaused: () => {},
  likedSongs: [],
  setLikedSongs: () => {},

  // 🆕 Added for history tracking
  songHistory: [],
  setSongHistory: () => {},
  currentSongIndex: 0,
  setCurrentSongIndex: () => {},
});

export default songContext;
