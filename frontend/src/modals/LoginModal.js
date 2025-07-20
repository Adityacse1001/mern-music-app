import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PassportInput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";

const LoginModal = ({ setShowLoginModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    setServerError("");
    const data = { email, password };
    try {
      const { data: responseData, status } = await makeUnauthenticatedPOSTRequest("/auth/login", data);
      if (status === 200) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setCookie("token", responseData.token, { path: "/", expires: date });
        toast.success("Login successful!", { autoClose: 3000 });
        navigate("/home");
        setShowLoginModal(false);
      }
    } catch (error) {
      const errorMessage = error.message || "Invalid email or password";
      setServerError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const { data: responseData, status } = await makeUnauthenticatedPOSTRequest("/auth/google-login", { idToken });
      if (status === 200) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setCookie("token", responseData.token, { path: "/", expires: date });
        toast.success("Logged in with Google!", { autoClose: 3000 });
        navigate("/home");
        setShowLoginModal(false);
      }
    } catch (error) {
      const errorMessage = error.message || "Google login failed";
      setServerError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md p-6 relative overflow-y-auto max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-3 right-3 text-gray-300 hover:text-purple-400 transition-colors duration-200"
        >
          <Icon icon="mdi:close" width="24" />
        </button>

        <div className="flex flex-col items-center py-6">
          {/* Header */}
          <h2 className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Sign in to MusicApp
          </h2>

          {/* Server Error */}
          {serverError && (
            <p className="text-red-400 text-xs mb-4 text-center font-medium bg-black/50 rounded-md py-1.5 px-3">
              {serverError}
            </p>
          )}

          {/* Google Sign-In */}
          <button
            onClick={googleLogin}
            disabled={isLoading}
            className={`flex items-center justify-center bg-gradient-to-r from-gray-800 to-slate-800 border border-purple-500/50 rounded-full py-2.5 px-5 w-full mb-4 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Icon icon="logos:google-icon" width="20" className="mr-2" />
            <span className="font-medium text-gray-200 text-sm">
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="w-full flex items-center justify-center my-4">
            <div className="w-1/4 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
            <span className="mx-3 text-gray-400 font-medium text-sm">OR</span>
            <div className="w-1/4 h-px bg-gradient-to-l from-purple-500 to-transparent"></div>
          </div>

          {/* Email Input */}
          <TextInput
            label="Email or Username"
            placeholder="Email or username"
            className="mb-4 w-full text-black"
            value={email}
            setValue={setEmail}
            labelClassName="text-gray-300 font-medium text-sm mb-1"
          />

          {/* Password Input */}
          <PasswordInput
            label="Password"
            placeholder="Password"
            className="mb-6 w-full text-gray-200"
            value={password}
            setValue={setPassword}
            labelClassName="text-gray-300 font-medium text-sm mb-1"
          />

        {/* Sign In Button */}
<button
  onClick={(e) => {
    e.preventDefault();
    login();
  }}
  className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-full py-2.5 px-5 w-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
>
  Sign In
</button>
          {/* Divider before Sign Up */}
          <div className="w-full h-px bg-gradient-to-r from-purple-500 to-transparent my-6"></div>

          {/* Sign Up */}
          <p className="text-gray-400 font-medium text-sm mb-3">New to MusicApp?</p>
          <Link to="/signup" className="w-full block">
            <button
              className="flex items-center justify-center bg-gradient-to-r from-gray-800 to-slate-800 border border-purple-500/50 text-gray-200 font-medium rounded-full py-2.5 px-5 w-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md text-sm"
            >
              <Icon icon="mdi:account-plus" width="18" className="mr-2" />
              Create an Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
