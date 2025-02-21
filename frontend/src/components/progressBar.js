import React from "react";
import { FaFileAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import {FaGear } from "react-icons/fa6"

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Pengaduan Diterima", icon: <FaFileAlt />, completed: currentStep >= 1 },
    { id: 2, label: "Teknisi Dalam Perjalanan", icon: <FaMapMarkerAlt />, completed: currentStep >= 2 },
    { id: 3, label: "Dalam Perbaikan", icon: <FaGear />, completed: currentStep >= 3 },
    { id: 4, label: "Pengaduan Selesai", icon: <FaCheckCircle />, completed: currentStep >= 4 },
  ];

  return (
    <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto mt-12">
      {/* progress bar */}
      <div className="absolute top-1/3 sm:top-1/3 md:top-1/3 lg:top-1/3 left-1/2 
                w-3/4 sm:w-3/4 md:w-3/4 lg:w-3/4 h-1 bg-gray-300 
                -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-1 bg-blue-600 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>
      </div>

      {/* Step Icons */}
      {steps.map((step) => (
  <div key={step.id} className="relative flex flex-col justify-center items-center w-1/4 sm:w-1/4 md:w-1/5 lg:w-1/4">
    {/* Ikon Step */}
    <div
      className={`relative z-10 flex items-center justify-center 
                  w-8 h-8 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-12 lg:h-12
                  rounded-full border-4 
                  ${step.completed ? "border-blue-600 text-blue-600" : "border-gray-400 text-gray-400"} 
                  bg-white`}
    >
         {React.cloneElement(step.icon, {
        size: 12, 
        className: "sm:size-3 md:size-4 lg:size-5",
      })}
    </div>

          {/* Label Step */}
          <span className="mt-2 text-[7px] sm:text-xs md:text-xs lg:sm text-center">
  {step.label}
</span>

        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
