import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { makeAuthenticatedPOSTRequest, makeAuthenticatedGETRequest } from "../utils/serverHelper";
import { toast } from "react-toastify";
import LoggedInContainer2 from "../containers/LoggedInContainer2";

const stripePromise = loadStripe("pk_test_51R40RlBDjDvdnksFUnedOgljk3UxrDoRmwwgpOPwvjcsQBmhiwIviM46xsq499nXsFc0fW0A5f6rjlMUvHHkATa7001C9WYBYD");

const Subscribe = () => {
  const [cookie] = useCookies(["token"]);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await makeAuthenticatedGETRequest("/auth/me");
      setEmail(userData.email);
    };
    fetchUserData();

    const params = new URLSearchParams(location.search);
    if (params.get("success")) {
      toast.success("Subscription successful! You can now upload songs.", { autoClose: 3000 });
      navigate("/home");
    } else if (params.get("cancel")) {
      setPaymentError("Payment was canceled or failed. Please try again.");
    }
  }, [navigate, location]);

  const handleSubscribe = async (plan) => {
    if (loadingPlan) return;
    setLoadingPlan(plan);
    setPaymentError(null);
    try {
      const response = await makeAuthenticatedPOSTRequest("/payment/create-checkout-session", { plan });
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");
      const result = await stripe.redirectToCheckout({ sessionId: response.id });
      if (result.error) {
        setPaymentError(result.error.message);
      }
    } catch (error) {
      setPaymentError("An error occurred. Please try again.");
      console.error("Subscription Error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    { name: "Monthly", price: 9.99, plan: "monthly" },
    { name: "6 Months", price: 49.99, plan: "6months" },
    { name: "Yearly", price: 99.99, plan: "yearly" },
  ];

  return (
    <LoggedInContainer2 curActiveScreen="subscribe">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-4xl mx-auto py-6 sm:py-8 px-2 sm:px-4 md:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          Choose Your Subscription Plan
        </h2>
        {paymentError && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white p-3 sm:p-4 rounded-lg sm:rounded-xl mb-6 sm:mb-8 text-center shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm">{paymentError}</span>
            <button
              onClick={() => setPaymentError(null)}
              className="text-xs sm:text-sm bg-black/50 px-2 sm:px-3 py-1 rounded-lg hover:bg-black/70 transition-all duration-200 min-w-[80px]"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.plan}
              className="bg-gradient-to-br from-gray-900/90 to-black/90 p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-800/50"
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <p className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">${plan.price.toFixed(2)} USD</p>
              <ul className="text-xs sm:text-sm text-gray-300 mb-4 sm:mb-6 space-y-1 sm:space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 text-sm">✓</span> Unlimited song uploads
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 text-sm">✓</span> Access to premium features
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 text-sm">✓</span>
                  {plan.name === "Yearly" ? "Best value!" : "Flexible billing"}
                </li>
              </ul>
              <button
                onClick={() => handleSubscribe(plan.plan)}
                disabled={loadingPlan === plan.plan}
                className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg text-white text-xs sm:text-sm font-semibold transition-all duration-200 min-w-[100px] ${
                  loadingPlan === plan.plan
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:shadow-lg"
                }`}
              >
                {loadingPlan === plan.plan ? "Processing..." : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </LoggedInContainer2>
  );
};

export default Subscribe;