import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PassportInput"; // Assuming typo; should be PasswordInput
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

// Import Google Fonts (optional, add to your index.html or CSS)
import "../styles/loginModal.css"; // Custom CSS for fonts and additional styling (see below)

const LoginModal = ({ setShowLoginModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const login = async () => {
    const data = { email, password };
    const response = await makeUnauthenticatedPOSTRequest("/auth/login", data);
    // console.log(response);
    const token = response.token;

    if (response && !response.error) {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      setCookie("token", token, { path: "/", expires: date });
      toast.success("Login successful!", { autoClose: 3000 });
      navigate("/home");
      setShowLoginModal(false); // Close modal on success
    } else {
      toast.error("Wrong email address or password", { autoClose: 3000 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 relative overflow-y-auto max-h-[90vh] border border-gray-800">
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <Icon icon="mdi:close" width="24" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Login to your account</p>

          {/* Google Sign-in Button (Placeholder) */}
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg py-2.5 px-4 mb-4 flex items-center justify-center border border-gray-700">
            <Icon icon="flat-color-icons:google" width="20" className="mr-2" />
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>

          {/* Email Input */}
          <TextInput
            label="Email address"
            placeholder="Your email address"
            className="mb-4 w-full"
            value={email}
            setValue={setEmail}
            labelClassName="text-gray-400"
            inputClassName="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
          />

          {/* Password Input */}
          <PasswordInput
            label="Your Password"
            placeholder="Your password"
            className="mb-4 w-full"
            value={password}
            setValue={setPassword}
            labelClassName="text-gray-400"
            inputClassName="bg-gray-800 text-white border-gray-700 placeholder-gray-500"
          />

          {/* Forgot Password Link */}
          <div className="text-right mb-4">
            <Link to="#" className="text-green-500 hover:text-green-400 text-sm">
              Forgot your password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              login();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 px-4 mb-4 transition duration-300"
          >
            Sign in
          </button>

          {/* Magic Link and Sign Up */}
          <div className="text-center text-gray-500 text-sm mb-2">
            Send a magic link email
          </div>
          <div className="text-center text-gray-500 text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-500 hover:text-green-400">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;