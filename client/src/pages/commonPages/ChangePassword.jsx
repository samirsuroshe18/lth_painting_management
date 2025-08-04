import { useState } from "react";
import { changePassword } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { Lock, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";

const ChangePassword = () => {
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const dispatch = useDispatch();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePasswords = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "New passwords do not match",
        })
      );
      return false;
    }
    if (formData.newPassword.length < 6) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Password must be at least 6 characters long",
        })
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.currentPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "All fields are required",
        })
      );
      return;
    }

    if (!validatePasswords()) return;

    try {
      setLoading(true);
      const res = await changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: res.data.message || "Password changed successfully",
        })
      );
      setIsSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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

  const isFormValid = formData.currentPassword && formData.newPassword && formData.confirmPassword;

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: "", color: "" },
      { strength: 1, label: "Very Weak", color: "bg-red-500" },
      { strength: 2, label: "Weak", color: "bg-orange-500" },
      { strength: 3, label: "Fair", color: "bg-yellow-500" },
      { strength: 4, label: "Good", color: "bg-blue-500" },
      { strength: 5, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Change Password
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Update your password to keep your account secure.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-10">
            {!isSuccess ? (
              <div className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label 
                    htmlFor="currentPassword" 
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      disabled={isLoading}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl 
                               text-gray-900 placeholder-gray-500 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 ease-in-out
                               hover:border-gray-300"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label 
                    htmlFor="newPassword" 
                    className="block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      disabled={isLoading}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl 
                               text-gray-900 placeholder-gray-500 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 ease-in-out
                               hover:border-gray-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {passwordStrength.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      disabled={isLoading}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl 
                               text-gray-900 placeholder-gray-500 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-all duration-200 ease-in-out
                               hover:border-gray-300"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="flex items-center space-x-2 mt-1">
                      {formData.newPassword === formData.confirmPassword ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Passwords match</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-red-600">
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !isFormValid}
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
                      <span>Updating Password...</span>
                    </div>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            ) : (
              /* Success State */
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Password Updated Successfully
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Your password has been updated successfully. Your account is now more secure.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 
                           font-medium text-sm transition-colors duration-200"
                >
                  <span>Change password again</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Password Security Tips</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Use at least 8 characters with mixed case letters</li>
            <li>• Include numbers and special characters</li>
            <li>• Avoid using personal information or common words</li>
            <li>• Don't reuse passwords from other accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;