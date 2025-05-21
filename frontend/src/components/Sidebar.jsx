"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import LogoGUCC from '../assets/Logo GUCC.png';
import { FaHome, FaClock, FaFolder, FaUser } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6"; 

const Sidebar = () => {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsNavigating(false); // Stop loading saat route sudah berubah
  }, [pathname]);
  

  const navItems = [
    { name: "Home", href: "/admin", icon: <FaHome /> },
    { name: "Incoming Reports", href: "/admin/laporan-masuk", icon: <FaClock /> },
    { name: "Reports", href: "/admin/laporan", icon: <FaFolder /> },
    { name: "Campus", href: "/admin/campus", icon: <FaBuildingUser /> },
    { name: "Profile", href: "/admin/profile", icon: <FaUser /> }
  ];

  return (
    <>
    {isNavigating && (
      <div className="fixed inset-0 bg-white bg-opacity-70 z-[9999] flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )}

      <aside className="w-auto h-screen p-12 flex flex-col justify-between border-r sticky top-0 bg-white">
        <div className="flex flex-col items-center w-full justify-center">
          <Image src={LogoGUCC} alt="logo gucc" width={70} className="mb-20" />
          <nav>
            <ul className="flex flex-col w-16 space-y-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <div
                      onClick={() => {
                        if (isActive) return; // Jangan lakukan apa-apa jika sedang aktif
                        setIsNavigating(true);
                        router.push(item.href);
                      }}
                      className={`flex items-center justify-center gap-5 py-3 rounded-xl text-2xl 
                        ${isActive ? "bg-blue-500 text-white cursor-default" : "hover:bg-gray-200 text-[#9F9F9F] cursor-pointer"}`}
                    >
                      {item.icon}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
