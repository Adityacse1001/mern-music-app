import React, { useContext } from "react";
import songContext from "../../context/songContext";

function SingleSongCard({ info, playSound }) {
  const { currentSong, setCurrentSong } = useContext(songContext);

  return (
    <div
      className="flex hover:bg-gray-800/50 p-2 sm:p-3 rounded-md transition-all duration-200"
      onClick={() => {
        setCurrentSong(info);
        if (playSound) playSound();
      }}
    >
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 bg-cover bg-center rounded-md shadow-md"
        style={{
          backgroundImage: `url(${info.thumbnail})`,
        }}
      ></div>
      <div className="flex w-full">
        <div className="text-white flex flex-col justify-center pl-2 sm:pl-3 w-5/6">
          <div className="cursor-pointer hover:underline text-xs sm:text-sm truncate">
            {info.name}
          </div>
          <div className="text-xs text-gray-400 cursor-pointer hover:underline truncate">
            {info.artist?.firstname || "Unknown"} {info.artist?.lastname || "Artist"}
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-center pl-2 sm:pl-3 w-1/6 text-gray-400 text-xs">
          {/* Placeholder for duration or other info */}
        </div>
      </div>
    </div>
  );
}

export default SingleSongCard;