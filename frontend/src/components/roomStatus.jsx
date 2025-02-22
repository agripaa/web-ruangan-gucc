import React, { useState } from 'react';
import { MdOutlineAvTimer } from "react-icons/md";
import { LuCircleCheckBig } from "react-icons/lu";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const RoomStatus = ({ initialStatus = 'pending' }) => {
  const [status, setStatus] = useState(initialStatus);

  // Mapping status ke data (ikon, teks, dan kelas Tailwind)
  const getStatusData = () => {
    switch (status) {
    case 'pending':
        return { icon: FaGear, text: 'Menunggu Konfirmasi', className: 'bg-green-100 text-green-500' };
    case 'on the way':
        return { icon: FaMapMarkerAlt, text: 'On the way', className: 'bg-yellow-200 text-yellow-500' };
    case 'in progress':
        return { icon: MdOutlineAvTimer, text: 'Dalam Proses', className: 'bg-gray-200 text-gray-500' };
    default:
        return { icon: LuCircleCheckBig, text: 'Selesai', className: 'bg-blue-300 text-blue-500' };
    }
  };

  const statusData = getStatusData();
  const IconComponent = statusData.icon;

  return (
    <div className={`p-1 w-full m-0 rounded-lg flex gap-2 items-center md:items-center md:flex-row ${statusData.className}`}>
      <IconComponent size={10} />
      <p className="text-gray items-center">{statusData.text}</p>
    </div>
  );
};

export default RoomStatus;
