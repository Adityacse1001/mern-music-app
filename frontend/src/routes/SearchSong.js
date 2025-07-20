import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import SingleSongCard from "../components/shared/SingleSongCard";
import LoggedInContainer2 from "../containers/LoggedInContainer2";

function SearchSong() {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [songData, setSongData] = useState([]);

  const searchingSong = async () => {
    const response = await makeAuthenticatedGETRequest("/song/get/songname/" + searchText);
    // console.log(response);
    setSongData(response.data || []);
    setSearchText("");
  };

  return (
    <LoggedInContainer2 curActiveScreen="searchsong">
      <div className="w-full py-4 sm:py-6 px-2 sm:px-4 text-white">
        <div
          className={`w-full sm:w-2/3 md:w-1/3 rounded-full text-xs sm:text-sm bg-gray-800 flex px-3 sm:px-4 py-2 sm:py-3 space-x-2 sm:space-x-3 items-center ${
            isInputFocused ? "border border-white" : ""
          }`}
        >
          <Icon
            icon="material-symbols:search-rounded"
            width="16"
            smWidth="20"
            className="text-gray-300 min-w-[40px]"
          />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full bg-gray-800 focus:outline-none text-xs sm:text-sm"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchingSong();
              }
            }}
          />
        </div>
        <div className="overflow-auto p-2 sm:p-4 space-y-2 sm:space-y-3">
          <div className="text-white text-sm sm:text-base">
            Search result for key "<span className="font-semibold">{searchText}</span>"
          </div>
          {songData.map((item) => (
            <SingleSongCard
              info={item}
              key={JSON.stringify(item)}
              playSound={() => {}}
            />
          ))}
        </div>
      </div>
    </LoggedInContainer2>
  );
}

export default SearchSong;