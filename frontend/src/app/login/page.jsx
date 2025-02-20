"use client";
import React, { useState } from "react";
import Image from "next/image";
import LogoGUCC from "@/assets/Logo GUCC.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {/* Card Container */}
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image src={LogoGUCC} alt="GUCC Logo" width={80} height={80} />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {/* Login Form */}
        <form>
          {/* Username Field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="Enter your password"
              />
              {/* Eye Icon to Toggle Password Visibility */}
              <span
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
