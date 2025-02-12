import React, { useState, useEffect } from "react";

const SidebarView = ({ open, onClose }) => {
  // Local state to control the open/close animation
  const [isOpen, setIsOpen] = useState(open);

  // Sync local state if the parent changes the open prop
  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div
      className={`fixed top-0 right-0 z-50 w-[650px] h-full p-5 bg-blue-300 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <h2 className="text-xl font-bold mb-4">Sidebar View</h2>
      {/* Your sidebar content goes here */}
      <button
        onClick={handleClose}
        className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default SidebarView;
