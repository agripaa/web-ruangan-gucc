import Image from 'next/image';
import React from 'react';
import LogoGUCC from '@/assets/Logo GUCC.png';
import { FaHome, FaClock, FaFolder, FaUser } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="w-auto h-screen p-12 flex flex-col justify-between border-r">
      <div className='flex flex-col items-center w-full justify-center'>
        <Image src={LogoGUCC} alt="logo gucc" width={70} className='mb-20'/>
        <nav>
          <ul className="flex flex-col w-16 space-y-6">
            <li className="flex items-center justify-center gap-5 py-3 hover:bg-gray-200 rounded-xl cursor-pointer text-3xl text-[#9F9F9F]">
              <FaHome /> 
            </li>
            <li className="flex items-center justify-center gap-5 py-3 bg-blue-500 text-white rounded-xl cursor-pointer text-2xl">
              <FaClock />
            </li>
            <li className="flex items-center justify-center  gap-5 py-3 hover:bg-gray-200 rounded-xl cursor-pointer text-2xl text-[#9F9F9F]">
              <FaFolder /> 
            </li>
            <li className="flex items-center justify-center  gap-5 py-3 hover:bg-gray-200 rounded-xl cursor-pointer text-2xl text-[#9F9F9F]">
              <FaUser />
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
