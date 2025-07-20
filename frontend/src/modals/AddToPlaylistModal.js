import { useState, useEffect } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { Icon } from "@iconify/react";

function AddToPlaylistModal({ closeModal, addSongToPlayList, setCreatePlaylistModalOpen }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/playlist/get/me");
      setData(response.data || []);
    };
    getData();
  }, []);

  return (
    <div
      className="absolute z-50 bg-black/50 backdrop-blur-sm h-screen w-screen flex items-center justify-center"
      onClick={closeModal}
    >
      <div
        className="bg-gradient-to-br from-gray-900/90 to-black/90 w-11/12 sm:w-3/4 max-w-sm p-4 sm:p-6 rounded-lg shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 sm:mb-6 text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Select Playlist
          </span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {data.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center text-center text-gray-400 p-4 sm:p-6 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
              onClick={() => {
                closeModal();
                setCreatePlaylistModalOpen(true);
              }}
            >
              <Icon
                icon="material-symbols-light:add-box"
                className="text-purple-500 mb-2"
                fontSize={32}
                smFontSize={40}
              />
              <p className="text-xs sm:text-sm font-medium">No existing playlists</p>
              <p className="text-xs text-gray-500 hover:text-white transition-colors">
                Click to create a new playlist
              </p>
            </div>
          ) : (
            data.map((item) => (
              <PlaylistListComponent
                key={item._id}
                info={item}
                addSongToPlayList={addSongToPlayList}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const PlaylistListComponent = ({ info, addSongToPlayList }) => {
  return (
    <div
      className="w-full flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
      onClick={() => addSongToPlayList(info._id)}
    >
      <div>
        <img
          src={info.thumbnail}
          className="h-10 sm:h-12 w-10 sm:w-12 rounded-md shadow-md object-cover"
          alt="thumbnail"
        />
      </div>
      <div className="flex-1">
        <div className="text-white font-semibold text-xs sm:text-sm truncate">{info.name}</div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;