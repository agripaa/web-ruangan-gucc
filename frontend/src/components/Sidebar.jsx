"use client";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { getProfile } from '@/services/user';
import LogoGUCC from '@/assets/Logo GUCC.png';
import { FaHome, FaClock, FaFolder, FaUser } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6"; 

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [tokenChecked, setTokenChecked] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getProfile(); // Jika token valid
        setTokenValid(true);
      } catch (error) {
        console.error("Unauthorized - Redirecting to login", error);
        localStorage.removeItem("token");
        setTokenValid(false);
      } finally {
        setTokenChecked(true); // Tandai bahwa pengecekan selesai
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (tokenChecked && !tokenValid) {
      router.push("/login");
    }
  }, [tokenChecked, tokenValid, router]);

  if (!tokenChecked) {
    return null; // Jangan render apapun sebelum pengecekan selesai
  }

  if (!tokenValid) {
    return null; // Jangan render Sidebar jika token tidak valid
  }

  const navItems = [
    { name: "Home", href: "/admin", icon: <FaHome /> },
    { name: "Incoming Reports", href: "/admin/laporan-masuk", icon: <FaClock /> },
    { name: "Reports", href: "/admin/laporan", icon: <FaFolder /> },
    { name: "Campus", href: "/admin/campus", icon: <FaBuildingUser /> },
    { name: "Profile", href: "/admin/profile", icon: <FaUser /> }
  ];

  return (
    <aside className="w-auto h-screen p-12 flex flex-col justify-between border-r">
      <div className="flex flex-col items-center w-full justify-center">
        <Image src={LogoGUCC} alt="logo gucc" width={70} className="mb-20" />
        <nav>
          <ul className="flex flex-col w-16 space-y-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <div
                    className={`flex items-center justify-center gap-5 py-3 rounded-xl cursor-pointer text-2xl 
                      ${pathname === item.href ? "bg-blue-500 text-white" : "hover:bg-gray-200 text-[#9F9F9F]"}`}
                  >
                    {item.icon}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
