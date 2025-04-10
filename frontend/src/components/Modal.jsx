"use client";
import React from "react";

const Modal = ({ isOpen, title, onClose, onSubmit, submitText = "Close", children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/12">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <div className="flex justify-end space-x-3 mt-4">
        {!onSubmit ? (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
             ) : (
              <>
          <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
          </button>
          <button
            type="submit"
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {submitText}
          </button>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
