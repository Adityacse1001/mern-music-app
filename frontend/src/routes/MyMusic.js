import SingleSongCard from "../components/shared/SingleSongCard";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { useState, useEffect, useContext } from "react";
import LoggedInContainer2 from "../containers/LoggedInContainer2";
import songContext from "../context/songContext";
import { toast } from "react-toastify";

function MyMusic() {
  const [songData, setSongData] = useState([]);
  const { setCurrentSong, setSoundPlayed, setIsPaused } = useContext(songContext);

  const playSound = (song) => {
    if (!song?.track) {
      toast.error("Invalid song source", { autoClose: 2000 });
      return;
    }
    setCurrentSong(song);
    setIsPaused(false);
    // The actual audio playback is handled by LoggedInContainer2's useLayoutEffect
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/song/get/mysongs");
        setSongData(response.data || []);
      } catch (error) {
        toast.error("Failed to fetch songs", { autoClose: 3000 });
      }
    };
    getData();
  }, []);

  return (
    <LoggedInContainer2 curActiveScreen="mymusic">
      <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold pb-3 sm:pb-4 px-2 sm:px-4">
        My Songs
      </div>
      <div className="space-y-2 sm:space-y-3 overflow-auto p-2 sm:p-4">
        {songData.length === 0 ? (
          <p className="text-gray-400 text-center text-xs sm:text-sm">No songs uploaded yet</p>
        ) : (
          songData.map((data) => (
            <SingleSongCard
              info={data}
              key={data._id || JSON.stringify(data)}
              playSound={() => playSound(data)}
            />
          ))
        )}
      </div>
    </LoggedInContainer2>
  );
}

export default MyMusic;