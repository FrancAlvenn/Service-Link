import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Custom ToastContainer with custom styles or props
const CustomToastContainer = () => {
  return (
    <ToastContainer
      icon={null}
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light" // You can customize this or use "light" or "dark"
    />
  );
};

export default CustomToastContainer;
