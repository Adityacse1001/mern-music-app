import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { makeUnauthenticatedPOSTRequest } from "../utils/serverHelper";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification token");
        toast.error("Invalid verification token", { autoClose: 5000 });
        return;
      }
      try {
        const { data, status } = await makeUnauthenticatedPOSTRequest("/auth/verify", { token });
        if (status === 200) {
          setStatus("success");
          setMessage(data.message);
          toast.success(data.message, { autoClose: 5000 });
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed, please try again");
          toast.error(data.error || "Verification failed", { autoClose: 5000 });
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Verification failed, please try again");
        toast.error(error.message || "Verification failed", { autoClose: 5000 });
      }
    };
    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black py-6 px-4">
      <div className="w-full max-w-[90%] sm:max-w-sm md:max-w-md bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl shadow-2xl p-5 sm:p-6 border border-purple-500/20">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-2">
            <Icon icon="emojione-monotone:musical-score" width="24" className="text-white" />
          </div>
          <h2 className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MusicApp
          </h2>
        </div>
        <div className="text-center">
          {status === "verifying" && (
            <p className="text-gray-300 text-xs sm:text-sm">Verifying your email...</p>
          )}
          {status === "success" && (
            <>
              <p className="text-green-400 text-xs sm:text-sm mb-3">{message}</p>
              <p className="text-gray-400 text-xs sm:text-sm">Redirecting to login...</p>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-red-400 text-xs sm:text-sm mb-3">{message}</p>
              <button
                onClick={() => navigate("/signup")}
                className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium underline"
              >
                Try registering again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;