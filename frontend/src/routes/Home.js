import { Icon } from "@iconify/react";
import IconText from "../components/shared/IconText";
import TextWithHover from "../components/shared/TextWithHover";
import { useState, useEffect } from "react";
import LoginModal from "../modals/LoginModal";
import { useNavigate, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { toast } from "react-toastify";

function Home() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cookies] = useCookies(["token"]);
  const [songs, setSongs] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Static fallback data, padded to 8 items
  const focusCardData = [
    {
      title: "Die With A Smile",
      description: "Nero Sachin",
      src: "https://c.saavncdn.com/060/Die-With-A-Smile-English-2024-20240816103634-500x500.jpg",
    },
    {
      title: "Perfect",
      description: "Nero Sachin",
      src: "https://c.saavncdn.com/286/WMG_190295851286-English-2017-500x500.jpg",
    },
    {
      title: "Uptown Funk",
      description: "Nero Sachin",
      src: "https://c.saavncdn.com/145/Uptown-Special-English-2015-150x150.jpg",
    },
    {
      title: "Animals",
      description: "Nero Sachin",
      src: "https://c.saavncdn.com/109/Animals-English-2014-500x500.jpg",
    },
    {
      title: "Faded",
      description: "Nero Sachin",
      src: "https://c.saavncdn.com/981/Faded-English-2015-500x500.jpg",
    },
    {
      title: "Baby",
      description: "Aditya Singh",
      src: "https://c.saavncdn.com/728/My-World-2-0-English-2010-20250315014144-500x500.jpg",
    },
    {
      title: "Gangsta's Paradise",
      description: "Aditya Singh",
      src: "https://c.saavncdn.com/365/Gangsta-s-Paradise-English-1995-20190607041555-500x500.jpg",
    },
    {
      title: "Blinding Lights",
      description: "Aditya Singh",
      src: "https://c.saavncdn.com/077/After-Hours-English-2020-20240207070330-500x500.jpg",
    },
  ];

  useEffect(() => {
    const fetchSongs = async () => {
    
      
        // console.error("Fetch songs error:", error);
        setSongs(
          focusCardData.map((item) => ({
            name: item.title,
            thumbnail: item.src,
            artist: { firstname: item.description.split(" ")[0], lastname: item.description.split(" ")[1] },
          }))
        );
     
    };
    fetchSongs();
  }, []);

  const handleLinkClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #ec4899);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #db2777);
          background-clip: content-box;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8b5cf6 rgba(55, 65, 81, 0.3);
        }
        .sidebar {
          transition: transform 0.3s ease-in-out;
        }
        .dropdown-menu {
          transition: all 0.3s ease-in-out;
          max-height: 0;
          opacity: 0;
          visibility: hidden;
        }
        .dropdown-menu.open {
          max-height: 200px;
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-3/4 sm:w-1/2 md:w-1/5 bg-gradient-to-b from-gray-900 to-black flex flex-col justify-between shadow-2xl z-50 sidebar transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-1/5`}
      >
        <div>
          <div className="logodiv p-4 sm:p-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Icon icon="emojione-monotone:musical-score" width="20" smWidth="24" className="text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-white">MusicApp</span>
            </div>
          </div>
          <div className="px-2 sm:px-3 py-3 sm:py-4 space-y-1 sm:space-y-2">
            <IconText
              iconName={"fluent:home-48-filled"}
              displayText={"Home"}
              active={location.pathname === "/home"}
              onClick={handleLinkClick}
              hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
              className="text-sm sm:text-base"
            />
            <IconText
              iconName={"lets-icons:search-duotone"}
              displayText={"Search"}
              onClick={handleLinkClick}
              hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
              className="text-sm sm:text-base"
            />
            <IconText
              iconName={"iconamoon:playlist-bold"}
              displayText={"Your Library"}
              onClick={handleLinkClick}
              hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
              className="text-sm sm:text-base"
            />
          </div>
          <div className="px-2 sm:px-3 mt-4 sm:mt-6 pt-3 sm:pt-4">
            <IconText
              iconName={"material-symbols-light:add-box"}
              displayText={"Create Playlist"}
              onClick={handleLinkClick}
              hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
              className="text-sm sm:text-base"
            />
            <IconText
              iconName={"line-md:heart-filled"}
              displayText={"Liked Songs"}
              onClick={handleLinkClick}
              hoverClass="group-hover:text-purple-400 group-hover:font-semibold"
              className="text-sm sm:text-base"
            />
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <div className="bg-black/50 rounded-full text-white w-3/4 sm:w-2/5 flex px-2 py-1 items-center justify-center shadow-md hover:shadow-lg transition-all duration-200">
            <Icon icon="tabler:world" className="text-gray-300 text-sm sm:text-base" />
            <div className="ml-1 sm:ml-2 font-semibold text-xs sm:text-sm text-gray-300">English</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full w-full md:w-4/5 bg-gradient-to-b from-gray-800/50 to-gray-900/50 overflow-auto custom-scrollbar">
        {/* Navbar */}
        <div className="navbar w-full h-1/10 bg-gradient-to-r from-gray-900 to-slate-900 flex items-center justify-between sticky top-0 z-50 shadow-lg px-3 sm:px-4">
          <button
            className={`md:hidden text-white focus:outline-none transition-opacity duration-200 ${
              isMobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            onClick={toggleSidebar}
          >
            <Icon
              icon={isSidebarOpen ? "mdi:close" : "material-symbols:menu-open"}
              width="24"
              smWidth="28"
              className="transition-transform duration-200"
            />
          </button>
          <div className="md:hidden flex items-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1.5 sm:p-2 rounded-md">
                <Icon icon="emojione-monotone:musical-score" width="16" smWidth="20" className="text-white" />
              </div>
              <span className="text-sm sm:text-base font-bold text-white">MusicApp</span>
            </div>
          </div>
          <div className="hidden md:flex gap-3 sm:gap-4 items-center justify-end flex-1 mr-4 sm:mr-6">
            <TextWithHover displayText={"Premium"} onClick={handleLinkClick} className="text-sm sm:text-base" />
            <TextWithHover displayText={"Support"} onClick={handleLinkClick} className="text-sm sm:text-base" />
            <TextWithHover displayText={"Download"} onClick={handleLinkClick} className="text-sm sm:text-base" />
            <TextWithHover
              displayText={"Sign Up"}
              onClick={() => navigate("/signup")}
              className="text-sm sm:text-base"
            />
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex items-center font-semibold text-white cursor-pointer shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </div>
          </div>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <Icon
              icon={isMobileMenuOpen ? "mdi:close" : "material-symbols:menu"}
              width="24"
              smWidth="28"
              className="transition-transform duration-200"
            />
          </button>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`md:hidden w-full bg-gradient-to-b from-gray-900 to-slate-900 shadow-lg z-40 dropdown-menu absolute top-[10%] left-0 ${
            isMobileMenuOpen ? "open" : ""
          }`}
        >
          <div className="flex flex-col items-center p-3 sm:p-4 space-y-2 sm:space-y-2.5 max-w-md mx-auto">
            <TextWithHover
              displayText={"Premium"}
              onClick={handleLinkClick}
              className="text-sm sm:text-base w-full text-center py-1 hover:bg-gray-800/50 rounded-md"
            />
            <TextWithHover
              displayText={"Support"}
              onClick={handleLinkClick}
              className="text-sm sm:text-base w-full text-center py-1 hover:bg-gray-800/50 rounded-md"
            />
            <TextWithHover
              displayText={"Download"}
              onClick={handleLinkClick}
              className="text-sm sm:text-base w-full text-center py-1 hover:bg-gray-800/50 rounded-md"
            />
            <TextWithHover
              displayText={"Sign Up"}
              onClick={() => {
                navigate("/signup");
                setIsMobileMenuOpen(false);
              }}
              className="text-sm sm:text-base w-full text-center py-1 hover:bg-gray-800/50 rounded-md"
            />
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg px-4 sm:px-5 py-1.5 sm:py-2 font-semibold text-white cursor-pointer shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base w-full text-center"
              onClick={() => {
                setShowLoginModal(true);
                setIsMobileMenuOpen(false);
              }}
            >
              Sign In
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          <PlaylistView
            titleText="Featured Songs"
            songs={songs.slice(0, 4)}
            handleLinkClick={handleLinkClick}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
          <PlaylistView
            titleText="New Releases"
            songs={songs.slice(4, 8)}
            handleLinkClick={handleLinkClick}
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
          />
        </div>
      </div>

      {showLoginModal && <LoginModal setShowLoginModal={setShowLoginModal} />}
    </div>
  );
}

const PlaylistView = ({ titleText, songs, handleLinkClick, hoveredCard, setHoveredCard }) => {
  return (
    <div className="mb-6 sm:mb-8 md:mb-10">
      <div className="flex items-center mb-3 sm:mb-4 md:mb-5">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {titleText}
        </h2>
        <div className="ml-2 sm:ml-3 md:ml-4 h-px bg-gradient-to-r from-purple-400 to-transparent flex-1"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {songs.length > 0 ? (
          songs.map((song) => (
            <Card
              key={song._id || song.name}
              song={song}
              onClick={handleLinkClick}
              isHovered={hoveredCard === (song._id || song.name)}
              onHover={() => setHoveredCard(song._id || song.name)}
              onLeave={() => setHoveredCard(null)}
            />
          ))
        ) : (
          <div className="text-gray-400 text-center col-span-full py-6 sm:py-8 md:py-10">
            <Icon icon="material-symbols:music-off" className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 mx-auto opacity-50" />
            <p className="text-sm sm:text-base md:text-lg">Please sign in to view songs</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Card = ({ song, onClick, isHovered, onHover, onLeave }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group cursor-pointer transition-transform duration-300 ease-in-out"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <div
        className={`
          relative rounded-lg p-2 sm:p-3 md:p-4 transition-all duration-300 ease-in-out overflow-hidden
          bg-gradient-to-br from-slate-800/90 to-slate-900/95 backdrop-blur-sm
          ${isHovered ? "scale-[1.02] shadow-md shadow-purple-500/20" : "scale-100 shadow-sm shadow-black/20"}
        `}
      >
        {/* Image Container */}
        <div className="relative mb-2 sm:mb-3 md:mb-4 rounded-md aspect-square bg-slate-900 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-800 animate-pulse rounded-md z-0"></div>
          )}
          <img
            className={`w-full h-full object-cover rounded-md transition-all duration-500 ease-in-out z-0
              ${isHovered ? "scale-105" : "scale-100"}
              ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            src={song.thumbnail || "https://via.placeholder.com/150"}
            alt={song.name || "Song"}
            onLoad={() => setImageLoaded(true)}
          />
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity duration-300 pointer-events-none z-10 rounded-md
              ${isHovered ? "opacity-100" : "opacity-0"}`}
          ></div>
          <div
            className={`
              absolute z-20 transition-all duration-400 ease-in-out
              ${isHovered ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100 scale-100" : "bottom-1 sm:bottom-2 right-1 sm:right-2 opacity-0 scale-90"}
            `}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2 sm:p-3 md:p-3.5 shadow-md hover:scale-110 transition duration-200">
              <Icon icon="material-symbols:play-arrow" className="text-white text-base sm:text-xl md:text-2xl" />
            </div>
          </div>
        </div>
        {/* Song Info */}
        <div className="space-y-1 sm:space-y-1.5 md:space-y-2 z-30 relative">
          <h3
            className={`font-bold truncate transition-colors duration-300 text-xs sm:text-sm md:text-base
              ${isHovered ? "text-purple-400" : "text-white"}`}
          >
            {song.name || "Unknown Song"}
          </h3>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            <p className="text-white text-xs sm:text-sm truncate">
              {song.artist
                ? `${song.artist.firstname || "Unknown"} ${song.artist.lastname || "Artist"}`
                : "Unknown Artist"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;