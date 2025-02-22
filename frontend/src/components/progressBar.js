import React from "react";
import { FaFileAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const ProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Pengaduan Diterima", icon: <FaFileAlt size={16} />, completed: currentStep >= 1 },
    { id: 2, label: "Teknisi Dalam Perjalanan", icon: <FaMapMarkerAlt size={16} />, completed: currentStep >= 2 },
    { id: 3, label: "Dalam Perbaikan", icon: <FaGear size={16} />, completed: currentStep >= 3 },
    { id: 4, label: "Pengaduan Selesai", icon: <FaCheckCircle size={16} />, completed: currentStep >= 4 },
  ];

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto mt-12">
      {/* Progress Bar */}
      <div className="absolute top-1 sm:top-1/2 md:top-1 left-1/2 translate-y-3 md:translate-y-5
                      w-3/4 h-1 bg-gray-300 
                      -translate-x-1/2">
        <div
          className="h-1 bg-blue-600 transition-all duration-300"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>
      </div>

      {/* Step Icons */}
      <div className="relative flex w-full justify-between">
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center w-1/4">
            {/* Ikon Step */}
            <div
              className={`relative flex items-center justify-center 
                          w-8 h-8 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-14 lg:h-14
                          rounded-full border-4 
                          ${step.completed ? "border-blue-600 text-blue-600" : "border-gray-400 text-gray-400"} 
                          bg-white`}    
                
            
            >
              {step.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Label Step */}
      <div className="flex w-full justify-between mt-4">
        {steps.map((step) => (
          <span key={step.id} className="text-[7px] sm:text-base md:text-xs lg:text-sm text-center w-1/4">
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
