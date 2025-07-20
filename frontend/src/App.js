import "./output.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginComponent from "./routes/Login.js";
import SignUpComponent from "./routes/Signup.js";
import HomeComponent from "./routes/Home";
import LoggedInHome from "./routes/LoggedInHome.js";
import UploadSongs from "./routes/UploadSongs.js";
import MyMusic from "./routes/MyMusic.js";
import SinglePlaylistView from "./routes/SinglePlaylistView.js";
import { useCookies } from "react-cookie";
import songContext from "./context/songContext.js";
import { useState } from "react";
import SearchSong from "./routes/SearchSong.js";
import Library from "./routes/Library.js";
import LikedSongs from "./routes/LikedSongs.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Subscribe from "./routes/Subscribe.js";
import VerifyEmail from "./routes/VerifyEmail.js";

function App() {
  const [currentSong, setCurrentSong] = useState(null);
  const [soundPlayed, setSoundPlayed] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [likedSongs, setLikedSongs] = useState([]);
  const [cookie, setCookie] = useCookies(["token"]);
const [songHistory, setSongHistory] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  return (
    <div className="w-screen h-screen">
      <BrowserRouter>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {cookie.token ? (
          <songContext.Provider
            value={{
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
            }}
          >
            <Routes>
              {/* <Route path="/" element={<HelloComponent />} /> */}
              <Route path="/home" element={<LoggedInHome />} />
              <Route path="/uploadsong" element={<UploadSongs />} />
              <Route path="/mymusic" element={<MyMusic />} />
              <Route path="/searchsong" element={<SearchSong />} />
              <Route path="/collections" element={<Library />} />
              <Route path="/likedsongs" element={<LikedSongs />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/playlist/:playlistId" element={<SinglePlaylistView />} />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </songContext.Provider>
        ) : (
          <Routes>
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/signup" element={<SignUpComponent />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;