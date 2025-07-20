import { useState } from "react";
import { makeAuthenticatedPOSTRequest } from "../utils/serverHelper";
import { useNavigate } from "react-router-dom";
import TextInput from "../components/shared/TextInput";
import CloudinaryUpload from "../components/shared/CloudinaryUpload";
import { toast } from "react-toastify";
import LoggedInContainer2 from "../containers/LoggedInContainer2";

function UploadSongs() {
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [songFileName, setSongFileName] = useState("");
  const [useSongUrl, setUseSongUrl] = useState(false); // New state for toggling input method
  const navigate = useNavigate();

  const submitSong = async () => {
    if (!name || !thumbnail || !playlistUrl) {
      toast.error("Please fill all fields", { autoClose: 3000 });
      return;
    }
    const data = { name, thumbnail, track: playlistUrl };
    const response = await makeAuthenticatedPOSTRequest("/song/create", data);
    if (response.error) {
      toast.error(response.error || "Couldn't create song", { autoClose: 3000 });
      return;
    }
    toast.success("Song created successfully", { autoClose: 3000 });
    navigate("/home");
  };

  return (
    <LoggedInContainer2 curActiveScreen="uploadsong">
      <div className="content p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 text-white">
          Upload Your Music
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-2/3 space-y-4 sm:space-y-0 sm:space-x-3">
          <div className="w-full sm:w-1/2">
            <TextInput
              label="Name"
              labelClassName="text-white text-sm sm:text-base"
              placeholder="Song Name"
              value={name}
              setValue={setName}
              className="text-xs sm:text-sm"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <TextInput
              label="Thumbnail"
              labelClassName="text-white text-sm sm:text-base"
              placeholder="Thumbnail URL"
              value={thumbnail}
              setValue={setThumbnail}
              className="text-xs sm:text-sm"
            />
          </div>
        </div>
        <div className="py-4 sm:py-5">
          <div className="flex items-center mb-4">
            <button
              className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-600 transition-all duration-200"
              onClick={() => setUseSongUrl(!useSongUrl)}
            >
              {useSongUrl ? "Upload Song File" : "Enter Song URL"}
            </button>
          </div>
          {useSongUrl ? (
            <TextInput
              label="Song URL"
              labelClassName="text-white text-sm sm:text-base"
              placeholder="Song URL"
              value={playlistUrl}
              setValue={setPlaylistUrl}
              className="text-xs sm:text-sm w-full sm:w-1/3"
            />
          ) : songFileName ? (
            <div className="bg-white rounded-lg p-2 sm:p-3 w-full sm:w-1/3 text-xs sm:text-sm text-black truncate">
              {songFileName.substring(0, 24)}
            </div>
          ) : (
            <CloudinaryUpload
              setUrl={setPlaylistUrl}
              setFileName={setSongFileName}
            />
          )}
        </div>
        <button
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center px-3 sm:px-4 py-1.5 sm:py-2 justify-center rounded-lg text-xs sm:text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg min-w-[120px]"
          onClick={submitSong}
        >
          Submit Song
        </button>
      </div>
    </LoggedInContainer2>
  );
}

export default UploadSongs;