import { Icon } from "@iconify/react";
import IconText from "../components/shared/IconText";
import TextWithHover from "../components/shared/TextWithHover";
import { useContext, useState, useEffect, useLayoutEffect, useRef } from "react";
import { Howl } from "howler";
import songContext from "../context/songContext";
import { useNavigate } from "react-router-dom";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import { makeAuthenticatedPOSTRequest, makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

function LoggedInContainer2({ children, curActiveScreen }) {
  const [createPlaylistModalOpen, setCreatePlaylistModal] = useState(false);
  const [addToplaylistModal, setAddToPlaylistModal] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const {
    currentSong,
    setCurrentSong,
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
    likedSongs,
    setLikedSongs,
  } = useContext(songContext);

  const [user, setUser] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSongLiked, setIsSongLiked] = useState(false);

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

        const subResponse = await makeAuthenticatedGETRequest("/auth/subscription-status");
        if (!subResponse.error) {
          setIsSubscribed(subResponse.isSubscribed || false);
        } else {
          console.error("Sub fetch error:", subResponse.error);
          setIsSubscribed(false);
          toast.error("Failed to fetch subscription status", { autoClose: 3000 });
        }

        const likedResponse = await makeAuthenticatedGETRequest("/song/liked");
        if (!likedResponse.error) {
          setLikedSongs(likedResponse.data || []);
        } else {
          console.error("Liked songs error:", likedResponse.error);
          toast.error("Failed to fetch liked songs", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        toast.error(error.message || "Authentication error", { autoClose: 3000 });
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!currentSong?._id) {
      setIsSongLiked(false);
      return;
    }
    const isLiked = likedSongs.some(song => song._id === currentSong._id);
    setIsSongLiked(isLiked);
  }, [currentSong, likedSongs]);

  const getInitials = () => {
    const firstInitial = user.firstname ? user.firstname[0].toUpperCase() : "";
    const lastInitial = user.lastname ? user.lastname[0].toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const handleLogout = () => {
    removeCookie("token", {});
    toast.success("Logged out successfully", { autoClose: 3000 });
    navigate("/home");
  };

  const handleUploadClick = () => {
    if (isSubscribed) {
      navigate("/collections");
    } else {
      toast.info("Please subscribe to upload songs!", { autoClose: 3000 });
      navigate("/subscribe");
    }
  };

  const handleLikeSong = async () => {
    if (!currentSong?._id) {
      toast.error("No song selected to like", { autoClose: 3000 });
      return;
    }
    try {
      const response = await makeAuthenticatedPOSTRequest("/song/like", { songId: currentSong._id });
      // console.log("Like song response:", response);
      if (!response.error) {
        const { liked } = response;
        setIsSongLiked(liked);
        // Refetch likedSongs to update UI
        const likedResponse = await makeAuthenticatedGETRequest("/song/liked");
        if (!likedResponse.error) {
          setLikedSongs(likedResponse.data || []);
          toast.success(liked ? "Song liked!" : "Song unliked!", { autoClose: 3000 });
        } else {
          toast.error("Failed to refresh liked songs", { autoClose: 3000 });
        }
      } else {
        console.error("Like song error:", response.error);
        toast.error(response.error || "Failed to update like status", { autoClose: 3000 });
      }
    } catch (error) {
      console.error("Like song error:", error.message, { songId: currentSong._id });
      toast.error(error.message || "Failed to update like status", { autoClose: 3000 });
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
  }, [currentSong && currentSong.track]);

  const playSound = () => {
    if (!soundPlayed) {
      return;
    }
    soundPlayed.play();
  };

  const addSongToPlayList = async (playlistId) => {
    const songId = currentSong._id;
    const payload = { playlistId: playlistId, songId };
    const response = await makeAuthenticatedPOSTRequest("/playlist/add/song", payload);
    if (!response.error) {
      setAddToPlaylistModal(false);
      toast.success("Song added to playlist!", { autoClose: 2000 });
    } else {
      toast.error(response.error || "Failed to add song to playlist", { autoClose: 3000 });
    }
  };

  const changeSong = (songSrc) => {
    if (soundPlayed) {
      soundPlayed.stop();
    }
    let sound = new Howl({
      src: [songSrc],
      html5: true,
    });
    setSoundPlayed(sound);
    sound.play();
    setIsPaused(false);
  };

  const pauseSound = () => {
    soundPlayed.pause();
  };

  const togglePlayPause = () => {
    if (isPaused) {
      playSound();
      setIsPaused(false);
    } else {
      pauseSound();
      setIsPaused(true);
    }
  };

  return (
    <div className="h-full w-full bg-black-app">
      {createPlaylistModalOpen && (
        <CreatePlaylistModal closeModal={() => setCreatePlaylistModal(false)} />
      )}
      {addToplaylistModal && (
        <AddToPlaylistModal
          closeModal={() => setAddToPlaylistModal(false)}
          addSongToPlayList={addSongToPlayList}
        />
      )}
      <div className={`w-full ${currentSong ? "h-9/10" : "h-full"} flex`}>
        <div className="h-full w-1/5 bg-black flex flex-col justify-between">
          <div>
            <div className="logodiv p-5">
              <Icon icon="emojione-monotone:musical-score" width="165" className="text-white" />
            </div>
            <div>
              <IconText
                iconName={"fluent:home-48-filled"}
                displayText={"Home"}
                target={"/home"}
                active={curActiveScreen === "home"}
              />
              <IconText
                iconName={"lets-icons:search-duotone"}
                displayText={"Search"}
                active={curActiveScreen === "searchsong"}
                target={"/searchsong"}
              />
              <IconText
                iconName={"iconamoon:playlist"}
                displayText={"Your collection"}
                active={curActiveScreen === "collection"}
                target="/collections"
              />
              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"My music"}
                target={"/mymusic"}
                active={curActiveScreen === "mymusic"}
              />
              <IconText
                iconName={"line-md:heart-filled"}
                displayText={"Liked Songs"}
                active={curActiveScreen === "likedsong"}
                target={"/likedsongs"}
              />
            </div>
            <div className="mt-4">
              <IconText
                iconName={"material-symbols-light:add-box"}
                displayText={"Create Playlist"}
                onClick={() => setCreatePlaylistModal(true)}
              />
            </div>
          </div>
          <div className="pb-5">
            <IconText iconName={"tabler:world"} displayText={"English"} />
          </div>
        </div>
        <div className="h-full w-4/5 bg-black-app overflow-auto">
          <div className="navbar w-full h-1/10 bg-black bg-opacity-25 flex items-center justify-end">
            <div className="flex gap-2 md:gap-10 items-center mr-5">
              {!isSubscribed && (
                <TextWithHover
                  displayText={"Premium"}
                  onClick={() => navigate("/subscribe")}
                  active={curActiveScreen === "subscribe"}
                />
              )}
              <TextWithHover
                displayText={"Upload Song"}
                onClick={handleUploadClick}
                active={curActiveScreen === "uploadsong"}
              />
              <TextWithHover displayText={"Logout"} onClick={handleLogout} />
              <div
                className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                title="My Account"
              >
                {getInitials()}
              </div>
            </div>
          </div>
          <div className="content p-8 pt-0 overflow-auto">{children}</div>
        </div>
      </div>
      {currentSong && (
        <div className="w-full h-1/10 bg-black bg-opacity-30 text-white flex items-center px-4">
          <div className="w-1/4 flex items-center">
            <img
              src={currentSong.thumbnail}
              alt="currentSongThumb"
              className="h-14 w-14 rounded"
            />
            <div className="pl-4">
              <div className="text-sm hover:underline cursor-pointer">
                {currentSong.name}
              </div>
              <div className="text-xs text-gray-500 hover:underline cursor-pointer">
                {currentSong.artist?.firstname || "Unknown"} {currentSong.artist?.lastname || "Artist"}
              </div>
            </div>
          </div>
          <div className="w-1/2 flex justify-center items-center flex-col">
            <div className="w-1/3 flex justify-between items-center">
              <Icon
                icon="material-symbols:shuffle"
                className="cursor-pointer text-gray-500 hover:text-white"
                fontSize={24}
              />
              <Icon
                icon="material-symbols:skip-previous-rounded"
                className="cursor-pointer text-gray-500 hover:text-white"
                fontSize={30}
              />
              <Icon
                icon={isPaused ? "material-symbols:play-circle" : "material-symbols:pause-circle"}
                className="cursor-pointer text-gray-500 hover:text-white"
                fontSize={40}
                onClick={togglePlayPause}
              />
              <Icon
                icon="material-symbols:skip-next-rounded"
                className="cursor-pointer text-gray-500 hover:text-white"
                fontSize={30}
              />
              <Icon
                icon="material-symbols:repeat"
                className="cursor-pointer text-gray-500 hover:text-white"
                fontSize={24}
              />
            </div>
          </div>
          <div className="w-1/4 flex justify-end items-center gap-2">
            <Icon
              icon="material-symbols:playlist-add"
              className="cursor-pointer text-gray-500 hover:text-white"
              fontSize={24}
              onClick={() => setAddToPlaylistModal(true)}
            />
            <Icon
              icon="material-symbols:favorite"
              className={`cursor-pointer ${isSongLiked ? "text-green-500" : "text-gray-500 hover:text-white"}`}
              fontSize={24}
              onClick={handleLikeSong}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoggedInContainer2;