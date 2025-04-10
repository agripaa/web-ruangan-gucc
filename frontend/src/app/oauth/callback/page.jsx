"use client"
import { login } from '../../../services/auth';
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { useEffect } from 'react';

const page = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleVerify = async() => {
      try {
        const data = await login(token);
        localStorage.setItem("token", data.token);
        router.push('/admin');
      } catch (err) {
        console.log(err)
        setError(err.error || "Login gagal, periksa kembali username dan password.");
      }
    }

    useEffect(()=> {
      handleVerify();
    }, [])
    
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
        Verifying...
    </div>
  )
}

export default page