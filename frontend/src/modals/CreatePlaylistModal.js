import React, { useState } from "react";
import TextInput from "../components/shared/TextInput";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelper.js";
import { toast } from "react-toastify";

function CreatePlaylistModal({ closeModal }) {
  const [playlistName, setPlaylistName] = useState("");
  const [playlistThumbnail, setPlaylistThumbnail] = useState("");

  const createPlaylist = async () => {
    if (!playlistName) {
      toast.error("Please enter a playlist name", { autoClose: 3000 });
      return;
    }
    const response = await makeAuthenticatedPOSTRequest("/playlist/create", {
      name: playlistName,
      thumbnail: playlistThumbnail,
      songs: [],
    });
    if (response._id) {
      closeModal();
      toast.success("Playlist created successfully!", { autoClose: 3000 });
    } else {
      toast.error(response.error || "Failed to create playlist", { autoClose: 3000 });
    }
  };

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
            Create Playlist
          </span>
        </div>
        <div className="space-y-4 sm:space-y-5 flex flex-col items-center">
          <TextInput
            label="Name"
            labelClassName="text-white text-sm sm:text-base font-medium"
            placeholder="Playlist Name"
            value={playlistName}
            setValue={setPlaylistName}
            className="text-xs sm:text-sm"
          />
          <TextInput
            label="Thumbnail"
            labelClassName="text-white text-sm sm:text-base font-medium"
            placeholder="Thumbnail URL (optional)"
            value={playlistThumbnail}
            setValue={setPlaylistThumbnail}
            className="text-xs sm:text-sm"
          />
          <button
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg min-w-[100px]"
            onClick={createPlaylist}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;