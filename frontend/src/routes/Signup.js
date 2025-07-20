import { Icon } from "@iconify/react";
import TextInput from "../components/shared/TextInput";
import PasswordInput from "../components/shared/PassportInput";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelper";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const SignUpComponent = () => {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [showResend, setShowResend] = useState(false);

  const [cookie, setCookie] = useCookies(["token"]);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const signUp = async () => {
    setEmailError("");
    setPasswordError("");
    setServerError("");
    setShowResend(false);

    if (!validateEmail(email)) {
      setEmailError("Enter a valid email (e.g., user@example.com)");
      return;
    }

    if (email !== confirmEmail) {
      setServerError("Emails must match");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (e.g., @$!%*?&)"
      );
      return;
    }

    const body = { email, password, username, firstname, lastname };
    try {
      const { data: responseData, status } = await makeUnauthenticatedPOSTRequest("/auth/register", body);
      if (status === 201) {
        toast.success("Registration successful! Please check your email to verify your account.", {
          autoClose: 5000,
        });
        setShowResend(true);
      } else {
        setServerError(responseData.error || "Failed to create account. Try again.");
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to create account. Try again.";
      setServerError(errorMessage);
      if (errorMessage.includes("Please try a different email")) {
        setShowResend(true);
      }
    }
  };

  const resendVerification = async () => {
    try {
      const { data: responseData, status } = await makeUnauthenticatedPOSTRequest("/auth/resend-verification", { email });
      if (status === 200) {
        toast.success("Verification email resent! Please check your email.", { autoClose: 5000 });
      } else {
        toast.error(responseData.error || "Failed to resend verification email.", { autoClose: 5000 });
      }
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email.", { autoClose: 5000 });
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-6 px-4">
      <div className="w-full max-w-[90%] sm:max-w-sm md:max-w-md bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 border border-purple-500/20">
        <Link to="/home" className="flex items-center justify-center mb-4 hover:opacity-80 transition">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-2">
            <Icon icon="emojione-monotone:musical-score" width="24" className="text-white" />
          </div>
          <h2 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MusicApp
          </h2>
        </Link>

        {serverError && (
          <p className="text-red-400 text-xs mb-3 text-center font-medium bg-black/50 rounded-md py-1.5 px-3">{serverError}</p>
        )}

        <div className="w-full mb-3">
          <TextInput
            label="Email"
            placeholder="Email"
            className="w-full text-black"
            value={email}
            setValue={setEmail}
            labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
            inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
          />
          {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
        </div>

        <div className="w-full mb-3">
          <TextInput
            label="Confirm Email"
            placeholder="Confirm email"
            className="w-full text-black"
            value={confirmEmail}
            setValue={setConfirmEmail}
            labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
            inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
          />
        </div>

        <div className="w-full mb-3">
          <TextInput
            label="Username"
            placeholder="Username"
            className="w-full text-black"
            value={username}
            setValue={setUsername}
            labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
            inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
          />
        </div>

        <div className="w-full mb-3">
          <PasswordInput
            label="Password"
            placeholder="Password"
            className="w-full text-black"
            value={password}
            setValue={setPassword}
            labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
            inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
          />
          {passwordError && <p className="text-red-400 text-xs mt-1">{passwordError}</p>}
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between gap-3 mb-3">
          <div className="w-full sm:w-1/2">
            <TextInput
              label="First Name"
              placeholder="First name"
              className="w-full text-black"
              value={firstname}
              setValue={setFirstName}
              labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
              inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <TextInput
              label="Last Name"
              placeholder="Last name"
              className="w-full text-black"
              value={lastname}
              setValue={setLastName}
              labelClassName="text-gray-300 font-medium text-xs sm:text-sm mb-1"
              inputClassName="bg-white border-purple-500/50 text-black placeholder-gray-500 focus:ring-purple-500 text-xs sm:text-sm py-2 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            signUp();
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-full py-2.5 px-5 w-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          Create Account
        </button>

        {showResend && (
          <div className="mt-3 text-center">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">Didn't receive the verification email?</p>
            <button
              onClick={resendVerification}
              className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium underline"
            >
              Resend Verification Email
            </button>
          </div>
        )}

        <div className="w-full h-px bg-gradient-to-r from-purple-500 to-transparent my-4"></div>

        <p className="text-gray-400 font-medium text-xs sm:text-sm text-center mb-2">
          Already have an account?
        </p>
        <button className="border border-purple-500/50 text-gray-200 font-medium rounded-full py-2.5 px-5 w-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
          <Link to="/login" className="block w-full h-full text-xs sm:text-sm">
            Sign In
          </Link>
        </button>
      </div>
    </div>
  );
};

export default SignUpComponent;