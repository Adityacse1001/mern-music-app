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
  } = useContext(songContext);

  const [user, setUser] = useState({});
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await makeAuthenticatedGETRequest("/auth/me");
        if (userResponse && !userResponse.err) {
          setUser({
            firstname: userResponse.firstname || "",
            lastname: userResponse.lastname || "",
          });
        } else {
          toast.error("Failed to fetch user data", { autoClose: 3000 });
        }

        const subResponse = await makeAuthenticatedGETRequest("/auth/subscription-status");
        // console.log("Subscription Response:", subResponse); // Debug log
        if (subResponse && !subResponse.err) {
          // Adjust based on actual response structure
          setIsSubscribed(subResponse.isSubscribed || false); // Direct access, no 'data'
        } else {
          console.error("Subscription fetch failed:", subResponse?.err);
          setIsSubscribed(false); // Default to false on failure
          toast.error("Failed to fetch subscription status", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setIsSubscribed(false); // Default to false on error
        toast.error(error.message || "Authentication error", { autoClose: 3000 });
      }
    };
    fetchUserData();
  }, []);

  const getInitials = () => {
    const firstInitial = user.firstname ? user.firstname[0].toUpperCase() : "";
    const lastInitial = user.lastname ? user.lastname[0].toUpperCase() : "";
    return `${firstInitial}${lastInitial}`;
  };

  const handleLogout = () => {
    removeCookie("token", { path: "/" });
    toast.success("Logged out successfully", { autoClose: 3000 });
    navigate("/home");
  };

  const handleUploadClick = () => {
    if (isSubscribed) {
      navigate("/uploadsongs");
    } else {
      toast.info("Please subscribe to upload songs!", { autoClose: 3000 });
      navigate("/subscribe");
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
    if (response._id) {
      setAddToPlaylistModal(false);
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
      playSound(currentSong.track);
      setIsPaused(false);
    } else {
      pauseSound();
      setIsPaused(true);
    }
  };

  return (
    <div className="h-full w-full bg-black-app">
      {/* Rest of your JSX remains unchanged */}
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
                target={"/search"}
                active={curActiveScreen === "search"}
              />
              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"Your library"}
                target={"/library"}
                active={curActiveScreen === "library"}
              />
              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"My music"}
                target={"/mymusic"}
                active={curActiveScreen === "mymusic"}
              />
            </div>
            <div className="mt-8">
              <IconText
                iconName={"material-symbols-light:add-2-rounded"}
                displayText={"Create Playlist"}
                onClick={() => setCreatePlaylistModal(true)}
              />
              <IconText
                iconName={"line-md:heart-twotone"}
                displayText={"Linked Songs"}
              />
            </div>
          </div>
          <div className="p-5">
            <div className="border border-gray-300 rounded-full text-white w-2/5 flex px-2 py-1 items-center justify-center">
              <Icon icon={"gis:globe-o"} />
              <div className="ml-2 font-semibold text-sm">English</div>
            </div>
          </div>
        </div>
        <div className="h-full w-4/5 bg-black-app overflow-auto">
          <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex gap-4 md:gap-10 items-center justify-end px-4">
            {!isSubscribed && (
              <TextWithHover
                displayText={"Premium"}
                
                active={curActiveScreen === "subscribe"}
                onClick={()=>{navigate("/subscribe")}}
              />
            )}
            <TextWithHover
              displayText={"Upload Song"}
              onClick={handleUploadClick}
              active={curActiveScreen === "uploadsongs"}
            />
            <TextWithHover displayText={"Logout"} onClick={handleLogout} />
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-lg cursor-pointer mr-5">
              {getInitials()}
            </div>
          </div>
          <div className="content p-8 overflow-auto">{children}</div>
        </div>
      </div>
      {currentSong && (
        <div className="h-1/10 w-full bg-black bg-opacity-30 flex text-white items-center px-4">
          <div className="w-1/4 flex">
            <img className="h-14 w-14 flex items-center" src={currentSong.thumbnail} alt="" />
            <div className="flex flex-col justify-center items-center px-2">
              <div className="hover:underline hover:text-gray-500 text-sm cursor-pointer">
                {currentSong.name}
              </div>
              <div className="hover:underline hover:text-gray-500 text-xs cursor-pointer">
                {currentSong.artist.firstname + " " + currentSong.artist.lastname}
              </div>
            </div>
          </div>
          <div className="w-1/2 h-full flex justify-center flex-col items-center">
            <div className="flex justify-between w-1/3 items-center">
              <Icon
                icon="zondicons:shuffle"
                fontSize={20}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
              <Icon
                icon="fluent:previous-16-filled"
                fontSize={20}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
              <Icon
                icon={isPaused ? "gridicons:play" : "gridicons:pause"}
                fontSize={35}
                className="cursor-pointer text-gray-500 hover:text-white"
                onClick={togglePlayPause}
              />
              <Icon
                icon="fluent:next-20-filled"
                fontSize={20}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
              <Icon
                icon="mdi:repeat"
                fontSize={20}
                className="cursor-pointer text-gray-500 hover:text-white"
              />
            </div>
          </div>
          <div className="w-1/4 flex justify-end space-x-4 pr-4 items-center">
            <Icon
              icon="tabler:playlist"
              className="cursor-pointer text-gray-500 hover:text-white"
              fontSize={23}
              onClick={() => setAddToPlaylistModal(true)}
            />
            <Icon
              icon="iconamoon:heart-light"
              className="cursor-pointer text-gray-500 hover:text-white"
              fontSize={23}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoggedInContainer2;