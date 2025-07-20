import { Icon } from "@iconify/react";
import IconText from "../components/shared/IconText";
import TextWithHover from "../components/shared/TextWithHover";
import {
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { Howl } from "howler";
import songContext from "../context/songContext";
import { useNavigate } from "react-router-dom";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import {
  makeAuthenticatedPOSTRequest,
  makeAuthenticatedGETRequest,
} from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

function LoggedInContainer2({ children, curActiveScreen }) {
  const [createPlaylistModalOpen, setCreatePlaylistModal] = useState(false);
  const [addToplaylistModal, setAddToPlaylistModal] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    currentSong,
    setCurrentSong,
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
    likedSongs,
    setLikedSongs,
    songHistory,
    setSongHistory,
    currentSongIndex,
    setCurrentSongIndex,
  } = useContext(songContext);

  const [user, setUser] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSongLiked, setIsSongLiked] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await makeAuthenticatedGETRequest("/auth/me");
        if (!userResponse.error) {
          setUser({
            firstname: userResponse.firstname || "",
            lastname: userResponse.lastname || "",
          });
        } else {
          toast.error("Failed to fetch user data", { autoClose: 3000 });
        }

        const subResponse = await makeAuthenticatedGETRequest(
          "/auth/subscription-status"
        );
        if (!subResponse.error) {
          setIsSubscribed(subResponse.isSubscribed || false);
        } else {
          toast.error("Failed to fetch subscription status", {
            autoClose: 3000,
          });
        }

        const likedResponse = await makeAuthenticatedGETRequest("/song/liked");
        if (!likedResponse.error) {
          setLikedSongs(likedResponse.data || []);
        } else {
          toast.error("Failed to fetch liked songs", { autoClose: 3000 });
        }
      } catch (error) {
        toast.error(error.message || "Authentication error", {
          autoClose: 3000,
        });
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!currentSong?._id) {
      setIsSongLiked(false);
      return;
    }
    const isLiked = likedSongs.some((song) => song._id === currentSong._id);
    setIsSongLiked(isLiked);
  }, [currentSong, likedSongs]);

  const getInitials = () => {
    const firstInitial = user.firstname ? user.firstname[0].toUpperCase() : "";
    const lastInitial = user.lastname ? user.lastname[0].toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const handleLogout = () => {
    if (soundPlayed) {
      soundPlayed.stop();
      soundPlayed.unload();
      setSoundPlayed(null);
      setCurrentSong(null);
      setIsPaused(true);
    }
    removeCookie("token", {});
    toast.success("Logged out successfully", { autoClose: 3000 });
    navigate("/home");
    setIsMobileMenuOpen(false);
  };

  const handleUploadClick = () => {
    if (isSubscribed) {
      navigate("/uploadsong");
    } else {
      toast.info("Please subscribe to upload songs!", { autoClose: 3000 });
      navigate("/subscribe");
    }
    setIsMobileMenuOpen(false);
  };

  const handleLikeSong = async () => {
    if (!currentSong?._id) {
      toast.error("No song selected to like", { autoClose: 3000 });
      return;
    }
    try {
      const response = await makeAuthenticatedPOSTRequest("/song/like", {
        songId: currentSong._id,
      });
      if (!response.error) {
        const { liked } = response;
        setIsSongLiked(liked);
        const likedResponse = await makeAuthenticatedGETRequest("/song/liked");
        if (!likedResponse.error) {
          setLikedSongs(likedResponse.data || []);
          toast.success(liked ? "Song liked!" : "Song unliked!", {
            autoClose: 3000,
          });
        } else {
          toast.error("Failed to refresh liked songs", { autoClose: 3000 });
        }
      } else {
        toast.error(response.error || "Failed to update like status", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error(error.message || "Failed to update like status", {
        autoClose: 3000,
      });
    }
  };

  const firstUpdate = useRef(true);

  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (!currentSong) {
      return;
    }
    changeSong(currentSong.track);
  }, [currentSong]);

  const playSound = () => {
    if (!soundPlayed) {
      return;
    }
    soundPlayed.play();
    setIsPaused(false);
  };

  const pauseSound = () => {
    if (soundPlayed) {
      soundPlayed.pause();
      setIsPaused(true);
    }
  };

  const changeSong = (songSrc) => {
    if (soundPlayed) {
      soundPlayed.stop();
      soundPlayed.unload();
      setSoundPlayed(null);
    }
    let sound = new Howl({
      src: [songSrc],
      html5: true,
      volume: volume,
      loop: isLooping,
      onend: () => {
        if (isLooping) {
          sound.play();
        } else {
          handleNextSong();
        }
      },
    });
    setSoundPlayed(sound);
    sound.play();
    setIsPaused(false);
  };

  const handleNextSong = async () => {
    try {
      const response = await makeAuthenticatedGETRequest("/song/random");
      if (!response.error && response._id) {
        setCurrentSong(response);
        const newHistory = [
          ...songHistory.slice(0, currentSongIndex + 1),
          response,
        ];
        if (newHistory.length > 50) newHistory.shift();
        setSongHistory(newHistory);
        setCurrentSongIndex(newHistory.length - 1);
      } else {
        toast.error(response.error || "No songs available", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch next song", { autoClose: 3000 });
    }
  };

  const handlePreviousSong = () => {
    if (currentSongIndex <= 0) {
      toast.info("No previous song available", { autoClose: 2000 });
      return;
    }
    const prevIndex = currentSongIndex - 1;
    const prevSong = songHistory[prevIndex];
    setCurrentSong(prevSong);
    setCurrentSongIndex(prevIndex);
    changeSong(prevSong.track);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (soundPlayed) {
      soundPlayed.loop(!isLooping);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (soundPlayed) {
      soundPlayed.volume(newVolume);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return "material-symbols:volume-off";
    if (volume < 0.5) return "material-symbols:volume-down";
    return "material-symbols:volume-up";
  };

  const togglePlayPause = () => {
    if (isPaused) {
      playSound();
    } else {
      pauseSound();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
          background-clip: content-box;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(55, 65, 81, 0.3);
        }
        .sidebar {
          transition: transform 0.3s ease-in-out;
        }
        .dropdown-menu {
          transition: all 0.3s ease-in-out;
          max-height: 0;
          opacity: 0;
          visibility: hidden;
        }
        .dropdown-menu.open {
          max-height: 160px;
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      {createPlaylistModalOpen && (
        <CreatePlaylistModal closeModal={() => setCreatePlaylistModal(false)} />
      )}
      {addToplaylistModal && (
        <AddToPlaylistModal
          closeModal={() => setAddToPlaylistModal(false)}
          addSongToPlayList={addSongToPlayList}
          setCreatePlaylistModalOpen={setCreatePlaylistModal}
        />
      )}

      <div className={`w-full ${currentSong ? "h-9/10" : "h-full"} flex`}>
        <div
          className={`fixed top-0 left-0 h-full w-3/4 sm:w-1/2 md:w-1/5 bg-gradient-to-b from-gray-900 to-black flex flex-col justify-between shadow-2xl z-50 sidebar transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static md:w-1/5`}
        >
          <div>
            <Link to="/home" className="block logodiv p-4 sm:p-5  transition mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Icon
                    icon="emojione-monotone:musical-score"
                    width="20"
                    className="text-white"
                  />
                </div>
                <span className="text-base sm:text-lg font-bold text-white">
                  MusicApp
                </span>
              </div>
            </Link>

            <div className="px-2 sm:px-3 py-3 sm:py-4 space-y-1 sm:space-y-2">
              <IconText
                iconName={"fluent:home-48-filled"}
                displayText={"Home"}
                target={"/home"}
                active={curActiveScreen === "home"}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
              <IconText
                iconName={"lets-icons:search-duotone"}
                displayText={"Search"}
                target={"/searchsong"}
                active={curActiveScreen === "searchsong"}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
              <IconText
                iconName={"iconamoon:playlist"}
                displayText={"Your collection"}
                target="/collections"
                active={curActiveScreen === "collection"}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"My music"}
                target={"/mymusic"}
                active={curActiveScreen === "mymusic"}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
              <IconText
                iconName={"line-md:heart-filled"}
                displayText={"Liked Songs"}
                target={"/likedsongs"}
                active={curActiveScreen === "likedsong"}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
            </div>
            <div className="px-2 sm:px-3 mt-4 sm:mt-6 pt-3 sm:pt-4">
              <IconText
                iconName={"material-symbols-light:add-box"}
                displayText={"Create Playlist"}
                onClick={() => setCreatePlaylistModal(true)}
                hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
                className="text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="bg-black/50 rounded-full text-white w-3/4 sm:w-2/5 flex px-2 py-1 items-center justify-center shadow-md hover:shadow-lg transition-all duration-200">
              <Icon
                icon="tabler:world"
                className="text-gray-300 text-sm sm:text-base"
              />
              <div className="ml-1 sm:ml-2 font-semibold text-xs sm:text-sm text-gray-300">
                English
              </div>
            </div>
          </div>
        </div>

        <div className="h-full w-full md:w-4/5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 flex flex-col">
          <div className="navbar w-full h-1/10 bg-gradient-to-r from-gray-900 to-slate-900 flex items-center justify-between sticky top-0 z-50 shadow-lg px-2 sm:px-3">
            <button
              className={`md:hidden text-white focus:outline-none transition-opacity duration-200 ${
                isMobileMenuOpen
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
              onClick={toggleSidebar}
            >
              <Icon
                icon={
                  isSidebarOpen ? "mdi:close" : "material-symbols:menu-open"
                }
                width="20"
                smWidth="24"
                className="transition-transform duration-200"
              />
            </button>
            <div className="md:hidden flex items-center">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 sm:p-1.5 rounded-md">
                  <Icon
                    icon="emojione-monotone:musical-score"
                    width="14"
                    smWidth="18"
                    className="text-white"
                  />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white">
                  MusicApp
                </span>
              </div>
            </div>
            <div className="hidden md:flex gap-3 sm:gap-4 items-center justify-end flex-1 mr-4 sm:mr-6">
              {!isSubscribed && (
                <TextWithHover
                  displayText={"Premium"}
                  onClick={() => navigate("/subscribe")}
                  active={curActiveScreen === "subscribe"}
                  className="text-sm sm:text-base"
                />
              )}
              <TextWithHover
                displayText={"Upload Song"}
                onClick={handleUploadClick}
                active={curActiveScreen === "uploadsong"}
                className="text-sm sm:text-base"
              />
              <TextWithHover
                displayText={"Logout"}
                onClick={handleLogout}
                className="text-sm sm:text-base"
              />
              <div className="relative group">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  title="My Account"
                >
                  {getInitials()}
                </div>
              </div>
            </div>
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <Icon
                icon={isMobileMenuOpen ? "mdi:close" : "material-symbols:menu"}
                width="20"
                smWidth="24"
                className="transition-transform duration-200"
              />
            </button>
          </div>

          <div
            className={`md:hidden w-full bg-gradient-to-b from-gray-900 to-slate-900 shadow-lg z-40 dropdown-menu absolute top-[10%] left-0 ${
              isMobileMenuOpen ? "open" : ""
            }`}
          >
            <div className="flex flex-col items-center p-2 sm:p-3 space-y-1.5 sm:space-y-2 max-w-sm mx-auto">
              {!isSubscribed && (
                <TextWithHover
                  displayText={"Premium"}
                  onClick={() => {
                    navigate("/subscribe");
                    setIsMobileMenuOpen(false);
                  }}
                  active={curActiveScreen === "subscribe"}
                  className="text-xs sm:text-sm w-full text-center py-0.5 sm:py-1 hover:bg-gray-800/50 rounded-md"
                />
              )}
              <TextWithHover
                displayText={"Upload Song"}
                onClick={handleUploadClick}
                active={curActiveScreen === "uploadsong"}
                className="text-xs sm:text-sm w-full text-center py-0.5 sm:py-1 hover:bg-gray-800/50 rounded-md"
              />
              <TextWithHover
                displayText={"Logout"}
                onClick={handleLogout}
                className="text-xs sm:text-sm w-full text-center py-0.5 sm:py-1 hover:bg-gray-800/50 rounded-md"
              />
            </div>
          </div>

          <div className="content flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto custom-scrollbar">
            {children}
          </div>
        </div>
      </div>

      {currentSong && (
        <>
          <div className="md:hidden w-full h-1/10 bg-black/70 backdrop-blur-xl text-white flex items-center px-2 sm:px-3 shadow-2xl">
            <div className="w-1/4 flex items-center gap-2 sm:gap-3">
              <div className="relative group">
                <img
                  src={currentSong.thumbnail}
                  alt="currentSongThumb"
                  className="h-10 w-10 rounded-lg shadow-md object-cover"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            <div className="w-1/2 flex justify-center items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <Icon
                  icon="material-symbols:skip-previous-rounded"
                  className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  fontSize={20}
                  onClick={handlePreviousSong}
                />
                <button
                  onClick={togglePlayPause}
                  className="bg-white text-black p-1.5 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Icon
                    icon={
                      isPaused
                        ? "material-symbols:play-arrow"
                        : "material-symbols:pause"
                    }
                    fontSize={18}
                  />
                </button>
                <Icon
                  icon="material-symbols:skip-next-rounded"
                  className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  fontSize={20}
                  onClick={handleNextSong}
                />
              </div>
            </div>
            <div className="w-1/4 flex justify-end items-center gap-2 sm:gap-3">
              <Icon
                icon="material-symbols:playlist-add"
                className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                fontSize={18}
                onClick={() => setAddToPlaylistModal(true)}
              />
              <Icon
                icon="material-symbols:favorite"
                className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                  isSongLiked
                    ? "text-red-500 hover:text-red-400"
                    : "text-gray-400 hover:text-white"
                }`}
                fontSize={18}
                onClick={handleLikeSong}
              />
            </div>
          </div>

          <div className="hidden md:flex w-full h-1/10 bg-black/70 backdrop-blur-xl text-white items-center px-4 sm:px-6 shadow-2xl">
            <div className="w-1/4 flex items-center gap-3 sm:gap-4">
              <div className="relative group">
                <img
                  src={currentSong.thumbnail}
                  alt="currentSongThumb"
                  className="h-12 sm:h-14 w-12 sm:w-14 rounded-lg shadow-lg object-cover"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-medium hover:underline cursor-pointer text-white truncate">
                  {currentSong.name}
                </div>
                <div className="text-xs text-gray-400 hover:underline cursor-pointer hover:text-white transition-colors truncate">
                  {currentSong.artist?.firstname || "Unknown"}{" "}
                  {currentSong.artist?.lastname || "Artist"}
                </div>
              </div>
            </div>
            <div className="w-1/2 flex justify-center items-center">
              <div className="flex items-center gap-4 sm:gap-6">
                <Icon
                  icon="material-symbols:shuffle"
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110"
                  fontSize={18}
                  onClick={() =>
                    toast.info("Shuffle not implemented", { autoClose: 2000 })
                  }
                />
                <Icon
                  icon="material-symbols:skip-previous-rounded"
                  className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  fontSize={24}
                  onClick={handlePreviousSong}
                />
                <button
                  onClick={togglePlayPause}
                  className="bg-white text-black p-2 rounded-full hover:scale-110 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Icon
                    icon={
                      isPaused
                        ? "material-symbols:play-arrow"
                        : "material-symbols:pause"
                    }
                    fontSize={20}
                  />
                </button>
                <Icon
                  icon="material-symbols:skip-next-rounded"
                  className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  fontSize={24}
                  onClick={handleNextSong}
                />
                <Icon
                  icon={
                    isLooping
                      ? "material-symbols:repeat-on"
                      : "material-symbols:repeat"
                  }
                  className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                    isLooping
                      ? "text-purple-500 hover:text-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                  fontSize={18}
                  onClick={toggleLoop}
                />
              </div>
            </div>
            <div className="w-1/4 flex justify-end items-center gap-3 sm:gap-4">
              <Icon
                icon="material-symbols:playlist-add"
                className="cursor-pointer text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                fontSize={20}
                onClick={() => setAddToPlaylistModal(true)}
              />
              <Icon
                icon="material-symbols:favorite"
                className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                  isSongLiked
                    ? "text-red-500 hover:text-red-400"
                    : "text-gray-400 hover:text-white"
                }`}
                fontSize={20}
                onClick={handleLikeSong}
              />
              <div className="relative">
                <Icon
                  icon={getVolumeIcon()}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200 hover:scale-110"
                  fontSize={20}
                  onClick={() => {
                    const newVolume = volume > 0 ? 0 : 0.7;
                    setVolume(newVolume);
                    if (soundPlayed) soundPlayed.volume(newVolume);
                  }}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                />
                <div
                  className={`absolute bottom-full right-0 mb-4 w-24 transition-all duration-300 transform origin-bottom ${
                    showVolumeSlider
                      ? "opacity-100 scale-y-100"
                      : "opacity-0 scale-y-0"
                  }`}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-xl">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${
                          volume * 100
                        }%, #4b5563 ${volume * 100}%, #4b5563 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  function addSongToPlayList(playlistId) {
    if (!currentSong?._id) {
      toast.error("No song selected", { autoClose: 3000 });
      return;
    }
    makeAuthenticatedPOSTRequest("/playlist/add/song", {
      playlistId,
      songId: currentSong._id,
    }).then((response) => {
      if (!response.error) {
        setAddToPlaylistModal(false);
        toast.success("Song added to playlist!", { autoClose: 2000 });
      } else {
        toast.error(response.error || "Failed to add song to playlist", {
          autoClose: 3000,
        });
      }
    });
  }
}

export default LoggedInContainer2;
