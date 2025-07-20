import { Icon } from "@iconify/react";
import IconText from "../components/shared/IconText";
import TextWithHover from "../components/shared/TextWithHover";
import { Children, useContext, useState } from "react";
import { Howl } from "howler";
import { useEffect, useLayoutEffect, useRef } from "react";
import songContext from "../context/songContext";
import { Link, Navigate, useNavigate } from "react-router-dom";
import CreatePlaylistModal from "../modals/CreatePlaylistModal";
import AddToPlaylistModal from "../modals/AddToPlaylistModal";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelper";
// import { Icon } from "@iconify/react";
function LoggedInContainer({ children ,curActiveScreen }) {
  const [createPlaylistModalOpen, setCreatePlaylistModal]= useState(false);
  const [addToplaylistModal, setAddToPlaylistModal]= useState(false);
  const {
    currentSong,
    setCurrentSong,
    soundPlayed,
    setSoundPlayed,
    isPaused,
    setIsPaused,
  } = useContext(songContext);
  // console.log(soundPlayed);

  // logic to prevent multiple render while changing the route\

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

  // *****adding song to playlist Moda here*******
  const addSongToPlayList= async (playlistId)=>{
      const songId=currentSong._id;
      const playload={playlistId:playlistId,songId};
     
      const response=  await makeAuthenticatedPOSTRequest("/playlist/add/song", playload);
       if(response._id){
        setAddToPlaylistModal(false);
       }
  }
  // whenever we click on a new song the old song is removed and new song is played
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
      { createPlaylistModalOpen && <CreatePlaylistModal closeModal={()=>{setCreatePlaylistModal(false)}} />}
      { addToplaylistModal && <AddToPlaylistModal closeModal={()=>{setAddToPlaylistModal(false)}}  addSongToPlayList={addSongToPlayList}/>}
      <div className={`w-full ${currentSong ? "h-9/10" : "h-full"}   flex`}>
        {/* the first div will be the left panel */}
        <div className="h-full w-1/5 bg-black flex flex-col justify-between">
          <div>
            <div className="logodiv p-5 ">
              <Icon icon="logos:spotify" width="165" />
            </div>
            <div>
              <IconText
                iconName={"fluent:home-48-filled"}
                displayText={"Home"}
                target={"/home"}
                active={curActiveScreen==="home"}
              />

              <IconText
                iconName={"lets-icons:search-duotone"}
                displayText={"Search"}
                target={"/search"}
                active={curActiveScreen==="search"}
              />

              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"Your library"}
                target={"/library"}
                active={curActiveScreen==="library"}
              />
              <IconText
                iconName={"iconamoon:playlist-bold"}
                displayText={"My music"}
                target={"/mymusic"}
                active={curActiveScreen==="mymusic"}
              />
            </div>
            <div className="mt-8">
              <IconText
                iconName={"material-symbols-light:add-2-rounded"}
                displayText={"Create Playlist"}
                onClick={()=>{
                  setCreatePlaylistModal(true); 
                 }}
              />
              <IconText
                iconName={"line-md:heart-twotone"}
                displayText={"Linked Songs"}
              />
            </div>
          </div>
          {/* footer button */}
          <div className="p-5 ">
            <div className="border border-gray-300 rounded-full text-white w-2/5 flex px-2 py-1 items-center justify-center ">
              <Icon icon={"gis:globe-o"} />
              <div className="ml-2 font-semibold text-sm">English</div>
            </div>
          </div>
        </div>

        {/* the second div wil be the right panel  */}
        <div className="h-full w-4/5 bg-black-app overflow-auto">
          <div className="navbar w-full h-1/10 bg-black bg-opacity-30 flex gap-10 items-center justify-end">
            <TextWithHover displayText={"Premium"} />
            <TextWithHover displayText={"Support"} />
            <TextWithHover displayText={"Download"} />
            <TextWithHover displayText={"Upload Song"} />
            <div className="border border-gray-500 rounded-full w-10 h-10 px-4  py-2  flex items-center font-semibold justify-center mr-5 bg-white cursor-pointer">
              AS
            </div>
          </div>
          <div className="content  p-8 overflow-auto">{children}</div>
        </div>
      </div>
      {/* this div is the current playing song   */}
      {currentSong && (
        <div className="h-1/10 w-full bg-black bg-opacity-30 flex text-white items-center px-4 ">
          <div className="w-1/4 flex">
            <img
              className="h-14 w-14 flex items-center "
              src={currentSong.thumbnail}
              alt=""
            />
            <div className=" flex flex-col justify-center items-center px-2">
              <div className="hover:underline hover:text-gray-500 text-sm cursor-pointer">
                {/*  ?? */}
                {currentSong.name}
              </div>
              <div className="hover:underline hover:text-gray-500 text-xs cursor-pointer">
                {currentSong.artist.firstname +
                  " " +
                  currentSong.artist.lastname}
              </div>
            </div>
          </div>

          <div className="w-1/2  h-full flex   justify-center  flex-col items-center">
            <div className="flex justify-between w-1/3 items-center">
              {/* controls for the player */}
              <Icon
                icon="zondicons:shuffle"
                fontSize={20}
                className="cursor-pointer text-gray-500  hover:text-white"
              />
              <Icon
                icon="fluent:previous-16-filled"
                fontSize={20}
                className="cursor-pointer text-gray-500  hover:text-white"
              />
              <Icon
                icon={isPaused ? "gridicons:play" : "gridicons:pause"}
                fontSize={35}
                className="cursor-pointer text-gray-500  hover:text-white"
                onClick={() => {
                  togglePlayPause();
                }}
              />
              <Icon
                icon="fluent:next-20-filled"
                fontSize={20}
                className="cursor-pointer text-gray-500  hover:text-white"
              />
              {/* <Icon icon="solar:play-bold" fontSize={30}  className="cursor-pointer text-gray-500  hover:text-white"/> */}
              <Icon
                icon="mdi:repeat"
                fontSize={20}
                className="cursor-pointer text-gray-500  hover:text-white"
              />
            </div>

            {/* <div>progress bar</div> */}
          </div>
          <div className="w-1/4  flex justify-end space-x-4 pr-4 items-centerr"> 
          <Icon icon="tabler:playlist"  className="cursor-pointer text-gray-500  hover:text-white"  fontSize={23} onClick={()=>{setAddToPlaylistModal(true)}}/>
          <Icon icon="iconamoon:heart-light"  className="cursor-pointer text-gray-500  hover:text-white"  fontSize={23} />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoggedInContainer;
