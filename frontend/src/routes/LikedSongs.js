import { useState, useEffect, useContext } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import SingleSongCard from "../components/shared/SingleSongCard";
import LoggedInContainer2 from "../containers/LoggedInContainer2";
import { toast } from "react-toastify";
import songContext from "../context/songContext";
import { Howl } from "howler";

function LikedSongs() {
  const [songData, setSongData] = useState([]);
  const { currentSong, setCurrentSong, soundPlayed, setSoundPlayed, setIsPaused, likedSongs } = useContext(songContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/song/liked");
        if (!response.error) {
          setSongData(response.data || []);
        } else {
          toast.error(response.error || "Failed to fetch liked songs", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Fetch liked songs error:", error.message);
        toast.error(error.message || "Failed to fetch liked songs", { autoClose: 3000 });
      }
    };
    getData();
  }, [likedSongs]);

  const playSound = (song) => {
    return () => {
      if (!song?.track) {
        toast.error("No audio track available", { autoClose: 3000 });
        return;
      }
      if (soundPlayed) {
        soundPlayed.stop();
        soundPlayed.unload();
        setSoundPlayed(null);
      }
      setCurrentSong(song);
      const sound = new Howl({
        src: [song.track],
        html5: true,
      });
      setSoundPlayed(sound);
      sound.play();
      setIsPaused(false);
    };
  };

  return (
    <LoggedInContainer2 curActiveScreen="likedsong">
      <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold pb-3 sm:pb-4 px-2 sm:px-4">
        Liked Songs
      </div>
      <div className="space-y-2 sm:space-y-3 overflow-auto p-2 sm:p-4">
        {songData.length === 0 ? (
          <p className="text-gray-400 text-center text-xs sm:text-sm">No liked songs yet</p>
        ) : (
          songData.map((data) => (
            <SingleSongCard
              key={data._id}
              info={data}
              playSound={playSound(data)}
            />
          ))
        )}
      </div>
    </LoggedInContainer2>
  );
}

export default LikedSongs;