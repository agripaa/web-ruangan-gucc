import React from "react";
import { FaFileAlt, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const ProgressBar = ({ currentStep }) => {
  if (currentStep === -1) {
    return <h2 className="text-center text-red-500 text-lg font-bold mt-4">Pengaduan tidak ditemukan</h2>;
  }

  const steps = [
    { id: 1, label: "Pengaduan Diterima", icon: FaFileAlt, completed: currentStep >= 1 },
    { id: 2, label: "Teknisi Dalam Perjalanan", icon: FaMapMarkerAlt, completed: currentStep >= 2 },
    { id: 3, label: "Dalam Perbaikan", icon: FaGear, completed: currentStep >= 3 },
    { id: 4, label: "Pengaduan Selesai", icon: FaCheckCircle, completed: currentStep >= 4 },
  ];

  return (
    <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto mt-12 px-4">
      {/* Progress Line - Dibagi berdasarkan jumlah step */}
      <div className="absolute top-5 sm:top-8 lg:top-1/3 transform -translate-y-1/2 w-[80%] sm:w-[50%] md:w-[75%] h-1 flex">
        {steps.map((step, index) => {
          if (index === steps.length - 1) return null; // Tidak ada garis setelah step terakhir
          return (
            <div
              key={index}
              className={`flex-1 transition-all duration-300 ${
                currentStep > index + 1 ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>

      {/* Step Icons */}
      <div className="relative flex w-full justify-around items-center flex-wrap z-10">
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center w-1/4">
            <div
              className={`relative flex items-center justify-center 
                          w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-19 lg:h-19 rounded-full border-4 text-lg
                          ${
                            step.completed
                              ? "border-blue-600 bg-white text-blue-600"
                              : "border-gray-300 bg-white text-gray-300"
                          }`}
            >
              <step.icon
                className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-8 lg:h-8 ${
                  step.completed ? "text-blue-600" : "text-gray-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Label Step */}
      <div className="flex w-full justify-around mt-4 text-[7px] md:text-sm lg:text-md text-center">
        {steps.map((step) => (
          <span key={step.id} className="w-1/4">{step.label}</span>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
