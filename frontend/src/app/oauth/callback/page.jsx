"use client";
import { login } from '../../../services/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [dots, setDots] = useState("");

  const handleVerify = async () => {
    try {
      const data = await login(token);
      localStorage.setItem("token", data.token);
      router.push('/admin');
    } catch (err) {
      console.error("Verifikasi gagal:", err);
      router.push('/login-admin-manual');
    }
  };

  useEffect(() => {
    if (token) handleVerify();
    else router.push('/login-admin-manual');
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500); // kecepatan ketik

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 text-xl font-semibold">
      Verifying{dots}
    </div>
  );
};

export default Page;
