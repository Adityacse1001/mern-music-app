import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import SingleSongCard from "../components/shared/SingleSongCard";
import LoggedInContainer2 from "../containers/LoggedInContainer2";

function SinglePlaylistView() {
  const [playlistDetails, setPlaylistDetails] = useState({});
  const { playlistId } = useParams();

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/playlist/get/playlist/" + playlistId);
      setPlaylistDetails(response);
    };
    getData();
  }, [playlistId]);

  return (
    <LoggedInContainer2 curActiveScreen="library">
      {playlistDetails._id && (
        <div>
          <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold pt-4 sm:pt-6 px-2 sm:px-4">
            {playlistDetails.name}
          </div>
          <div className="overflow-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
            {playlistDetails.songs && playlistDetails.songs.length > 0 ? (
              playlistDetails.songs.map((item) => (
                <SingleSongCard
                  info={item}
                  key={JSON.stringify(item)}
                  playSound={() => {}}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center text-xs sm:text-sm">No songs in this playlist</p>
            )}
          </div>
        </div>
      )}
    </LoggedInContainer2>
  );
}

export default SinglePlaylistView;