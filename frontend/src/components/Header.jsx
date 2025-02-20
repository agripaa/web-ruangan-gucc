import React from 'react';
import { FaBell, FaPlus, FaChevronDown } from "react-icons/fa";
import Image from 'next/image';
import LogoGunadarma from "@/assets/Universitas Gunadarma.png";

const Header = () => {
  return (
    <header className="w-full flex justify-between items-center p-5 px-7 bg-white">
      <div className='w-full'>
        <div className='flex items-center w-full justify-between py-8'>
          <div className='flex items-center'>
            <Image src={LogoGunadarma} alt="logo gunadarma" width={35} />
            <h1 className="text-md font-medium ml-2">UG Network Assistance</h1>
          </div>
          <div className='flex items-center'>
            <FaBell className="text-gray-600 text-2xl cursor-pointer mr-6" />
            <button className='text-white bg-red-600 cursor-pointer hover:bg-red-800 py-2 px-4 font-semibold rounded-xl'>Logout</button>
          </div>
        </div>

        <div className='flex w-full justify-between items-center'>
          <div>
            <h1 className="text-4xl font-medium mb-3 tracking-normal">Selamat Siang!</h1>
            <p className="text-gray-500 text-base">Kami siap membantu kapan saja dan dimana saja!</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 bg-[#5981FB] text-white py-3 px-4 font-medium rounded-xl shadow-md hover:bg-blue-700 transition">
              Buat Pengaduan
              <div className="bg-[#1942FF] p-2 rounded-md">
                <FaPlus className="text-white" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
