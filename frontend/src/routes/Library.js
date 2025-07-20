import React, { useState, useEffect } from "react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { useNavigate } from "react-router-dom";
import LoggedInContainer2 from "../containers/LoggedInContainer2";

function Library() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest("/playlist/get/me");
      setData(response.data || []);
    };
    getData();
  }, []);

  return (
    <LoggedInContainer2 curActiveScreen="collection">
      <div className="text-white text-lg sm:text-xl md:text-2xl font-semibold pt-4 sm:pt-6 px-2 sm:px-4">
        My Playlist
      </div>
      <div className="py-4 sm:py-5 px-2 sm:px-4 grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.length > 0 ? (
          data.map((item) => (
            <Card
              key={item._id}
              title={item.name}
              description=""
              src={item.thumbnail}
              playlistId={item._id}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center text-xs sm:text-sm col-span-full py-4 sm:py-6">
            No Playlists found
          </div>
        )}
      </div>
    </LoggedInContainer2>
  );
}

const Card = ({ title, description, src, playlistId }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-gradient-to-br from-gray-900/90 to-black/90 p-3 sm:p-4 rounded-lg cursor-pointer shadow-md hover:shadow-lg hover:bg-gray-800/50 transition-all duration-200"
      onClick={() => navigate("/playlist/" + playlistId)}
    >
      <div className="py-3 sm:py-4 flex-1">
        <img
          className="w-full h-24 sm:h-32 object-cover rounded-md"
          src={src}
          alt={title}
        />
      </div>
      <div className="text-white font-semibold text-xs sm:text-sm truncate">{title}</div>
      <div className="text-gray-500 text-xs truncate">{description}</div>
    </div>
  );
};

export default Library;