import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PassportInput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const LoginComponent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const login = async () => {
    setServerError("");
    const data = { email, password };
    try {
      const { data: responseData, status } = await makeUnauthenticatedPOSTRequest("/auth/login", data);
      if (status === 200) {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        setCookie("token", responseData.token, { path: "/", expires: date });
        toast.success("Signed in successfully!", { autoClose: 3000 });
        navigate("/home");
      }
    } catch (error) {
      const errorMessage = error.message || "Invalid email or password";
      setServerError(errorMessage);
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-10">
      <div className="w-full max-w-sm sm:max-w-md bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-purple-500/20">
        {/* Title Section */}
      <Link to="/home" className="flex items-center justify-center mb-6 hover:opacity-80 transition">
  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-2">
    <Icon icon="emojione-monotone:musical-score" width="24" className="text-white" />
  </div>
  <h2 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
    MusicApp
  </h2>
</Link>

        {/* Error Message */}
        {serverError && (
          <p className="text-red-400 text-xs mb-4 text-center font-medium bg-black/50 rounded-md py-1.5 px-3">
            {serverError}
          </p>
        )}

        {/* Email Input */}
        <div className="w-full mb-4">
          <TextInput
            label="Email or Username"
            placeholder="Email or username"
            className="w-full text-black"
            value={email}
            setValue={setEmail}
            labelClassName="text-gray-300 font-medium text-sm mb-2"
          />
        </div>

        {/* Password Input */}
        <div className="w-full mb-6">
          <PasswordInput
            label="Password"
            placeholder="Password"
            className="w-full text-black"
            value={password}
            setValue={setPassword}
            labelClassName="text-gray-300 font-medium text-sm mb-2"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            login();
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-full py-2.5 px-5 w-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-md"
        >
          Sign In
        </button>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-purple-500 to-transparent my-6"></div>

        {/* Sign up Redirect */}
        <p className="text-gray-400 font-medium text-sm text-center mb-3">
          New to MusicApp?
        </p>
        <button className="border border-purple-500/50 text-gray-200 font-medium rounded-full py-2.5 px-5 w-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
          <Link to="/signup" className="block w-full h-full text-sm text-center">
            Create an Account
          </Link>
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;
