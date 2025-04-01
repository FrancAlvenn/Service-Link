import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      // pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
};

export default CustomToastContainer;
