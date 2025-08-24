import { useState } from "react";
import { forgotPassword } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import SnackBar from "../../components/commonComponents/SnackBar";

const ForgotPassword = () => {
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      const res = await forgotPassword(email);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: res.data.message,
        })
      );
      setIsSubmitted(true);
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            No worries! Enter your email address and we'll send you a reset
            link.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10">
            {!isSubmitted ? (
              <div className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl 
                               text-gray-900 placeholder-gray-500 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 ease-in-out
                               hover:border-gray-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !email.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                           text-white font-semibold py-3.5 px-6 rounded-xl
                           hover:from-blue-700 hover:to-indigo-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transform transition-all duration-200 ease-in-out
                           hover:shadow-lg hover:-translate-y-0.5
                           active:translate-y-0 active:shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            ) : (
              /* Success State */
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Check Your Email
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We've sent a password reset link to <strong>{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 
                           font-medium text-sm transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Try another email</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 
                         transition-colors duration-200 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            For your security, reset links expire after 24 hours. If you don't
            receive an email, check your spam folder.
          </p>
        </div>
      </div>

      <SnackBar />
    </div>
  );
};

export default ForgotPassword;
