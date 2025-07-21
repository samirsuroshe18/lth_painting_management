// import React, { useState } from "react";
// import { googleLoginUser } from "../../api/authApi";
// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";
// import { Loader2 } from "lucide-react";
// import { useDispatch } from 'react-redux'
// import { login } from "../../redux/slices/authSlice";
// import { useNavigate } from "react-router-dom";
// import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
// import { handleAxiosError } from "../../utils/handleAxiosError";
// import SnackBar from "../../utils/SnackBar";
// import { motion } from "framer-motion";
// import iitBombayLogo from "../../assets/college.png";

// const Login = () => {
  // const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  // const handleSuccess = async (response) => {
  //   const token = response.credential;
  //   const decoded = jwtDecode(token);

    // try {
    //   const res = await googleLoginUser(decoded, setLoading, dispatch);
    //   dispatch(login(res.data));
    //   navigate('/');
    // } catch (error) {
    //   setLoading(false);
    //   dispatch(showNotificationWithTimeout({ show: true, type: "error", message: handleAxiosError(error) }));
    // }
  // };
  // const handleError = (error) => {
  //   dispatch(showNotificationWithTimeout({show:true, type:"error", message:handleAxiosError(error)}));
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[#131314] text-amber-500">
  //       <div className="text-center">
  //         <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
  //         <p className="text-lg">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

//   return (
//     <>
//       <h1>Login screen</h1>
//     </>
//   );
// };

// export default Login;


import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/authApi';
import { login } from '../../redux/slices/authSlice';
import { handleAxiosError } from '../../utils/handleAxiosError';
import { showNotificationWithTimeout } from '../../redux/slices/notificationSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isRemember: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await loginUser(formData);
      dispatch(showNotificationWithTimeout({ show: true, type: "success", message: res.data.message }));
      dispatch(login(res.data));
      navigate('/');
    } catch (error) {
      setIsLoading(false);
      console.log("Login error:", handleAxiosError(error));
      dispatch(showNotificationWithTimeout({ show: true, type: "error", message: handleAxiosError(error) }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#0082A2] via-[#FFE600] to-[#FF8700] p-4">

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
         */}<div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">


          {/* Header */}
          <div className="text-center mb-8">
           <div className="w-16 h-16 mx-auto mb-4">
            <img
                src="/lt-logo.svg"
                alt="Logo"
                className="w-full h-full object-contain"
             />

 {/* <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"> */}
              {/* <Lock className="w-8 h-8 text-white" /> */}
            </div>
            {/* <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your account to continue</p> */}
            <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
            <p className="text-gray-700">Sign in to your account to continue</p>

          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                {errors.general}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              {/* <div className="text-sm font-medium text-gray-200 block"> */}
              <div className="text-sm font-medium text-black block">

                Email Address
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                {/* <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  } rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your email"
                /> */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-500' : 'border-black/20'
                  } rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:focus:ring-blue-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your email"
                />

              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              {/* <div className="text-sm font-medium text-gray-200 block"> */}
                <div className="text-sm font-medium text-black block">

                Password
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                {/* <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  } rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200`}
                  placeholder="Enter your password"
                /> */}
                  <input
                     type={showPassword ? 'text' : 'password'}
                     name="password"
                     value={formData.password}
                     onChange={handleInputChange}
                     className={`block w-full pl-10 pr-12 py-3 border ${
                       errors.password ? 'border-red-500' : 'border-black/20'
                     } rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200`}
                     placeholder="Enter your password"
                  />

                {/* <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button> */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-blue-700 transition duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>

              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* <input
                  type="checkbox"
                  name="isRemember"
                  checked={formData.isRemember}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                /> */}
                <input
                  type="checkbox"
                  name="isRemember"
                  checked={formData.isRemember}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#009ff6] accent-[#009ff6] bg-white border-gray-300 rounded focus:ring-[#009ff6] focus:ring-2"
                />

                <span className="ml-2 text-sm text-black-300">Remember me</span>
              </div>
              <button
                type="button"
                className="text-sm text-black-400 hover:text-blue-300 transition duration-200"
              >
                Forgot password?
              </button>
            </div>
              
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              // className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              className="w-full bg-[#009ff6] hover:bg-[#0085cc] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>

        </div>

        {/* Decorative Elements */}
        {/* <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-500/20 rounded-full blur-xl"></div> */}
      </div>
    </div>
  );
};

export default Login;