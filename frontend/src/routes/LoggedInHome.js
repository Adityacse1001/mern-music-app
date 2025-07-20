import { Icon } from "@iconify/react";
import { useState, useEffect, useContext } from "react";
import LoggedInContainer2 from "../containers/LoggedInContainer2";
import songContext from "../context/songContext";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { toast } from "react-toastify";

const LoggedInHome = () => {
  const [songs, setSongs] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const { setCurrentSong } = useContext(songContext);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await makeAuthenticatedGETRequest("/song/random/11");
        if (!response.error) {
          setSongs(response);
        } else {
          toast.error(response.error || "Failed to fetch songs", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Fetch songs error:", error);
        toast.error("Failed to fetch songs", { autoClose: 3000 });
      }
    };
    fetchSongs();
  }, []);

  const handleCardClick = (song) => {
    setCurrentSong(song);
  };

  return (
    <LoggedInContainer2 curActiveScreen="home">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white overflow-auto">
        <div className="p-6 md:p-8">
          <PlaylistView
            titleText="Featured Songs"
            songs={songs.slice(0, 4)}
            handleCardClick={handleCardClick}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
          <PlaylistView
            titleText="New Releases"
            songs={songs.slice(4, 8)}
            handleCardClick={handleCardClick}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        </div>
      </div>
    </LoggedInContainer2>
  );
};

const PlaylistView = ({ titleText, songs, handleCardClick, hoveredCard, setHoveredCard }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {titleText}
        </h2>
        <div className="ml-4 h-px bg-gradient-to-r from-purple-400 to-transparent flex-1"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {songs.length > 0 ? (
          songs.map((song) => (
            <Card
              key={song._id}
              song={song}
              onClick={() => handleCardClick(song)}
              isHovered={hoveredCard === song._id}
              onHover={() => setHoveredCard(song._id)}
              onLeave={() => setHoveredCard(null)}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center col-span-full py-12">
            <Icon icon="material-symbols:music-off" className="text-6xl mb-4 mx-auto opacity-50" />
            <p className="text-lg">No songs available</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ song, onClick, isHovered, onHover, onLeave }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group cursor-pointer transition-transform duration-300 ease-in-out"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div className={`
        relative rounded-2xl p-4 transition-all duration-300 ease-in-out overflow-hidden
        bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-sm
        ${isHovered 
          ? 'scale-[1.02] shadow-lg shadow-purple-500/20' 
          : 'scale-100 shadow-md shadow-black/20'}
      `}>
        {/* Image Container */}
        <div className="relative mb-4 rounded-xl aspect-square bg-slate-900 overflow-hidden">
          {!imageLoaded && <div className="absolute inset-0 bg-slate-800 animate-pulse rounded-xl z-0"></div>}
          <img
            className={`w-full h-full object-cover rounded-xl transition-all duration-500 ease-in-out z-0
              ${isHovered ? 'scale-105' : 'scale-100'}
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            src={song.thumbnail}
            alt={song.name}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Subtle Overlay for Better Icon Visibility */}
          <div className={`
            absolute inset-0 bg-black/30 transition-opacity duration-300 pointer-events-none
            ${isHovered ? 'opacity-100' : 'opacity-0'}
            z-10 rounded-xl
          `}></div>

          {/* Play Button */}
          <div className={`
            absolute z-20 transition-all duration-400 ease-in-out
            ${isHovered 
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100 scale-100' 
              : 'bottom-3 right-3 opacity-0 scale-90'}
          `}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 shadow-xl hover:scale-110 transition duration-200">
              <Icon icon="material-symbols:play-arrow" className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Song Info */}
        <div className="space-y-2 z-30 relative">
          <h3 className={`
            font-bold truncate transition-colors duration-300 text-base
            ${isHovered ? 'text-purple-400' : 'text-white'}
          `}>
            {song.name}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            <p className="text-slate-300 text-sm truncate">
              {song.artist?.firstname || "Unknown"} {song.artist?.lastname || "Artist"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoggedInHome;
