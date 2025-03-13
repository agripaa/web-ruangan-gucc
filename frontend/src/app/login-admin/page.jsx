"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    router.push(process.env.NEXT_PUBLIC_API_LOGIN_ADMIN)
  }, [])
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      Redirecting...
    </div>
  );
};

export default Login;
